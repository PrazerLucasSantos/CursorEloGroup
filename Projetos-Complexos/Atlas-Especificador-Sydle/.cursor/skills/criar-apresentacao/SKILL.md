---
name: criar-apresentacao
description: >-
  Modelar apresentações de fluxo no Espec (flows.json): tipos de etapa HTML, BPMN,
  Método, portal de serviços, workspace e Classe; criar em falta formulários (classes),
  workspaces e portais no épico antes de referenciá-los; campos por tipo; ordem com
  criar-classe e criar-workspace. Use quando o utilizador pedir apresentação, fluxo
  narrativo, slides de processo, flows.json ou exportação de apresentação.
paths:
  - "Espec/data/**/flows.json"
  - "Espec/src/types.ts"
  - "Espec/src/components/FlowStepConfigPanel.tsx"
  - "Espec/src/types/epicPresentationBundle.ts"
---

# Criar apresentação — Espec (TJCE)

No projecto, uma **apresentação** é um **fluxo** (`FlowListItem`) em `flows.json`, com **etapas** (`FlowStep`). Cada etapa tem um **`type`** (`FlowActivityType`) que define o modo de preview no canvas e na exportação.

Referência de tipos: `FlowStep`, `FlowActivityType` em `Espec/src/types.ts`; UI de configuração: `FlowStepConfigPanel.tsx`.

---

## Leitura rápida para IA (ordem de trabalho)

1. Definir **objetivo da apresentação** (história do processo, audiência).
2. Inventariar cada etapa do fluxo planeada e **resolver dependências no épico antes de gravar `flows.json`** — ver [Regra obrigatória](#regra-obrigatória-criar-entidades-em-falta).
3. Garantir **entidades do épico** necessárias (criar o que faltar):
   - **Classe / formulário** → `forms.json` ([criar-classe](../criar-classe/SKILL.md)) sempre que uma etapa `bpmnActivity`, `method` ou `class` use `linkedFormId` e ainda não existir formulário adequado.
   - **Workspace** → `workspaces.json` ([criar-workspace](../criar-workspace/SKILL.md)) sempre que existir etapa `workspace` com `linkedWorkspaceId` e ainda não existir workspace adequado no épico.
   - **Portal** → `portals.json` (`ServicePortalDef` em `types.ts`) sempre que existir etapa `servicePortal` que dependa de `linkedServicePortalId` (ou definição reutilizável de home) e ainda não existir entrada correspondente.
4. Criar ou editar **`flows.json`**: um fluxo com `name`, `steps` ordenadas; cada passo com `id`, `title`, `type` coerente; referências apenas a ids já existentes no mesmo épico.
5. Preencher campos específicos do tipo de cada etapa (secções abaixo).
6. Validar JSON e ids referenciados (`linkedFormId`, `linkedWorkspaceId`, `linkedServicePortalId`, `bpmnFormConfirmNavigateStepId`).

---

## Regra obrigatória: criar entidades em falta

Sempre que se **cria ou actualiza uma apresentação** (`flows.json`), o agente deve garantir que **nada fica a apontar para o vazio**:

| Se a etapa precisar de… | E no épico ainda não existir… | Acção |
|-------------------------|-------------------------------|--------|
| `linkedFormId` (etapas `bpmnActivity`, `method` ou `class` com formulário) | `FormDef` adequado | **Criar a classe** em `forms.json` seguindo [criar-classe](../criar-classe/SKILL.md), depois referenciar o `id`. |
| `linkedWorkspaceId` (etapa `workspace`) | `WorkspaceDef` adequado | **Criar o workspace** em `workspaces.json` seguindo [criar-workspace](../criar-workspace/SKILL.md), depois referenciar o `id`. |
| `linkedServicePortalId` (etapa `servicePortal` em modo reutilizável) ou portal como recurso partilhado | entrada em `portals.json` | **Criar o portal** como `ServicePortalDef` (mínimo: `id`, `name`; campos de home conforme `types.ts` e necessidade da narrativa). |

**Não** finalizar o fluxo com `linkedFormId`, `linkedWorkspaceId` ou `linkedServicePortalId` inválidos ou em falta. Etapas só **HTML** não exigem estas entidades.

Ordem prática: **forms / workspaces / portals** → depois **`flows.json`**.

---

## Onde gravar

- Ficheiro: `Espec/data/subprojects/<subproject>/epics/<epic>/flows.json`
- Formato: **array** de fluxos (`FlowListItem[]`).
- Cada fluxo: `id`, `name`, `steps?: FlowStep[]`.

---

## Modelo base

### `FlowListItem`

| Campo | Obrigatório | Função |
|-------|-------------|--------|
| `id` | sim | Identificador único do fluxo no épico |
| `name` | sim | Nome listado na UI |
| `steps` | recomendado | Lista ordenada de etapas |

### `FlowStep` (comum)

| Campo | Obrigatório | Função |
|-------|-------------|--------|
| `id` | sim | Identificador único da etapa **dentro do fluxo** |
| `title` | sim | Título da etapa na lista / cabeçalhos |
| `type` | ver nota | `html` \| `bpmnActivity` \| `method` \| `servicePortal` \| `workspace` \| `class` — define o tipo de apresentação |

**Nota:** na primeira gravação o `type` pode estar ausente até o utilizador escolher na UI; ao gerar JSON manualmente, incluir sempre `type`.

---

## Os tipos de etapa (apresentação)

Seguem-se os tipos suportados pela UI (`FlowActivityType` em `types.ts`). Legado: `activity` no JSON pode ser normalizado para `bpmnActivity` na leitura.

### 1. `html` — HTML livre

**Uso:** conteúdo estático ou incorporado (texto, imagens, iframes de diagramas, vídeos).

| Campo | Função |
|-------|--------|
| `htmlContent` | HTML da etapa (corpo principal). |
| `htmlPresentationShowHeader` | Se `true`, mostra header com estilo alinhado às outras etapas (sem linha de tipo nem faixa de papel). |
| `htmlPresentationHeaderTitle` | Título no header quando `htmlPresentationShowHeader` está activo. |

**Boas práticas:** conteúdo acessível; iframes com dimensões razoáveis; diagramas BPMN podem ser embed (ex. draw.io) para complementar narrativa.

---

### 2. `bpmnActivity` — Atividade BPMN

**Uso:** representar **tarefa de processo** com formulário opcional, papel, regras, SLA e prototipação de navegação.

#### Secção **Atividade**

| Campo | Função |
|-------|--------|
| `bpmnActivityKey` | Nome curto da atividade (identificação no fluxo). |
| `bpmnTaskType` | `userTask` (atividade de utilizador) ou `entryForm` (formulário de entrada / foco em coleta). |
| `bpmnDescription` | Objetivo e contexto da etapa (texto livre). |

#### Secção **Formulário**

| Campo | Função |
|-------|--------|
| `linkedFormId` | `FormDef.id` do **mesmo épico** — formulário associado à atividade. |
| `bpmnFormConfirmNavigateStepId` | **Só prototipação no preview:** ao usar o botão verde de confirmação do formulário, saltar para o `id` desta etapa **no mesmo fluxo**. Não substitui motor de processo real. |

#### Secção **Atores**

| Campo | Função |
|-------|--------|
| `assigneeRole` | Papel / responsável (ex. código ou nome do papel). |
| `assigneeRoleDetail` | Quem é o ator, origem, regras de atendimento (multilinha). |

#### Secção **Entradas e saídas**

| Campo | Função |
|-------|--------|
| `bpmnInputs` | Entradas necessárias (documentos, dados). |
| `bpmnOutputs` | Saídas produzidas. |

#### Secção **Regras**

| Campo | Função |
|-------|--------|
| `bpmnRuleList` | Lista de regras de negócio (preferido; uma string por regra). |
| `bpmnRules` | **Legado:** texto corrido; migração reparte em linhas — preferir `bpmnRuleList`. |

**Âmbito das regras na etapa BPMN:** `bpmnRuleList` / regras aqui documentadas referem-se à **atividade como um todo** — alçadas, pré-requisitos do passo, decisões de processo, políticas que envolvem o papel ou o fluxo em torno da tarefa. **Não** duplicar aqui regras que valem só para **campos concretos** do formulário (formato, obrigatoriedade condicional, visibilidade por opção, etc.): essas ficam no próprio **`FormDef`** (`fieldVisibilityRules`, `spec`, validações descritas por campo; ver [criar-classe](../criar-classe/SKILL.md)).

#### Secção **Transições / rotas**

| Campo | Função |
|-------|--------|
| `bpmnPossiblePaths` | Lista `{ key, value }` — condição de saída → destino descritivo (próxima etapa ou nome de atividade). |
| `bpmnTransitionApproved` / `bpmnTransitionRejected` | **Legado:** preferir `bpmnPossiblePaths` ou `bpmnRuleList`. |

#### Secção **SLA**

| Campo | Função |
|-------|--------|
| `bpmnSla` | Prazo / SLA para concluir a atividade. |
| `bpmnSlaIfExceeded` | Comportamento se o SLA for ultrapassado. |

#### Secção **Eventos**

| Campo | Função |
|-------|--------|
| `bpmnOnStartEvent` | Evento ao iniciar a atividade (descrição). |
| `bpmnOnCompleteEvent` | Evento ao concluir a atividade (descrição). |

**Skill relacionada:** criar ou alinhar formulários com [criar-classe](../criar-classe/SKILL.md) antes de referenciar `linkedFormId`.

---

### 3. `method` — Método

**Uso:** mesmo modelo narrativo e de dados que **`bpmnActivity`** (formulário, papel, regras, caminhos, prototipação com botão verde), mas na configuração da etapa **não** existem as secções **Entradas e saídas**, **SLA** nem **Eventos**. No preview do detalhamento da atividade, esses blocos também não são mostrados.

O hero do preview usa o prefixo **«Método · …»** e distingue visualmente o modo do formulário (entrada vs saída).

#### Secções partilhadas com `bpmnActivity`

As secções **Atividade**, **Formulário** (exceto nota abaixo), **Atores**, **Regras de negócio** e **Caminhos possíveis** usam os **mesmos campos** descritos em [Atividade BPMN](#2-bpmnactivity--atividade-bpmn), incluindo:

| Campo | Função |
|-------|--------|
| `bpmnActivityKey`, `bpmnTaskType`, `bpmnDescription` | Igual à etapa BPMN. |
| `linkedFormId` | `FormDef.id` do mesmo épico. |
| `bpmnFormConfirmNavigateStepId` | Prototipação com botão verde — **apenas** quando `methodFormType` não for saída (ver abaixo). |
| `assigneeRole`, `assigneeRoleDetail` | Igual. |
| `bpmnRuleList`, `bpmnPossiblePaths` | Igual. |

Campos **opcionais no JSON** (`bpmnInputs`, `bpmnOutputs`, `bpmnSla`, `bpmnOnStartEvent`, etc.) podem existir por legado ou cópia; na UI de etapa **Método** não há edição dedicada para esses grupos.

#### Secção **Formulário** — tipo de formulário (específico do `method`)

| Campo | Função |
|-------|--------|
| `methodFormType` | `input` (omisso) — **Formulário de entrada**: preview como modo edição, com botões decorativos vermelho/verde. `output` — **Formulário de saída**: mesma base visual do formulário em modo edição, mas **somente leitura** e **sem** botões vermelho/verde; não faz sentido definir `bpmnFormConfirmNavigateStepId` (a UI omite essa prototipação). |

**Skill relacionada:** [criar-classe](../criar-classe/SKILL.md) para o `linkedFormId`.

---

### 4. `servicePortal` — Portal de serviços

**Uso:** simular **portal** (landing ou serviço) integrado ao processo.

Definir primeiro o **subtipo** com `servicePortalSubtype`:

| Valor | Significado |
|-------|-------------|
| `homePage` | Página inicial / vitrine (hero, secções, catálogo). |
| `service` | Um serviço específico (ficha de serviço). |

#### Portal reutilizável (recomendado)

| Campo | Função |
|-------|--------|
| `linkedServicePortalId` | Id de entrada em **`portals.json`** do épico (`ServicePortalDef`). Quando definido, o conteúdo da página inicial pode vir da definição reutilizável em vez de duplicar campos na etapa. |
| `servicePortalPresentationDescription` | Texto de contexto no preview **entre** o bloco de papel e o canvas do portal (como o objetivo na BPMN). |

#### Campos típicos de **página inicial** (inline ou mesclados com `ServicePortalDef`)

Incluem: `servicePortalHomeHeroTitle`, `servicePortalHomeHeroSubtitle`, `servicePortalHomeSearchPlaceholder`, `servicePortalHeaderMenuOptions`, `servicePortalHeaderNotificationCount`, `servicePortalHeaderUserInitials`, cores (`servicePortalHomeColorPrimary`, etc.), `servicePortalHomeLogoUrl`, `servicePortalHomeCoverImageUrl`, `servicePortalHomeSections` (catálogo ou HTML), e legados `servicePortalCatalogs` / `servicePortalCatalogServices`.

#### Campos típicos de **serviço** (`service`)

| Campo | Função |
|-------|--------|
| `servicePortalServiceName` | Nome amigável do serviço |
| `servicePortalServiceCode` | Código no catálogo |
| `servicePortalServiceEntryUrl` | URL/rota de entrada |
| `servicePortalServiceSummary` | Resumo / proposta de valor |
| `servicePortalServiceSla` | SLA esperado |
| `servicePortalServiceOwnerArea` | Área responsável |

**Atores:** `assigneeRole` e `assigneeRoleDetail` podem documentar o papel no preview.

**Entidades:** modelar portais reutilizáveis em **`portals.json`**; tipos em `ServicePortalDef` / `ServicePortalHomePageData` em `types.ts`.

---

### 5. `workspace` — Workspace (Explorer)

**Uso:** mostrar o **Explorer** com pacotes, classes e (quando há formulário + presets) **listagem de objetos de exemplo**.

| Campo | Função |
|-------|--------|
| `linkedWorkspaceId` | Id em **`workspaces.json`** do épico (`WorkspaceDef.id`). |
| `workspacePresentationDescription` | Texto de contexto no preview entre papel e o Explorer. |
| `workspaceMethodNavigateStepIds` | Mapa **chave → id de etapa** no mesmo fluxo: chave = `packageId::classId::methodId` (ids do workspace + `FormMethod.id`). Ao clicar num método no preview (modo leitura), navega para essa etapa — **prototipação**. |
| `assigneeRole`, `assigneeRoleDetail` | Papel / descrição no preview (opcional). |

**Skill relacionada:** [criar-workspace](../criar-workspace/SKILL.md). Para listagem rica, classes com `linkedFormId` precisam de formulários com presets (regra da skill de workspace).

---

### 6. `class` — Classe

**Uso:** focar a narrativa numa **classe** (formulário) em **modo leitura** — útil para apresentar o modelo de dados sem simular preenchimento nem botões de confirmação da atividade BPMN.

| Campo | Função |
|-------|--------|
| `linkedFormId` | `FormDef.id` do **mesmo épico** — classe/formulário a mostrar no canvas. |
| `classPresentationTitle` | Título opcional no hero do preview (se vazio, pode usar `title` da etapa ou nome do formulário). |
| `classPresentationDescription` | Texto de contexto acima do formulário (objetivo da classe nesta etapa). |
| `classMethodNavigateStepIds` | Mapa **`FormMethod.id` → id de etapa** no mesmo fluxo: no preview (modo leitura), ao clicar num método do formulário, navega para essa etapa — **prototipação**, como em `workspaceMethodNavigateStepIds`. |

O preview usa o mesmo **deck** visual das outras etapas (hero + painel), mas **sem** painéis BPMN de objetivo/regras; o formulário é sempre **somente leitura**.

**Skill relacionada:** [criar-classe](../criar-classe/SKILL.md).

---

## Bundle de dados do épico (preview e exportação)

`EpicPresentationBundle` (`epicPresentationBundle.ts`) agrupa o necessário para renderizar/exportar:

- `forms` — `FormDef[]`
- `portals` — `ServicePortalDef[]`
- `workspaces` — `WorkspaceDef[]`

Ao desenhar uma apresentação, garantir que referências (`linkedFormId`, `linkedServicePortalId`, `linkedWorkspaceId`) resolvem nestes arrays do **mesmo épico**.

---

## Skills e ficheiros a usar em conjunto

| Entidade | Ficheiro | Skill |
|----------|----------|--------|
| Classes / formulários | `forms.json` | [criar-classe](../criar-classe/SKILL.md) |
| Workspaces | `workspaces.json` | [criar-workspace](../criar-workspace/SKILL.md) |
| Portais | `portals.json` | Sem skill local — **criar entrada em falta** conforme `types.ts` (`ServicePortalDef`); alinhar a UI em `FlowStepConfigPanel` / `ServicePortalConfig` |
| Fluxo / apresentação | `flows.json` | Esta skill |

---

## Checklist de entrega

- [ ] Para cada `linkedFormId` usado (`bpmnActivity`, `method`, `class`): classe criada em `forms.json` **antes** do fluxo (skill [criar-classe](../criar-classe/SKILL.md)).
- [ ] Etapas `method`: `methodFormType` coerente com a narrativa (`input` vs `output`); se `output`, não depender de `bpmnFormConfirmNavigateStepId` para o storyboard.
- [ ] Etapas `class`: `classPresentationTitle` / `classPresentationDescription` preenchidos quando fizer falta ao guiar a apresentação; `classMethodNavigateStepIds` só referencia `FormMethod.id` do formulário ligado e etapas existentes no fluxo.
- [ ] Para cada `linkedWorkspaceId` usado: workspace criado em `workspaces.json` **antes** do fluxo (skill [criar-workspace](../criar-workspace/SKILL.md)).
- [ ] Para cada `linkedServicePortalId` usado: portal criado em `portals.json` **antes** do fluxo (`ServicePortalDef`).
- [ ] `flows.json` válido (parse JSON).
- [ ] Cada etapa com `id`, `title` e `type` coerente.
- [ ] Referências cruzadas válidas no mesmo épico (`linkedFormId`, `linkedWorkspaceId`, `linkedServicePortalId`, `bpmnFormConfirmNavigateStepId`).
- [ ] Campos legados evitados em dados novos (`bpmnRules`, transições antigas, catálogos portal deprecados).
- [ ] Textos de apresentação (`workspacePresentationDescription`, `servicePortalPresentationDescription`, `bpmnDescription`) úteis para quem apresenta o processo.

---

## Referências de código

- `Espec/src/types.ts` — `FlowStep`, `FlowActivityType`, `ServicePortalSubtype`, campos de portal
- `Espec/src/components/FlowStepConfigPanel.tsx` — labels e agrupamento das secções
- `Espec/src/types/epicPresentationBundle.ts` — bundle do épico
- `Espec/src/presentation/buildPresentationPayload.ts` — exportação viewer
