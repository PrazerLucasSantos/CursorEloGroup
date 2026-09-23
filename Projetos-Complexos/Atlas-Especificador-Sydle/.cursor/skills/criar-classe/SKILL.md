---
name: criar-classe
description: Modelar classes (FormDef) no Espec com proporção certa — campos, spec, seções, exemplos, métodos, embutidos e regras só quando fizerem sentido. Catálogo completo de recursos; uso inteligente por contexto.
paths:
  - "Espec/**/*.tsx"
  - "Espec/**/*.ts"
---

# Criar classe / formulário — Espec (TJCE)

Este documento descreve **todas** as possibilidades de modelação de uma **classe** (`FormDef`) e dos **campos** (`FormField`) no projecto (`Espec/src/types.ts`, `FIELD_TYPE_LABELS`). Serve de **catálogo completo** — não como lista de obrigações a marcar todas em cada formulário.

## Princípio: catálogo completo, uso proporcional

- A skill apresenta **cada recurso** disponível (tipos de campo, secções, presets, métodos, referência embutida, regras de visibilidade, `spec`, etc.) para o agente **saber o que existe** e **escolher bem**.
- **Não** é para **forçar** tabela embutida, abas, regras condicionais, três cenários de exemplo ou métodos quando **não** houver necessidade de negócio ou UX.
- **Critério:** fazer as **perguntas certas** e produzir um formulário **coerente** com a **complexidade necessária** — nem mais simples a ponto de omitir o essencial, nem mais pesado a ponto de inflacionar o modelo.
- Exemplos do que **omitir** quando não aplicável: sem dados repetíveis homogéneos → **não** use `embeddedDisplay: 'table'`; sem ramos condicionais → **não** use `fieldVisibilityRules`; formulário mínimo de um tema → **`sectionLayout: 'none'`** pode bastar; sem acções de contexto → **`methods`** vazio ou omitido.

---

## Mapa do `FormDef` (o que pode entrar numa classe)

| Área | No modelo | Função resumida |
|------|-----------|------------------|
| **Campos** | `fields[]` | Estrutura de captura: tipos `FieldType`, `sectionId` se houver secções, `spec`, validações visuais, etc. |
| **Secções** | `sectionLayout`, `sections[]` | Lista única, acordeão ou abas (+ sub-seções só em abas). |
| **Exemplos** | `exampleValuePresets[]`, `activeExamplePresetId?` | Cenários de demo no canvas/export; **≥ 3** presets com cores distintas é **norma** para propostas completas (varrer perfis); pode ser menos só se o utilizador pedir algo mínimo. |
| **Métodos** | `methods[]` | Atalhos de acção no contexto da classe (chips / menu em leitura). |
| **Visibilidade** | `fieldVisibilityRules[]` | Mostrar/ocultar ou só leitura/editável condicional (origens `boolean` \| `textOptions`). |
| **Outros** | `metadata?`, `hiddenLabelFieldIds?`, `defaultCanvasMode?` | Texto sobre a classe; **rótulos ocultos** (ex.: avisos `alert`); modo default do canvas. |

**Ref. embutida** não é propriedade do `FormDef` directamente: é um **campo** `embeddedReference` que aponta a outro **`FormDef`** no mesmo épico (`linkedFormId`).

---

## Calibrar a complexidade — perguntas-guia

Responder mentalmente (e, quando útil, na entrega). **Sim** implica modelar; **não** implica **não** adicionar o recurso **só para “encher”**.

| Pergunta | Se sim… | Se não… |
|----------|---------|---------|
| Há **blocos repetíveis** (várias linhas iguais ou vários sub-formulários)? | Considerar **`embeddedReference`** + classe filha no épico ([Referência embutida](#referência-embutida)). | Lista de entidades → `reference`; enum → `textOptions`; sem repetição estruturada → sem embutida. |
| Há **campos que só fazem sentido consoante outra resposta**? | **`fieldVisibilityRules`** + origem `boolean` ou `textOptions` ([Regras de visibilidade](#regras-de-visibilidade-v1)). | Não criar regras; evitar complexidade artificial. |
| O formulário é **grande ou tem temas distintos**? | **`sectionLayout`** `accordion` ou `tabs` + `sections` + `sectionId` ([Secções](#secções-layout-e-ícones)). | **`none`** — lista única. |
| Precisa de **demonstrar vários cadastros** no canvas/export? | **`exampleValuePresets`** (ideal **≥ 3**, cores distintas; [Valores de exemplo](#valores-de-exemplo-cenários--presets)). | Menos cenários só por pedido explícito ou protótipo mínimo. |
| Existem **acções naturais “a partir deste registo”**? | **`methods`** ([Métodos](#métodos-do-formulário-methods)). | Omitir ou lista vazia; não inventar atalhos sem domínio. |

---

## Campos: propriedades comuns

- **`label`**, **`size`**, **`relevance`**, **`readOnly`**, **`required`**, **`hidden`**, **`spec`** (detalhamento — [secção dedicada](#detalhamento-por-campo-spec)).
- **`sectionId`**: obrigatório quando o formulário usa secções (`accordion` / `tabs`); aponta para `sections[].id`.
- **`hiddenLabelFieldIds`** no `FormDef`: esconde o rótulo visual de campos listados.

### Metadados: avisos (`alert`) sem rótulo duplicado

- Campos **`type: 'alert'`** comunicam pelo próprio banner (`alertTitle`, `alertMessage`, variante). Mostrar também o **`label`** do campo como título acima **duplica informação** e suja o formulário.
- **Regra:** ao propor uma classe com avisos, incluir **sempre** o `id` de cada campo `alert` em **`hiddenLabelFieldIds`** no `FormDef` (aba Metadados → «Rótulos ocultos» no app; ou JSON directo).
- O `label` do campo continua a existir na lista de campos da sidebar para identificação técnica; só deixa de aparecer no canvas/export junto ao banner.

### Relevância (`identity` / `highlight`) — listagem de objetos

- Os valores **`identity`** e **`highlight`** pesam na **listagem de objetos** (cartões / destaques no Explorer).
- **Parcimónia:** reserve `identity` e `highlight` ao mínimo necessário para reconhecer o registo de relance. Na prática, **no máximo ~4 campos no total** entre `identity` + `highlight` (por exemplo 2 identidade + 2 destaque). **Mais do que isso** tende a sobrecarregar visualmente a listagem.
- Demais campos: **`common`** ou **`advanced`** conforme uso frequente vs. técnico ou secundário.

### `reference` vs `textOptions` (semântica)

- **`reference`**: seleccionar **entidades** do domínio (cadastro, instância). UI: combobox.
- **`textOptions`**: **enums / decisões** que **não** são entidade (ex. Aprovar/Reprovar). UI: opções em linha ou compacto.

Ambos usam `options` na especificação; a escolha é de **modelo de dados**, não só de lista.

### Múltiplo (`multiple`)

Só **`reference`**, **`textOptions`** e **`embeddedReference`** (`fieldSupportsMultiple`); nos outros tipos, `multiple` não aplica.

---

## Tipos de campo (`FieldType`) — quando usar

### `text`

Texto curto ou longo (`textLong` → textarea). Sem máscara automática no controlo — formatos no **`spec`**.

### `number`

Inteiros / numéricos simples (`type="number"`).

### `decimal`

Decimais BR; `currency: true` → `R$ …`.

### `boolean`

Sim/Não; adequado como **origem** de regras de visibilidade.

### `date`

Datas (`type="date"`). Não cobre data+hora num só campo.

### `reference`

Entidade do sistema → combobox; `options` como placeholder de catálogo na especificação.

### `textOptions`

Decisão ou enum sem entidade própria; pode ser origem de regras (`expectedOptionText`).

### `embeddedReference`

Outro **`FormDef`** do épico embutido (subformulário). Ver [Referência embutida](#referência-embutida). **`embeddedDisplay`**: `table` (colunas = campos da classe ligada) ou `form` (blocos/accordeão por instância).

### `file`, `geopoint`, `html`, `alert`

Anexo; lat/lng; conteúdo estático; banner informativo — conforme `types` e componentes em `Espec/src/components/fields/`.

### Tabela rápida

| `FieldType` | Rótulo UI | Ideia |
|-------------|-----------|--------|
| `text` | Texto | Livre; `textLong` = textarea |
| `number` | Número | Numérico simples |
| `decimal` | Decimal | BR; `currency` = R$ |
| `boolean` | Booleano | Sim/Não |
| `date` | Data | Date picker |
| `reference` | Referência | **Entidade** |
| `textOptions` | Opções em texto | **Não-entidade** |
| `embeddedReference` | Ref. embutida | Outra classe |
| `file` | Arquivo | Anexo |
| `geopoint` | Coordenada geográfica | Lat / lng |
| `html` | HTML | Estático |
| `alert` | Alerta | Banner |

---

## Detalhamento por campo (`spec`)

**Ao propor uma classe**, preencher **`spec`** em **cada** campo com texto útil para analista/dev/operações (área «Detalhamento» no canvas/export; toggle global).

**Tabela orientadora** (fundir prosa; nem todas as linhas aplicam sempre):

| Âmbito | Cobrir |
|--------|--------|
| Finalidade | Papel no processo / ecrã |
| Significado | O que o valor representa no domínio |
| Origem | Manual, integração, cadastro, derivado… |
| Destino | Onde persiste ou segue |
| Obrigatoriedade contextual | Excepções ao `required` fixo |
| Validações | Formatos e limites que o produto deve aplicar |
| Visibilidade | Se origem/alvo de regras, resumir o racional |
| Referência / opções / embutida | Entidade, opções ou classe ligada |
| Dados sensíveis | LGPD / sigilo |
| Exemplos | Valor plausível se ajudar |

`html` / `alert`: papel comunicacional. Se não houver regra especial, uma linha explícita (*origem manual; sem regras extra*) fecha bem.

---

## Secções, layout e ícones

**Só usar** `accordion` ou `tabs` quando o agrupamento **compensa** a complexidade (formulários longos ou temas separados). Caso contrário **`none`**.

| `sectionLayout` | Uso |
|-----------------|-----|
| `none` | Lista única — formulários curtos ou um só tema. |
| `accordion` | Secções de topo empilhadas, expansíveis. Sub-seções **não** persistem ao mudar de tabs→accordion (normalização). |
| `tabs` | Abas no topo; dentro do painel: campos directos na aba + **sub-seções** como acordeões (`parentSectionId` = id da aba; **um nível**). |

**`FormSection`:** `id`, `title`, `icon?` (Material Symbols **snake_case**, `sectionIcon.ts`), `parentSectionId?` (só tabs).

**Ordem em `sections`:** `[aba1, sub…, aba2, …]` (`parseSectionSegments`).

**Ícones:** mesma convenção que métodos; [galeria Material Symbols](https://fonts.google.com/icons).

**Bom agrupamento:** fase do processo; tipo de informação; actor; evitar “Misc”; abas para blocos grandes e pouco dependentes; acordeão para tudo visível na vertical com dobra; sub-seções só para **abas** longas.

**UI:** sidebar **«Seções»** + selector de secção por campo.

---

## Valores de exemplo (cenários / presets)

**Objectivo:** canvas e export HTML mostram **instâncias** plausíveis. Para **propostas completas**, **≥ 3** presets com **`iconColor`** **distintos** e cenários de negócio **diferentes** (não é obrigatório inflacionar se o pedido for minimalista).

**`FormExampleValuePreset`:** `id`, `name`, `iconColor` (paleta fixa), `fieldValues` (`FieldDemoValue` por `fieldId`), `embeddedRowsByFieldId` para embutidos.

**Paleta** (`presetIconColor.ts`): `#2B9CBF` · `#F59740` · `#F66849` · `#5163C4` · `#212121` · `#EA5EC2` · `#51DACF` · `#A581DD` · `#DCA95D` · `#CF5F81` · `#B0D85C` · `#5FCFB4`

**`activeExamplePresetId`:** qual cenário está activo; omisso → primeiro da lista.

**UI:** **«Valores de exemplo»** (`FormExampleValuesTab.tsx`).

---

## Métodos do formulário (`methods`)

**Semântica:** atalhos de **acção no contexto do registo** (modo leitura / export) — não são campos.

**`FormMethod`:** `id`, `name`, `icon`, `kind` — **`destaque`** (chips) vs **`menu`** (⋮). Poucos destaques (2–5); resto no menu.

**Exemplos:** contrato → cronograma, empenho, aditivo; processo → distribuir, juntar documento; pedido → submeter, cancelar.

**Não são:** substitutos de campos nem `fieldVisibilityRules`.

**UI:** sidebar **«Métodos»** (`Sidebar.tsx`, `FormCanvas.tsx`).

---

## Referência embutida

**Só** quando há **subformulário repetível** ou **tabela** de linhas homogéneas ligadas à classe pai.

1. **Tabela:** classe filha (ex. cronograma por item); no pai: `embeddedReference`, `multiple`, `embeddedDisplay: 'table'` — colunas = campos da classe ligada.
2. **Vários blocos:** mesma ideia com `embeddedDisplay: 'form'` (accordeão por instância).

**Regra:** cada embutido **tem** `linkedFormId` → outro **`FormDef`** no **mesmo épico**; **reutilizar** classe existente se servir; **criar** a filha se não existir. UI impede **ciclos**.

---

## Regras de visibilidade (v1)

**Só** quando o negócio tem **ramificações** na mesma classe (mostrar/ocultar ou editável condicional).

**Origens permitidas:** **`boolean`** ou **`textOptions`** (`expectedOptionText` **exacto** à entrada em `options`). Não usar `reference`/`text`/etc. como origem.

**Acções:** `hide` \| `show` \| `readonly` \| `editable`. Ordem importa: **última regra** na mesma dimensão prevalece. Evitar **ciclos** entre origem e alvos.

**Exemplo Aprovar/Reprovar:** campo `textOptions`, `multiple: false`; regras `show`/`hide` conforme padrão; documentar no `spec`.

**UI:** **Metadados** → «Regras condicionais» (`FormMetadataTab.tsx`). JSON: `FieldVisibilityRule` em `types.ts`; `newFieldVisibilityRuleId()` em `fieldVisibilityRules.ts`.

---

## Configuração na aplicação (sidebar)

| Separador | Conteúdo principal |
|-----------|---------------------|
| **Campos** | Lista de `FormField`, tipo, secção, propriedades |
| **Seções** | Layout, `sections`, ícones |
| **Valores de exemplo** | Presets, cores, `fieldValues`, linhas embutidas |
| **Métodos** | Chips / menu |
| **Metadados** | Regras de visibilidade, rótulos ocultos, texto `metadata` |

---

## Ficheiros de referência no código

`types.ts`, `formSections.ts`, `formExamplePresets.ts`, `presetIconColor.ts`, `fieldVisibilityRules.ts`, `sectionIcon.ts`, `FormMetadataTab.tsx`, `FormExampleValuesTab.tsx`, `Sidebar.tsx`, `FormCanvas.tsx`, `FormFieldsGrid.tsx`, `components/fields/*`.

---

## Instruções para o agente

1. **Proporcionalidade primeiro:** esta skill é um **catálogo**; aplicar **só** os recursos que o contexto exige. **Não** adicionar tabela embutida, regras, abas, métodos ou múltiplos presets **sem necessidade** declarável.
2. **Perguntas certas:** usar a [tabela de calibragem](#calibrar-a-complexidade--perguntas-guia) para alinhar a complexidade do `FormDef` ao caso.
3. **Campos:** todos definidos com **`spec`** substantivo; tipos escolhidos por semântica ([reference vs textOptions](#reference-vs-textoptions-semântica)).
4. **Metadados:** todo campo **`alert`** deve ter o seu `fieldId` em **`hiddenLabelFieldIds`**; **`relevance`** `identity`/`highlight` só onde for indispensável — idealmente **≤ 2 no total** entre ambos para não degradar a listagem de objetos.
5. **Recursos avançados:** em ordem de necessidade — secções, presets (≥3 quando proposta completa), métodos, embutida, regras — cada um [documentado acima](#mapa-do-formdef-o-que-pode-entrar-numa-classe).
6. **Consistência** com os ficheiros listados na secção de referência.
