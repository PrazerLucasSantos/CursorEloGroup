# Atlas V2 — Fase 2 — Apresentação de Requisitos

*Estrutura alinhada ao documento Requisitos Atlas.docx: Para que serve → História → RF → RN → Campos → Exemplo.*

*Fontes: PEAP 0001/2025, 31 arquivos em Fontes de Dados, Discovery 15/06, checkpoints jun/2026.*

---

# Cadastro base — Fase 2

## F2 Convite de cadastro

### Para que serve

Gestor gera código/link de convite para cadastro self-service de usuários parceiro/cliente.

### História de Usuário

Como gestor parceiro, quero convidar usuários com código limitado, para autogestão.

### Requisitos Funcionais

- RF-CV-01: Código 6-8 caracteres.
- RF-CV-02: Validade 24h e usos limitados.
- RF-CV-03: Confirmação gestor pós-cadastro.
- RF-CV-04: Lote de convites.

### Regras de Negócio

- RN-CV-01: Convite expirado invalida cadastro.

### Campos da tela

*Formulário: `form-atlas-f2-convite-cadastro` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Gestor gera 12 códigos — analista usa código — gestor confirma.

---

## F2 Produto/Parceria no CO

### Para que serve

Campo Produto/Parceria no CO — visível quando catálogo homologado.

### História de Usuário

Como gestor, quero vincular parceria ao CO, para filtrar catálogo.

### Requisitos Funcionais

- RF-PP-01: Campo parceria no CO.
- RF-PP-02: Oculto até F2/F3.

### Regras de Negócio

- RN-PP-01: Relaciona catálogo F3.

### Campos da tela

*Formulário: `form-atlas-f2-co-produto-parceria` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Parceria | F2: campo oculto em F1 no protótipo; visível quando parceiro tiver catálogo homologado. |

### Exemplo de Utilização

CO parceiro Simplifica — parceria MTI Simplifica selecionada.

---

# Portal — Fase 2

## F2 Portal de vínculo organizacional

### Para que serve

Portal Atlas/Simplifica — login Gov.br/MT Login e solicitação de serviços.

### História de Usuário

Como cidadão/servidor, quero acessar portal e iniciar solicitação, para contratar serviços MTI.

### Requisitos Funcionais

- RF-PT-01: Login federado.
- RF-PT-02: Carta de serviços.
- RF-PT-03: Fluxo para proposta.

### Regras de Negócio

- RN-PT-01: Ambiente separado Simplifica (26/05).

### Campos da tela

*Formulário: `form-atlas-f2-portal-vinculo-organizacao` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| *(ver forms.json)* | Todos os campos do protótipo enriquecidos com spec completo |

### Exemplo de Utilização

Login Gov.br → serviço Simplifica → nova proposta.

---

## F2 Notificações de documentos

### Para que serve

Configuração de alertas de vencimento de documentos e badge no header.

### História de Usuário

Como gestor, quero ser alertado antes do vencimento de documentos, para manter conformidade.

### Requisitos Funcionais

- RF-ND-01: Badge header.
- RF-ND-02: E-mail automático.
- RF-ND-03: Dias antecedência configurável.

### Regras de Negócio

- RN-ND-01: OCR vencimento pode automatizar F2+.

### Campos da tela

*Formulário: `form-atlas-f2-notificacao-documento` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Tipo de notificação | F2: badge no header e e-mail. Fonte: Luiz 15/06 Discovery. |
| Dias de antecedência | Quantos dias antes do vencimento disparar alerta. |
| Destinatário | E-mail ou perfil MTI/parceiro/cliente. |

### Exemplo de Utilização

Documento vence em 15 dias — badge vermelho — e-mail gestor.

---

## F2 Integração Gov.br / MT Login

### Para que serve

Integração OAuth Gov.br e MT Login para preenchimento automático de pessoa.

### História de Usuário

Como usuário, quero login federado, para não redigitar CPF e nome.

### Requisitos Funcionais

- RF-IG-01: OAuth Gov.br.
- RF-IG-02: OAuth MT Login.
- RF-IG-03: Sync CPF/nome/e-mail.

### Regras de Negócio

- RN-IG-01: Credenciais ambiente Sido/MTI.

### Campos da tela

*Formulário: `form-atlas-f2-integracao-gov-mtlogin` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Provedor | F2: preenchimento automático de pessoa via login federado. Fonte: Luiz 01/06, Pablo 15/06. |
| Client ID | Credencial OAuth — ambiente Sido/MTI. |
| Integração ativa | Habilita sync de CPF, nome, e-mail na criação de pessoa. |

### Exemplo de Utilização

Login Gov.br → campos pessoa preenchidos automaticamente.

---

## F2 Painel gestor externo

### Para que serve

Painel autogestão triplice PEAP F2 — visão parceiro/cliente de usuários e convites.

### História de Usuário

Como gestor parceiro, quero gerenciar usuários da minha organização, para autogestão.

### Requisitos Funcionais

- RF-PG-01: Listar usuários org.
- RF-PG-02: Gerenciar convites.
- RF-PG-03: Visão segregada por parceiro.

### Regras de Negócio

- RN-PG-01: Parceiro vê só sua organização.

### Campos da tela

*Formulário: `form-atlas-f2-painel-gestor-externo` — campos detalhados no `forms.json` do épico (campo `spec` de cada field).*

| Campo | Detalhe |
|-------|---------|
| Organização | Parceiro ou Cliente — gestor vê só sua organização. PEAP Fase 2 painel autogestão. |
| Usuários vinculados | Lista somente leitura; cadastro via convite ou solicitação. |

### Exemplo de Utilização

Gestor EloGroup convida 3 analistas — confirma cadastros.

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
