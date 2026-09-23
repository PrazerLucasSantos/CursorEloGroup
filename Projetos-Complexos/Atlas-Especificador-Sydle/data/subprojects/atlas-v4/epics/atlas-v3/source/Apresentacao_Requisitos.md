# Atlas V3 — Fase 3 — Apresentação de Requisitos

*Estrutura alinhada ao documento Requisitos Atlas.docx: Para que serve → História → RF → RN → Campos → Exemplo.*

*Fontes: PEAP 0001/2025, 31 arquivos em Fontes de Dados, Discovery 15/06, checkpoints jun/2026.*

---

# Catálogo — Fase 3

## F3 Catálogo de Produtos/Serviços

### Para que serve

Catálogo de produtos/serviços por parceria — planilha DIRC, homologação DIREX.

### História de Usuário

Como gestor parceiro, quero cadastrar produtos no catálogo, para seleção em propostas.

### Requisitos Funcionais

- RF-CAT-01: Estrutura DIRC completa.
- RF-CAT-02: Homologação MTI antes de produção.
- RF-CAT-03: Upload CSV.
- RF-CAT-04: Códigos Protheus/SIAG.

### Regras de Negócio

- RN-CAT-01: Parceiro alimenta homologação; MTI atesta.
- RN-CAT-02: Produto pertence a um catálogo.

### Campos da tela

*Formulário: `form-atlas-f3-catalogo-produto-servico` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Parceiro cadastra licença Sydle — DIREX homologa — disponível na proposta.

---

## F3 Catálogo Universal

### Para que serve

Catálogo universal (moeda licença/serviço) consolidando produtos para cobrança resumida.

### História de Usuário

Como gestor comercial, quero contratar pacote universal, para simplificar faturamento.

### Requisitos Funcionais

- RF-CU-01: Consolidador de produtos.
- RF-CU-02: Licença vs Serviço.
- RF-CU-03: Códigos Protheus/SIAG.

### Regras de Negócio

- RN-CU-01: Analogia conta telefone — resumo vs detalhamento (Luiz 01/06).

### Campos da tela

*Formulário: `form-atlas-f3-catalogo-universal` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Nome | Catálogo geral (moeda de licenciamento/serviço). Ex.: MTI Simplifica — Serviços em Simplificação. Fonte: Gabriel 01/06, PEAP F3. |
| Tipo | Licença usa métrica; Serviço usa HST/complexidade. |
| Código Protheus | Inteiro, via integração F3. Luiz 01/06. |
| Código SIAG | Inteiro. Planilha DIRC. |

### Exemplo de Utilização

MTI Simplifica Universal — consolida 40 serviços — valor único na proposta.

---

# Fluxo operacional — Fase 3

## F3 Item catálogo na Proposta

### Para que serve

Linha de item da proposta referenciando catálogo — preço e métrica travados.

### História de Usuário

Como gestor, quero selecionar itens do catálogo homologado, para proposta comercial precisa.

### Requisitos Funcionais

- RF-PIC-01: Vínculo catálogo.
- RF-PIC-02: Preço somente leitura.
- RF-PIC-03: RF04 cláusulas condicionais.

### Regras de Negócio

- RN-PIC-01: RN03 preço congelado na abertura.
- RN-PIC-02: Nunca texto livre quando catálogo F3 ativo.

### Campos da tela

*Formulário: `form-atlas-f3-proposta-item-catalogo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Item catálogo v8.4 Simplifica — R$ 1.400.000 — qty 1.

---

# Integrações — Fase 3

## F3 Integração Protheus

### Para que serve

API Protheus — contrato assinado, pedido venda, dados cadastro, NF/DAR.

### História de Usuário

Como financeiro, quero integrar contratos ao Protheus, para registro financeiro.

### Requisitos Funcionais

- RF-PROT-01: Enviar contrato pós-assinatura.
- RF-PROT-02: Protocolo retorno.
- RF-PROT-03: Preencher IE/IM cadastro.
- RF-PROT-04: Reenvio em erro.

### Regras de Negócio

- RN-PROT-01: Sem billing completo F1.
- RN-PROT-02: Luiz 18/06 — dados cadastro F3+.

### Campos da tela

*Formulário: `form-atlas-f3-integracao-protheus` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Endpoint API | F3: envio contrato assinado, retorno protocolo. PEAP, Luiz 18/06. |
| Protocolo retorno | Preenchido após sucesso da integração. |
| Status integração | Erro permite reenvio manual. |

### Exemplo de Utilização

Contrato assinado → API Protheus → protocolo 998877.

---

## F3 Integração ServiceNow

### Para que serve

Integração SNOW para projetos técnicos (output) — separado do Dossiê EV.

### História de Usuário

Como DTIC, quero registrar projeto técnico no SNOW, para execução operacional.

### Requisitos Funcionais

- RF-SN-01: Campo nº projeto.
- RF-SN-02: Trigger entrega.

### Regras de Negócio

- RN-SN-01: Não confundir com Projeto Atlas (homologação/entrega).

### Campos da tela

*Formulário: `form-atlas-f3-integracao-servicenow` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Nº projeto ServiceNow | F3: output técnico separado do Dossiê EV (outcome). Luiz 15/06. |
| Trigger entrega SNOW | Dispara registro de entrega técnica. |

### Exemplo de Utilização

OS assinada → nº SNOW PRJ001 — entrega técnica registrada.

---

## F3 Pedido de venda automático

### Para que serve

Automação de pedidos de venda Protheus por classe de cobrança.

### História de Usuário

Como financeiro, quero pedidos automáticos mensais/anuais, para reduzir trabalho manual.

### Requisitos Funcionais

- RF-PV-01: Classes Sob demanda/Mensal/Anual/Pro-rata.
- RF-PV-02: Agrupamento por contrato.
- RF-PV-03: Envio automático.

### Regras de Negócio

- RN-PV-01: Consumo mês N cobrado mês N+3 (PEAP).

### Campos da tela

*Formulário: `form-atlas-f3-pedido-venda-automatico` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Classe de cobrança | PEAP F2/F3: designação Protheus por produto. |
| Envio automático | Recorrente mensal/anual/pro-rata. |

### Exemplo de Utilização

Licença mensal — pedido automático todo dia 1.

---

## F3 Central de Notas Fiscais e DAR

### Para que serve

Central de NF e DAR para clientes — download, notificação, comprovante.

### História de Usuário

Como cliente, quero baixar NF e DAR e informar pagamento, para transparência fiscal.

### Requisitos Funcionais

- RF-NF-01: Download NF/DAR.
- RF-NF-02: Notificação e-mail.
- RF-NF-03: Upload comprovante.

### Regras de Negócio

- RN-NF-01: Integração Protheus PEAP F2.

### Campos da tela

*Formulário: `form-atlas-f3-central-nf-dar` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Nota Fiscal | F3 PEAP: download NF + DAR via Protheus. |
| DAR | Documento de arrecadação para pagamento pelo cliente. |
| Comprovante pagamento | Upload pelo cliente — status Pago informado. |

### Exemplo de Utilização

Cliente baixa DAR — paga — upload comprovante — status Pago informado.

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
