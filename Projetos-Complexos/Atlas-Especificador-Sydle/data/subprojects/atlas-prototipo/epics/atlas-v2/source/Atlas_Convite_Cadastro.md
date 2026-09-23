# Módulo: Convite de Cadastro — Atlas (protótipo)

Especificação técnica do sistema de convite para autocadastro de usuários de Parceiros e Clientes.
Backlog Fase 2 — já confirmado por Luis e Paulo Macedo (Discovery 15/06).

*Gerado em 2026-06-17 para implementação no protótipo Atlas V4.*

---

## Visão geral

O Gestor de uma organização (Parceiro ou Cliente) gera um código de convite com validade e cota de usos.
O colaborador acessa o portal, autentica via MT Login ou Gov.br, insere o código e é vinculado à organização.
O Gestor confirma o vínculo antes de ser efetivado.

**Status:** Backlog — Fase 2.
**Quem opera:** Gestor Parceiro ou Gestor Cliente.
**Depende de:** Unidade Organizacional (campo `limiteUsuarios`) + classe de apoio `ConviteCadastro`.

---

## 1. Alterações na classe Unidade Organizacional

### Novo campo

| Campo | ID | Tipo | Obrig. | Aba | Regra |
|---|---|---|---|---|---|
| Limite de usuários | `patlasv4proto-uo-limite-usuarios` | number | Não | Usuários | Quantidade máxima de usuários que esta unidade pode ter cadastrados. Vazio = sem limite. Apenas unidades raiz (Empresa = Sim) devem ter esse campo visível |

### Novo método na aba Usuários

| Método | ID | Tipo | Exibição | Contexto |
|---|---|---|---|---|
| Gerar Código de Convite | `gerarCodigoConvite` | Método via Tela | Destacado (botão no header do objeto) | Sobre o Objeto (publicado) |

Ícone sugerido: `card_giftcard` ou `link`
Nível de acesso: Explícito → Grupos: Gestor Parceiro, Gestor Cliente, Gestor MTI

---

## 2. Classe de apoio: ConviteCadastro

Cada execução bem-sucedida do método `gerarCodigoConvite` cria um objeto desta classe.

### Identificador da classe
`cls-patlasv4-proto-convite`
Formulário: `form-patlasv4-proto-convite-cadastro`
Pacote: Cadastro base
Objetos buscáveis: Não (formulário embutido / auxiliar)

### Campos

| Campo | ID | Tipo | Obrig. | Regra |
|---|---|---|---|---|
| Unidade Organizacional | `patlasv4proto-convite-uo` | referência → UO | Sim | Unidade que gerou o convite. Preenchida automaticamente pelo método |
| Código | `patlasv4proto-convite-codigo` | text | Sim | Alfanumérico, 8 caracteres. Gerado automaticamente (script). Ex.: A3F7K2MX |
| Link de cadastro | `patlasv4proto-convite-link` | text | Sim | URL completa com o código embutido. Gerada automaticamente |
| Quantidade de usos permitidos | `patlasv4proto-convite-qtd-usos` | number | Sim | Definida pelo Gestor no formulário de entrada do método. Mínimo: 1 |
| Quantidade de usos realizados | `patlasv4proto-convite-usos-realizados` | number | Auto | Incrementado a cada cadastro confirmado. Inicia em 0 |
| Data/hora de expiração | `patlasv4proto-convite-expiracao` | dateTime | Sim | Definida pelo Gestor no formulário de entrada. Deve ser futura em relação ao momento da geração |
| Gerado por | `patlasv4proto-convite-gerado-por` | referência → Servidor | Auto | Servidor logado no momento da execução do método |
| Data/hora de geração | `patlasv4proto-convite-gerado-em` | dateTime | Auto | Timestamp da execução do método |
| Ativo | `patlasv4proto-convite-ativo` | boolean | Sim | Sim = convite válido e aceitando cadastros. Ao gerar novo convite, o anterior é inativado automaticamente |
| Observação | `patlasv4proto-convite-observacao` | text | Não | Campo livre para o Gestor registrar o contexto do convite |

### Regras de validação da classe

| Código | Regra |
|---|---|
| RN-CONV-01 | Convite expirado (Data/hora de expiração < agora) não aceita novos cadastros, mesmo com usos disponíveis |
| RN-CONV-02 | Convite esgotado (Usos realizados ≥ Quantidade de usos permitidos) não aceita novos cadastros |
| RN-CONV-03 | Ao gerar novo convite para a mesma UO, o convite anterior é automaticamente inativado (Ativo = Não) |
| RN-CONV-04 | Convite só pode ser gerado por Gestor da própria organização ou Administrador MTI |
| RN-CONV-05 | O código gerado deve ser único no sistema no momento da geração |

---

## 3. Método: Gerar Código de Convite

### Formulário de entrada (_input)

Acionado ao clicar no botão "Gerar Código de Convite" na aba Usuários da UO.

| Campo de entrada | Tipo | Obrig. | Comportamento |
|---|---|---|---|
| Convite ativo existente (somente leitura) | Área informativa | — | Se já existir convite ativo para esta UO: exibe o código atual, link, usos realizados/permitidos e data de expiração. Texto: "Convite atual: [CÓDIGO] — [X] de [Y] usos — Expira em [DATA HORA]" |
| Gerar novo link? | boolean | Sim | Padrão: Não. Se Não: exibe o convite atual e encerra (botão Copiar Link). Se Sim: exibe os campos abaixo |
| Quantidade de usos | number | Sim (quando Gerar novo = Sim) | Mínimo 1. Validação contra `limiteUsuarios` da UO: se (usos_realizados_atuais + quantidade_solicitada) > limiteUsuarios → exceção impeditiva |
| Data/hora de expiração | dateTime | Sim (quando Gerar novo = Sim) | Deve ser futura. Sugestão de padrão: +24h a partir do momento atual |
| Observação | text | Não | Campo livre para contexto do convite |

### Comportamento do script (_get)

```
1. Busca convite ativo existente para esta UO (ConviteCadastro onde uo = this AND ativo = true)
2. Se encontrou E "Gerar novo link?" = Não:
   → Preenche o formulário de saída com os dados do convite ativo
   → Exibe botão "Copiar Link"
   → Encerra

3. Se "Gerar novo link?" = Sim:
   → Valida quantidade de usos contra limiteUsuarios da UO
   → Se inválido: lança exceção com mensagem "Quantidade excede o limite disponível para esta unidade."
   → Inativa convite anterior (ativo = false)
   → Gera código alfanumérico único de 8 caracteres
   → Monta link: [BASE_URL]/cadastro?convite=[CODIGO]
   → Cria novo objeto ConviteCadastro com todos os campos preenchidos
   → Registra na Timeline da UO: "Código de convite gerado por [SERVIDOR] para [N] usuários. Expira em [DATA HORA]."
```

### Formulário de saída (_output)

| Campo de saída | Tipo | Descrição |
|---|---|---|
| Código gerado | text (somente leitura) | O código alfanumérico gerado |
| Link de cadastro | text (somente leitura) | URL completa com botão "Copiar" ao lado |
| Vagas disponíveis | text (somente leitura) | "[N] usos disponíveis — expira em [DATA HORA]" |
| Mensagem de sucesso | text (somente leitura) | "Código gerado com sucesso. Compartilhe o link com os colaboradores." |

---

## 4. Fluxo de autocadastro (portal do colaborador)

Este fluxo é externo ao backoffice — acontece no Portal de Serviços do SYDLE ONE.

### Etapa 1 — Autenticação

O colaborador acessa o portal e clica em "Entrar via MT Login" ou "Entrar via Gov.br".
Após autenticação: nome e CPF são extraídos automaticamente da identidade digital.
Dados exibidos como somente leitura no formulário seguinte.

### Etapa 2 — Inserção do código

| Campo | Tipo | Obrig. | Regra |
|---|---|---|---|
| Nome (somente leitura) | text | — | Extraído do MT Login / Gov.br |
| CPF (somente leitura) | text | — | Extraído do MT Login / Gov.br |
| Código de convite | text | Sim | 8 caracteres. Ao confirmar: sistema valida código (existe? ativo? não expirado? com usos disponíveis?) |

### Validações no envio

| Código | Regra |
|---|---|
| RN-CONV-06 | Código não encontrado → "Código inválido. Verifique e tente novamente." |
| RN-CONV-07 | Código expirado → "Este código de convite expirou. Solicite um novo ao gestor da sua organização." |
| RN-CONV-08 | Código esgotado → "Este código atingiu o número máximo de usos. Solicite um novo ao gestor." |
| RN-CONV-09 | CPF já vinculado à organização → "Você já está vinculado a esta organização." |
| RN-CONV-10 | CPF já vinculado a outra organização do mesmo tipo → exibir aviso e permitir prosseguir (validar com Luis) |

### Etapa 3 — Resultado

Ao enviar com código válido:
- Incrementa `usos_realizados` no ConviteCadastro
- Cria registro de SolicitaçãoVínculo (pendente de confirmação)
- Exibe: "Solicitação enviada! Aguarde a confirmação do gestor da sua organização."
- Gestor recebe item no Inbox para aprovação

---

## 5. Fluxo de confirmação (Inbox do Gestor)

### Card de confirmação no Inbox

| Campo | Tipo | Exibição |
|---|---|---|
| Nome do colaborador | text | Campo de identidade — destaque |
| CPF | text | Campo de destaque |
| Foto (se disponível) | imagem | Extraída do login |
| Organização solicitada | referência → UO | — |
| Data da solicitação | dateTime | — |
| Código de convite utilizado | text | Para rastreabilidade |

### Métodos disponíveis no card

| Método | Ação |
|---|---|
| Confirmar Vínculo | Cria o Servidor vinculado à Pessoa (usando dados do MT Login/Gov.br). Vincula o Servidor como Ocupante do Cargo padrão da UO (se configurado). Pessoa passa a constar na aba Usuários da UO |
| Recusar | Cancela a solicitação. Campo Motivo obrigatório. Notifica o colaborador |

---

## 6. Aba Usuários da UO — estado final

Após a implementação, a aba Usuários da Unidade Organizacional deve exibir:

| Seção | Conteúdo |
|---|---|
| Cabeçalho | Campo `limiteUsuarios` (leitura) + contador "X de Y usuários cadastrados" |
| Botão destacado | "Gerar Código de Convite" (método via tela) |
| Lista de usuários | Servidores vinculados à UO com nome, cargo, condição e data de vínculo |
| Convite ativo | Card compacto mostrando: código mascarado, usos realizados/permitidos, data de expiração, botão "Copiar Link" |

---

## 7. Referências de implementação no SYDLE ONE

| Componente | Como implementar |
|---|---|
| Campo `limiteUsuarios` | Campo tipo Número na classe UO — pacote Cadastro base |
| Classe `ConviteCadastro` | Nova classe tipo Padrão no pacote Cadastro base. Objetos buscáveis: Não |
| Método `gerarCodigoConvite` | Método via Tela na classe UO. Contexto: Sobre o Objeto. Exibição: Destacado |
| Geração do código 8 chars | Script no `_get`: `Math.random().toString(36).substring(2, 10).toUpperCase()` |
| Validação de cota | Script no `_get`: comparar `limiteUsuarios` com soma de `usuariosAtivos + qtdSolicitada` |
| Inativação do convite anterior | Script no `_get`: buscar ConviteCadastro ativo da UO e setar `ativo = false` antes de criar novo |
| Timeline da UO | Usar método nativo de post na timeline do objeto (disponível via API interna SYDLE) |
| Fluxo de autocadastro | Service Desk do portal: criar item de catálogo "Vincular-se a uma Organização" com formulário BPM |
| Inbox do Gestor | Tarefa de usuário (User Task) no processo BPM disparado pela solicitação de vínculo |
| Confirmar Vínculo | Script do método: criar Servidor + Pessoa com dados do MT Login, vincular à UO |

---

## 8. Pendências para validação com Luis antes de implementar

| # | Ponto | Impacto |
|---|---|---|
| P-CONV-01 | Confirmar se o campo `limiteUsuarios` é necessário ou se o controle é apenas pelo código (cota por convite, não por UO) | Define se o campo vai para a UO ou apenas para o ConviteCadastro |
| P-CONV-02 | Definir cargo padrão atribuído ao colaborador após confirmação do vínculo | Método Confirmar Vínculo precisa saber qual Cargo e Condição atribuir |
| P-CONV-03 | Colaborador com CPF já vinculado a outra organização: bloquear ou permitir múltiplos vínculos? | RN-CONV-10 |
| P-CONV-04 | Notificação por e-mail ao colaborador após confirmação ou recusa | Integração com e-mail do SYDLE ONE |
