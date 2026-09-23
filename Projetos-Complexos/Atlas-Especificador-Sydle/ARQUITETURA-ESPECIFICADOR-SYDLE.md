# Especificador Sydle — Arquitetura completa do projeto

> **Propósito deste documento.** Servir como contexto único para qualquer IA ou desenvolvedor entender **como o Especificador é construído, organizado e estendido**. Lê de cima a baixo e você consegue: gerar formulários, classes, workspaces, portais, apresentações, métodos, presets e flows novos sem chutar nada. Todas as referências apontam para arquivos reais do repositório.
>
> **Nome interno do app:** `espec`. **Tipo:** SPA React 19 + TypeScript, com plugin Vite que faz CRUD em arquivos JSON do diretório `data/`. Sem back-end, sem banco.
>
> **Última atualização:** 2026‑05‑26.

---

## Sumário

1. [Visão geral em 60 segundos](#1-visão-geral-em-60-segundos)
2. [Hierarquia de domínio](#2-hierarquia-de-domínio)
3. [Layout de arquivos e onde tudo mora](#3-layout-de-arquivos-e-onde-tudo-mora)
4. [Servidor de dados (`vite.config.ts`)](#4-servidor-de-dados-viteconfigts)
5. [`FormDef` — anatomia de uma classe](#5-formdef--anatomia-de-uma-classe)
6. [`FormField` — todos os tipos e propriedades](#6-formfield--todos-os-tipos-e-propriedades)
7. [Relevância, identidade e destaque](#7-relevância-identidade-e-destaque)
8. [Seções, abas e sub‑seções](#8-seções-abas-e-sub-seções)
9. [Métodos do formulário](#9-métodos-do-formulário)
10. [Cenários de exemplo (`exampleValuePresets`)](#10-cenários-de-exemplo-examplevaluepresets)
11. [Regras condicionais (`fieldVisibilityRules`)](#11-regras-condicionais-fieldvisibilityrules)
12. [Referência embutida e referência simples](#12-referência-embutida-e-referência-simples)
13. [`WorkspaceDef` — Explorer (pacotes/classes)](#13-workspacedef--explorer-pacotesclasses)
14. [`ServicePortalDef` — portais](#14-serviceportaldef--portais)
15. [`FlowListItem` / `FlowStep` — apresentações](#15-flowlistitem--flowstep--apresentações)
16. [Grupos da aba Classes (`class-groups.json`)](#16-grupos-da-aba-classes-class-groupsjson)
17. [Pipeline de renderização (Canvas, Explorer, Apresentação)](#17-pipeline-de-renderização-canvas-explorer-apresentação)
18. [Padrão `scripts/build-*.mjs` — fonte de verdade declarativa](#18-padrão-scriptsbuild-mjs--fonte-de-verdade-declarativa)
19. [Convenções de IDs e prefixos](#19-convenções-de-ids-e-prefixos)
20. [Métodos com ação embutida (callbacks built‑in)](#20-métodos-com-ação-embutida-callbacks-built-in)
21. [Migrações automáticas / formatos legados](#21-migrações-automáticas--formatos-legados)
22. [Recomendações para criar coisas novas](#22-recomendações-para-criar-coisas-novas)
23. [Apêndice A — referência rápida de enums](#apêndice-a--referência-rápida-de-enums)
24. [Apêndice B — exemplo mínimo de classe](#apêndice-b--exemplo-mínimo-de-classe)
25. [Apêndice C — fluxo completo de um épico Atlas](#apêndice-c--fluxo-completo-de-um-épico-atlas)

---

## 1. Visão geral em 60 segundos

- **O que é.** Ferramenta para **modelar produtos do Sydle One** (classes, métodos, workspaces, portais) e montar **apresentações clicáveis** (slides + protótipos navegáveis) que parecem o produto real.
- **Sem back‑end.** Tudo mora em **JSON dentro de `data/`**. O Vite plugin `dataApiPlugin` em `vite.config.ts` expõe endpoints REST locais (`/api/...`) que leem e gravam diretamente nesses arquivos enquanto `npm run dev` está rodando.
- **Stack.** React 19 + TypeScript 5.9 + Vite 6 + ESLint 9. Sem Redux/Zustand: estado fica em `App.tsx` (componente raiz) com `useState`. Hot reload + WebSocket custom (`'data-update'`) recarrega a UI quando algum JSON muda externamente.
- **Hierarquia.** `Projeto → Subprojeto → Épico → (Classes + Workspaces + Portais + Apresentações + Grupos de classe)`.
- **Persistência por épico.** Cada épico tem 5 arquivos canônicos:
  - `forms.json` — classes (formulários, campos, métodos, presets).
  - `workspaces.json` — explorers (pacotes/classes do Sydle).
  - `portals.json` — portais reutilizáveis.
  - `flows.json` — apresentações (fluxos com etapas).
  - `class-groups.json` — grupos da aba Classes + ordem.
- **Geração via script (recomendado).** Para épicos grandes (ex.: Projeto Atlas) existem scripts `scripts/build-*.mjs` que **escrevem o `forms.json` e o `portals.json`/`flows.json`** de modo determinístico. Editar diretamente os JSON funciona, mas o script é a fonte de verdade.

---

## 2. Hierarquia de domínio

Todos os tipos canônicos vivem em `src/types.ts`. Aqui a árvore conceitual:

```
DataTree                       (raiz da árvore exposta ao front)
├─ projectName: string         (lido de data/project.json)
└─ subprojects: Subproject[]
   └─ Subproject
      ├─ id, name
      └─ epics: Epic[]
         └─ Epic
            ├─ id, name
            ├─ forms: FormDef[]                     ← forms.json
            ├─ flows: FlowListItem[]                ← flows.json
            ├─ portals: ServicePortalDef[]          ← portals.json
            ├─ workspaces: WorkspaceDef[]           ← workspaces.json
            ├─ classGroups: EpicClassGroup[]        ↘
            ├─ classGroupAssignments: {fid:gid}     ─ class-groups.json
            └─ classGroupMemberOrder: {gid:fid[]}   ↗
```

Conceito por linha:

| Termo | É | Mora em |
|-------|---|---------|
| **Projeto** | rótulo da raiz | `data/project.json` |
| **Subprojeto** | pasta dentro de `data/subprojects/<slug>/` | `subproject.json` |
| **Épico** | pasta dentro de `data/subprojects/<sub>/epics/<slug>/` | `epic.json` |
| **Classe** (`FormDef`) | um formulário (modelo de dados): campos, seções, métodos, cenários | `forms.json` |
| **Workspace** (`WorkspaceDef`) | tela "Explorer" do Sydle: pacotes → classes → objetos de exemplo | `workspaces.json` |
| **Portal** (`ServicePortalDef`) | página inicial de portal de serviços (header, hero, catálogos, HTML) | `portals.json` |
| **Apresentação** (`FlowListItem`) | sequência de etapas; cada etapa tem um *tipo* (HTML, BPMN, método, portal, workspace, classe) | `flows.json` |
| **Grupo da classe** (`EpicClassGroup`) | rótulo opcional para agrupar classes na sidebar do editor | `class-groups.json` |

Nada disso fala com o Sydle real — é tudo mock visual para fins de especificação.

---

## 3. Layout de arquivos e onde tudo mora

```
Especificador Sydle/
├─ index.html, presentation.html        (entry HTML do editor e do viewer)
├─ vite.config.ts                       (plugin dataApiPlugin com todos os endpoints REST)
├─ package.json                         (scripts: dev, build, lint, atlas:*)
├─ public/                              (assets servidos sem processamento)
├─ src/                                 (código React do editor)
├─ scripts/                             (geradores .mjs — escrevem os JSON)
├─ data/                                (a "base de dados" — só JSON e .md)
│  ├─ project.json
│  └─ subprojects/<sub>/
│      ├─ subproject.json
│      └─ epics/<epic>/
│         ├─ epic.json
│         ├─ forms.json
│         ├─ flows.json
│         ├─ portals.json
│         ├─ workspaces.json
│         ├─ class-groups.json
│         └─ context.md   (markdown auxiliar do épico)
├─ exports/presentations/<nome>.json    (JSON do "viewer estático" — passo 2 do export)
├─ exports/zips/<nome>.zip              (ZIP do viewer — passo 3)
├─ formularios-html/                    (HTML exportado de classes individuais — feature em pausa)
├─ dist/                                (saída do npm run build)
└─ Design System/                       (referências visuais; não usadas em runtime)
```

### `src/` em detalhe

```
src/
├─ App.tsx                              (raiz; estado global; navegação Projetos→Épicos→Forms)
├─ main.tsx, presentationMain.tsx       (mounts dos dois bundles)
├─ types.ts                             (TODOS os tipos do domínio)
├─ dataLoader.ts                        (camada HTTP que fala com /api/*)
├─ exportHtmlGenerator.ts               (gera HTML estático de uma classe)
├─ App.css                              (estilos globais; classes BEM "canvas__*")
├─ components/
│   ├─ FormCanvas.tsx                   (canvas central do formulário; edit vs read)
│   ├─ FormFieldsGrid.tsx               (grid de campos; embedded reference; cells)
│   ├─ FormSectionedLayout.tsx          (acordeões / abas)
│   ├─ FormList.tsx                     (lista esquerda das 4 abas do épico)
│   ├─ FormsResizableLayout.tsx         (3 colunas redimensionáveis)
│   ├─ Sidebar.tsx                      (sidebar direita do editor de classe)
│   ├─ FieldListEditor.tsx              (lista de campos com accordion por campo)
│   ├─ FieldSpecMarkdown.tsx            (renderizador de markdown leve)
│   ├─ FieldTypeIcon.tsx, EmbeddedDemoInstancesEditor.tsx
│   ├─ FormExampleValuesTab.tsx         (UI dos presets)
│   ├─ FormMetadataTab.tsx              (texto livre)
│   ├─ FlowStepConfigPanel.tsx          (sidebar para etapas)
│   ├─ FlowPresentationStepCanvas.tsx   (canvas central das etapas)
│   ├─ FlowPresentationFullscreen.tsx   (modo apresentação)
│   ├─ FlowBpmnActivityCanvas.tsx, FlowClassActivityCanvas.tsx
│   ├─ FlowStepHtmlEditor.tsx           (CodeMirror lazy-loaded)
│   ├─ ServicePortalHomePageCanvas.tsx
│   ├─ pages/ListPage.tsx               (telas Projetos / Épicos)
│   ├─ workspace/                       (Explorer e config)
│   │   ├─ WorkspaceExplorer.tsx        (3 colunas: pacotes | objetos | detalhe)
│   │   ├─ WorkspaceConfigPanel.tsx     (sidebar de config)
│   │   ├─ WorkspacePreviewCanvas.tsx
│   │   ├─ FlowWorkspaceStepConfig.tsx
│   │   └─ FlowWorkspaceActivityCanvas.tsx
│   ├─ servicePortal/                   (portal: config + canvas)
│   └─ fields/                          (1 componente por FieldType)
├─ contexts/
│   ├─ CanvasRuntimeValuesContext.tsx   (valores digitados no canvas; permite salvar de volta em preset)
│   └─ EmbeddedNestedPopupContext.tsx
├─ hooks/
│   ├─ useCanvasFieldVisible.ts         (avalia fieldVisibilityRules em runtime)
│   └─ useDisableInputSpellcheck.ts
├─ utils/
│   ├─ linkedForm.ts                    (findFormById, identityTitleLines, nested fields)
│   ├─ formExamplePresets.ts            (CRUD/migration de presets)
│   ├─ formSections.ts                  (parsing de abas + sub-seções)
│   ├─ formTree.ts                      (patch recursivo em campos)
│   ├─ fieldDemoValue.ts                (conversores de FieldDemoValue → display)
│   ├─ fieldVisibilityRules.ts          (regras condicionais)
│   ├─ embeddedDemo.ts, embeddedFormCycle.ts (referência embutida)
│   ├─ canvasRuntimeValueKey.ts         (chave de identificação dos inputs no canvas)
│   ├─ canvasRuntimeToPreset.ts         (flush dos valores digitados para o preset ativo)
│   ├─ flowStep.ts, flowList.ts         (helpers de etapas)
│   ├─ formMethodActions.ts             (dispatcher de built-in methods)
│   ├─ atlas*Methods.ts                 (ações específicas do Atlas — PDF, integrações, etc.)
│   ├─ presetIconColor.ts               (paleta de cores dos ícones de preset)
│   ├─ workspaceExplorerTheme.ts        (resolver cores do chrome do Explorer)
│   ├─ specMarkdown.ts                  (markdown → HTML para spec)
│   └─ ...
└─ presentation/
    ├─ buildPresentationPayload.ts      (monta o JSON do viewer estático)
    ├─ PresentationViewerApp.tsx        (app standalone do viewer)
    └─ presentationExportTypes.ts
```

---

## 4. Servidor de dados (`vite.config.ts`)

`dataApiPlugin` registra **middlewares HTTP** sobre o dev server do Vite. Todos os endpoints são síncronos contra o disco:

| Método+rota | O que faz | Arquivo escrito |
|-------------|-----------|----------------|
| `GET /api/data` | lê **toda** a árvore (`DataTree`) | — |
| `POST /api/save-forms` | grava `forms.json` do épico | `forms.json` |
| `POST /api/save-flows` | grava `flows.json` | `flows.json` |
| `POST /api/save-portals` | grava `portals.json` | `portals.json` |
| `POST /api/save-workspaces` | grava `workspaces.json` | `workspaces.json` |
| `POST /api/save-class-groups` | grava grupos+atribuições+ordem | `class-groups.json` |
| `POST /api/export-html` | grava HTML em `formularios-html/<file>` (feature pausada) | — |
| `POST /api/save-presentation-export` | grava `exports/presentations/<file>.json` | — |
| `POST /api/create-subproject` | cria pasta `subprojects/<slug>/` + `subproject.json` + `context.md` | — |
| `POST /api/delete-subproject` | `rm -rf` da pasta | — |
| `POST /api/create-epic` | cria pasta `epics/<slug>/` + os 5 JSON vazios + `context.md` | — |
| `POST /api/delete-epic` | `rm -rf` da pasta do épico | — |
| `POST /api/rename-subproject` / `rename-epic` | só edita `subproject.json` / `epic.json` (não muda o id/pasta) | — |

Notas importantes:

- **Watch global.** O plugin observa `data/` com `server.watcher` e envia `ws('data-update')` para qualquer alteração; o front recarrega via `useDataTree()` (em `src/dataLoader.ts`).
- **Slug seguro.** IDs de subprojeto e épico têm que casar `^[a-z0-9][a-z0-9-]*$` (regex `SAFE_SEGMENT`). O slug é derivado do nome via `slugFromDisplayName`. Renomear não altera o id/pasta.
- **Conflito de sincronização.** Se o usuário e o disco divergirem, o App mostra o banner `sync-banner` com **«Carregar do arquivo»** ou **«Manter estado da tela»**. A detecção é feita comparando `JSON.stringify(localX) === JSON.stringify(treeX)`.
- **Persistência só em dev.** Em `npm run build` (preview), os endpoints não existem — o app fica somente leitura.

---

## 5. `FormDef` — anatomia de uma classe

Definição canônica (resumida) em `src/types.ts`:

```ts
interface FormDef {
  id: string
  name: string
  fields: FormField[]
  defaultCanvasMode?: 'edit' | 'read'          // canvas padrão (default: 'edit')
  sectionLayout?: 'none' | 'accordion' | 'tabs'
  sections?: FormSection[]
  methods?: FormMethod[]
  exampleValuePresets?: FormExampleValuePreset[]
  activeExamplePresetId?: string
  metadata?: string                            // texto livre (aba Metadata)
  hiddenLabelFieldIds?: string[]               // esconde só o label (mantém input)
  fieldVisibilityRules?: FieldVisibilityRule[] // regras condicionais
}
```

### Campos obrigatórios em runtime

- `id` único no épico (convenção: `form-<prefixo>-<slug-kebab>`).
- `name` apresentado em todas as listas, sidebars e canvas.
- `fields` pode ser vazio; canvas mostra placeholder.

### Campos opcionais — efeito visual

| Campo | Efeito |
|-------|--------|
| `defaultCanvasMode: 'read'` | quando aberto no editor, o canvas inicia em modo leitura (com header de identidade, chips de destaque, faixa de métodos) |
| `sectionLayout` | controla `FormSectionedLayout.tsx`; sem ele, layout plano |
| `methods` | aparece como botões na barra de leitura e no menu `⋮`; ver §9 |
| `metadata` | só visível na aba **Metadata** da sidebar; pode armazenar qualquer texto |
| `hiddenLabelFieldIds` | esconde o `<label>` de campos específicos, mantendo o input renderizado |
| `fieldVisibilityRules` | regras condicionais (§11) — afetam apenas o **preview**, não persistem `hidden`/`readOnly` |

### O que NÃO existe no `FormDef`

- Validações de negócio.
- Cálculos automáticos (a não ser via método built‑in).
- Eventos. Tudo é estático/descritivo.

---

## 6. `FormField` — todos os tipos e propriedades

Definição:

```ts
interface FormField {
  id: string
  type: FieldType
  label: string
  size: 'small' | 'medium' | 'large'   // span de coluna no grid (1, 2, 4)
  readOnly: boolean                    // input desabilitado no canvas
  hidden?: boolean                     // não renderiza no canvas/export
  required: boolean                    // só estilo (asterisco)
  multiple: boolean                    // reference, textOptions, embeddedReference
  relevance: 'identity' | 'highlight' | 'common' | 'advanced'
  htmlContent?: string                 // type='html'
  textLong?: boolean                   // type='text' → textarea
  options?: string[]                   // type='textOptions'
  currency?: boolean                   // type='decimal' → prefixo R$
  spec?: string                        // markdown descritivo do campo
  linkedFormId?: string                // type='reference' | 'embeddedReference'
  embeddedDisplay?: 'form' | 'table'   // como o bloco embutido aparece
  embeddedRoot?: boolean               // reservado (single-row embutido raiz)
  sectionId?: string                   // obrigatório se sectionLayout != 'none'
  alertVariant?: 'warning'|'error'|'info'|'success'
  alertTitle?: string                  // type='alert'
  alertMessage?: string
  alertCollapsible?: boolean
}
```

### Tipos (`FieldType`) e o componente que renderiza cada um

| `type` | Rótulo | Componente | Notas |
|--------|--------|------------|-------|
| `text` | Texto | `fields/TextField.tsx` | `textLong` vira textarea autosize |
| `number` | Número | `fields/NumberField.tsx` | inteiro |
| `decimal` | Decimal | `fields/DecimalField.tsx` | `currency:true` prefixa `R$`; armazenado como `number` ou string numérica |
| `boolean` | Booleano | `fields/BooleanField.tsx` | toggle |
| `date` | Data | `fields/DateField.tsx` | armazenamento ISO `YYYY-MM-DD`; display dd/mm/aaaa |
| `reference` | Referência | `fields/ReferenceField.tsx` | usa `linkedFormId` para resolver opções **a partir de outro form do épico** (ver §12) |
| `textOptions` | Opções em texto | `fields/TextOptionsField.tsx` | array `options[]`; `multiple:true` permite multi‑select |
| `embeddedReference` | Ref. Embutida | `FormFieldsGrid::EmbeddedReferenceBlock` | desenha o formulário linkado **dentro** do campo; `multiple:true` vira tabela/accordion de instâncias |
| `file` | Arquivo | `fields/FileField.tsx` | demo aceita lista `FileDemoItem[]` `{name, kind}` |
| `geopoint` | Coordenada | `fields/GeopointField.tsx` | `{lat, lng}` em demo |
| `html` | HTML | `fields/HtmlField.tsx` | `htmlContent` renderizado com `dangerouslySetInnerHTML` |
| `alert` | Alerta | `fields/AlertField.tsx` | banner com variante; `alertTitle`/`alertMessage`/`alertCollapsible` |

### `size` × layout

`SIZE_SPAN` em `types.ts`:

```
small  → 1 col
medium → 2 col
large  → 4 col
```

O grid base de campos vai até 4 colunas. `large` ocupa a linha inteira.

### `multiple` — quais tipos aceitam

`fieldSupportsMultiple()`:

- `reference`
- `textOptions`
- `embeddedReference`

### `FieldDemoValue` (valor de exemplo aceito)

```
string | number | boolean | string[] | { lat: string; lng: string } | FileDemoItem[]
```

Conversões para display estão em `src/utils/fieldDemoValue.ts` (`demoValueAsSingleLineSummary`, `decimalDemoToRaw`, `dateIsoFromDemo`, ...).

---

## 7. Relevância, identidade e destaque

`FieldRelevance` controla **três comportamentos visuais distintos**:

| Valor | Onde aparece | Função |
|-------|--------------|--------|
| `identity` | Modo leitura — header do form e cards do Explorer; título do bloco embutido | Cada campo identidade vira uma linha do título; valor vem do preset ativo ou demo |
| `highlight` | Modo leitura — "destaques" (chave: valor) abaixo do header; também na listagem de objetos do Explorer e em alguns subtítulos | Use para colocar "tags" tipo `Status: Ativo` ou KPIs |
| `common` | Renderiza no corpo do formulário | Default |
| `advanced` | Renderiza só em seções "Avançado" / accordion fechado | Reduz ruído visual |

**Regra prática:**

- Sempre marque pelo menos UM campo como `identity` (texto/grande/required) para o card do Explorer e o header em leitura ficarem informativos.
- Marque 2–5 campos importantes como `highlight` (status, valor, parceiro, métrica…) — eles viram as "tags" da listagem.

Lógica em `src/utils/linkedForm.ts::formIdentityTitleLines` e `src/utils/formExamplePresets.ts::formHighlightRowsFromExamplePreset`.

---

## 8. Seções, abas e sub‑seções

`FormSection` e `sectionLayout` controlam o cromado do formulário.

```ts
type FormSectionLayout = 'none' | 'accordion' | 'tabs'

interface FormSection {
  id: string                      // sec-...
  title: string
  icon?: string                   // Material Symbols (ex.: 'description')
  parentSectionId?: string        // só em layout 'tabs' (define sub-seção da aba)
}
```

Regras (`src/utils/formSections.ts`):

- **`none`** — todos os campos no mesmo painel. `sectionId` opcional/ignorado.
- **`accordion`** — cada seção vira um acordeão fechável; `parentSectionId` é ignorado e o normalizador (`stripSubSectionsForAccordionLayout`) remove sub‑seções.
- **`tabs`** — cada seção raiz vira uma **aba** no topo. Seções com `parentSectionId` viram **sub‑seções** (acordeões) dentro da aba pai. Ordem do array tem que ser `[aba, sub1, sub2, aba, sub1, ...]`; o app re‑ordena/limpa órfãs (`sanitizeTabsSubSections`).

`FormField.sectionId` deve apontar ou para uma aba (direto) ou para uma sub‑seção. Quando o usuário muda layout, o app re‑roteia campos órfãos para a primeira aba.

Os ícones são **Material Symbols outlined**. O helper `normalizeSectionIconLigature` em `src/utils/sectionIcon.ts` aceita o nome bruto (`'description'`, `'list_alt'`, etc.).

---

## 9. Métodos do formulário

```ts
type FormMethodKind = 'destaque' | 'menu'

interface FormMethod {
  id: string
  name: string
  icon: string                    // Material Symbols
  kind: 'destaque' | 'menu'
}
```

> **Atenção:** o tipo aceita apenas `'destaque' | 'menu'`, mas alguns épicos antigos do Atlas usam `'secundario'` nos JSONs. O front renderiza qualquer `kind ≠ 'destaque'` como menu.

Onde aparece:

- **Modo leitura no canvas principal** (`FormCanvas::FormReadModeMenuBar`):
  - `destaque` → "chip" pintado na barra superior direita.
  - `menu` → entra no dropdown do botão `⋮`.
- **Workspace** — no Explorer, ao abrir um objeto, os métodos aparecem do mesmo jeito; clicar pode disparar **prototipação** (navegar para etapa configurada) ou um **método built‑in** (PDF, integração, simulação).
- **Etapa `class`** numa apresentação — idem.

Click handler: `tryRunBuiltInFormMethod(form, methodId, getValue, epicForms)` (§20) é chamado primeiro; se devolver `false`, cai no callback `onReadModeMethodClick` (prototipação).

### Como adicionar um método

No script de build (ex.: `scripts/build-projeto-atlas-fase1-catalogo.mjs`):

```js
methods: [
  { id: 'patlas-cot-meth-gerar-proposta', name: 'Gerar proposta Atlas', icon: 'description', kind: 'destaque' },
  { id: 'patlas-cot-meth-enviar-parceiro', name: 'Enviar ao parceiro', icon: 'send', kind: 'destaque' },
  { id: 'patlas-cot-meth-iniciar-analise', name: 'Iniciar análise', icon: 'play_arrow', kind: 'secundario' },
],
```

---

## 10. Cenários de exemplo (`exampleValuePresets`)

Cada classe pode ter **N cenários** (presets). Cada preset preenche valores de demonstração para os campos do formulário.

```ts
interface FormExampleValuePreset {
  id: string
  name: string
  iconColor?: string                                 // hex; defaults na paleta PRESET_ICON_COLOR_CHOICES
  fieldValues?: Partial<Record<string, FieldDemoValue>>
  embeddedRowsByFieldId?: Partial<Record<string, EmbeddedDemoRow[]>>
}
```

### Como os presets entram no UI

1. **Canvas em modo leitura** — usa o preset apontado por `activeExamplePresetId` (ou o primeiro). O header de identidade e os chips de destaque vêm dos valores deste preset.
2. **Aba «Valores de exemplo»** na sidebar (`FormExampleValuesTab.tsx`) — usuário cria/edita/troca presets, define `iconColor`.
3. **Salvar do canvas** — quando o usuário digita valores no canvas em modo edição e aperta o botão verde, o app faz **flush** dos inputs para o preset ativo via `flushCanvasRuntimeToActivePreset` (`src/utils/canvasRuntimeToPreset.ts`).
4. **Workspace Explorer** — uma `WorkspacePackageClass` referencia presets via `linkedFormExamplePresetIds`; cada preset vira UM card na listagem central de objetos.

### `embeddedRowsByFieldId` — linhas de tabela embutida

Quando o campo é `embeddedReference` com `multiple: true` (vira tabela), o preset informa as linhas:

```js
exampleValuePresets: [
  {
    id: 'patlas-pv-tela-preset-1',
    name: 'Grade — catálogo completo',
    iconColor: '#0c1ba8',
    fieldValues: {},
    embeddedRowsByFieldId: {
      // chave = id do campo embedded; valor = array de "linhas"
      emb_patlas_produtos_vigentes: [pvRow1, pvRow2, pvRow3, ...],
    },
  },
]
```

Cada linha (`EmbeddedDemoRow`) é `{ [fieldIdDoFormLinkado]: valor }`. O valor por sua vez pode ser escalar **ou** um sub‑bloco `{ embeddedDemoInstances: [...] }` (embutido recursivo).

---

## 11. Regras condicionais (`fieldVisibilityRules`)

Permitem **mostrar/ocultar** ou **bloquear/liberar edição** de campos no preview do canvas, baseado num campo origem **booleano** ou **textOptions**.

```ts
type FieldVisibilityRule =
  | { id; operator:'eq'; sourceFieldId; sourceKind:'boolean'; expectedBoolean; action; targetFieldIds: string[] }
  | { id; operator:'eq'; sourceFieldId; sourceKind:'textOptions'; expectedOptionText; action; targetFieldIds: string[] }

type FieldVisibilityRuleAction = 'hide' | 'show' | 'readonly' | 'editable'
```

- Última regra que atinge o alvo **vence** (por dimensão: visibilidade e edição são independentes).
- **Não persiste** `hidden`/`readOnly` no campo — só decora o preview. Para esconder de verdade, use `field.hidden=true`.

Avaliação em runtime: `src/hooks/useCanvasFieldVisible.ts`.

---

## 12. Referência embutida e referência simples

### `reference`

Selecione um campo identidade de outro formulário do épico como opção. Em runtime as opções vêm da **listagem de cadastros mestres** do épico (no Atlas, do `form-atlas-cadastro-maestros`). Em prática usa‑se com `linkedFormId` apontando para uma classe e a UI mostra um seletor com os `identity` dela.

### `embeddedReference`

Desenha o formulário linkado **dentro** do campo. Variantes:

| Configuração | Resultado |
|--------------|-----------|
| `multiple: false` | um formulário aninhado, único, no slot do campo |
| `multiple: true`, `embeddedDisplay: 'form'` | accordion de instâncias |
| `multiple: true`, `embeddedDisplay: 'table'` | tabela onde colunas = campos do form linkado, linhas vêm de `embeddedRowsByFieldId[fieldId]` |

Regras importantes:

- Detecta **ciclos** (`src/utils/embeddedFormCycle.ts`). Se o vínculo encadear A→B→A, a UI mostra mensagem de erro em vez de loop.
- Click em uma instância expandida abre **popup central** (overlay modal) com o formulário interno completo (`NestedEmbeddedLinkedFormView` em `FormCanvas.tsx`).
- Funciona em qualquer profundidade.

---

## 13. `WorkspaceDef` — Explorer (pacotes/classes)

```ts
interface WorkspaceDef {
  id: string
  name: string
  packages?: WorkspacePackage[]
  explorerChromeColor?: string                        // header bg (hex)
  explorerHeaderForeground?: '#ffffff' | '#000000'    // cor do texto/ícones do header
  explorerUserInitials?: string                       // avatar
}

interface WorkspacePackage {
  id: string
  name: string
  classes?: WorkspacePackageClass[]
}

interface WorkspacePackageClass {
  id: string
  name: string
  linkedFormId?: string                              // FormDef.id do épico
  linkedFormExamplePresetIds?: string[]              // presets escolhidos para a listagem central
}
```

### Como o Explorer é desenhado (`src/components/workspace/WorkspaceExplorer.tsx`)

Três colunas horizontais redimensionáveis:

1. **Pacotes (esquerda)** — árvore: cada pacote expansível com suas classes (rotinha colorida).
2. **Objetos (centro)** — para a **classe ativa**, lista 1 card por **preset selecionado** em `linkedFormExamplePresetIds`. Se a lista estiver `undefined`, lista TODOS os presets do form.
3. **Detalhe (direita)** — `FormCanvas` em modo leitura usando o preset ativo do card clicado.

Cada card mostra:

- avatar circular com `iconColor` do preset;
- **linhas de identidade** (campos `relevance: 'identity'`);
- **tags de destaque** (`relevance: 'highlight'`) em formato `Label: valor`.

### Como reduzir a lista a UM menu por classe

Para mostrar apenas um menu **"Gerenciamento de X"** com filtros via tag, basta:

```json
{
  "id": "cls-patlas-gerenciamento-cotacoes",
  "name": "Gerenciamento de cotações",
  "linkedFormId": "form-patlas-cotacao-recebida",
  "linkedFormExamplePresetIds": [
    "patlas-cot-p-tjmt-recebida",
    "patlas-cot-p-em-analise",
    ...
  ]
}
```

E garantir que o campo de status tem `relevance: 'highlight'` para virar tag.

### Tema/cores

Helpers em `src/utils/workspaceExplorerTheme.ts`:

- `resolveWorkspaceHex(value, fallback)` valida hex.
- `WORKSPACE_EXPLORER_HEADER_FG_OPTIONS` — `[{value:'#ffffff', label:'Branco'}, {value:'#000000', label:'Preto'}]`.
- `selectExplorerHeaderForeground` resolve compat com versões antigas.

---

## 14. `ServicePortalDef` — portais

```ts
type ServicePortalDef = {
  id: string
  name: string
} & ServicePortalHomePageData

type ServicePortalHomePageData = {
  servicePortalHomeHeroTitle?: string
  servicePortalHomeHeroSubtitle?: string
  servicePortalHomeSearchPlaceholder?: string
  servicePortalHeaderMenuOptions?: string[]
  servicePortalHeaderNotificationCount?: number
  servicePortalHeaderUserInitials?: string
  servicePortalHomeColorPrimary?: string
  servicePortalHomeColorSecondary?: string
  servicePortalHomeColorText?: string
  servicePortalHomeColorBackground?: string
  servicePortalHomeLogoUrl?: string
  servicePortalHomeCoverImageUrl?: string
  servicePortalHomeSections?: ServicePortalHomeSection[]
}

type ServicePortalHomeSection =
  | { id; type: 'catalog'; name; gridColumns?:1..6; gridRows?:1..5; services?: ServicePortalCatalogService[] }
  | { id; type: 'html'; htmlContent? }

interface ServicePortalCatalogService {
  id: string
  name: string
  description: string
  icon: string        // Material Symbols
}
```

Renderizado por `src/components/ServicePortalHomePageCanvas.tsx`. Cada serviço vira um card; clicar pode navegar (prototipação numa etapa de apresentação — `servicePortalServiceNavigateStepIds`).

### Variante "Convocação Pública" (mínima)

Para portais públicos enxutos (só barra azul com título, sem busca/perfil), basta omitir hero/menu/notificações e usar uma única seção `catalog` com poucos cards. Exemplo real em `data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/portals.json`.

---

## 15. `FlowListItem` / `FlowStep` — apresentações

```ts
interface FlowListItem {
  id: string
  name: string
  steps?: FlowStep[]
}

interface FlowStep {
  id: string
  title: string
  type?: 'html' | 'bpmnActivity' | 'method' | 'servicePortal' | 'workspace' | 'class'
  // + dezenas de campos específicos por tipo (ver src/types.ts)
}
```

### Tipos de etapa

| `type` | Para que serve | Campos relevantes (prefixo) |
|--------|----------------|-----------------------------|
| `html` | slide HTML livre (capa, agenda, conclusão) | `htmlContent`, `htmlPresentationShowHeader`, `htmlPresentationHeaderTitle` |
| `bpmnActivity` | tarefa BPMN com formulário, papel, regras, SLA, eventos | `bpmnTaskType` (`userTask`/`entryForm`), `bpmnActivityKey`, `bpmnDescription`, `bpmnInputs`, `bpmnOutputs`, `bpmnRuleList`, `bpmnPossiblePaths`, `bpmnSla`, `bpmnOnStartEvent`, `assigneeRole`, `linkedFormId`, `bpmnFormConfirmNavigateStepId` |
| `method` | variante enxuta do BPMN (só atividade + formulário + atores + regras + transições) | `methodFormType: 'input'|'output'` |
| `servicePortal` | mostra portal de serviços (home ou serviço específico) | `servicePortalSubtype`, `linkedServicePortalId`, `servicePortalServiceNavigateStepIds`, `servicePortalPresentationDescription`, `servicePortalService*` |
| `workspace` | mostra Explorer (workspace vinculado) | `linkedWorkspaceId`, `workspacePresentationDescription`, `workspaceMethodNavigateStepIds` |
| `class` | mostra uma classe específica em modo leitura | `linkedFormId`, `classPresentationTitle`, `classPresentationDescription`, `classMethodNavigateStepIds` |

### Prototipação (cliques que navegam)

A "prototipação" liga cliques de elementos do canvas a outras etapas:

| Clique no preview | Onde configura |
|-------------------|----------------|
| Botão verde de confirmação (BPMN/Método input) | `step.bpmnFormConfirmNavigateStepId` |
| Card de serviço em portal | `step.servicePortalServiceNavigateStepIds[serviceId]` |
| Método do form num workspace | `step.workspaceMethodNavigateStepIds["{packageId}::{classId}::{methodId}"]` — gerado por `workspaceMethodNavKey()` |
| Método de form em etapa `class` | `step.classMethodNavigateStepIds[methodId]` |

A etapa de destino tem que existir no MESMO `FlowListItem.steps`. O App valida e remove referências quebradas automaticamente.

### Modo apresentação fullscreen

`FlowPresentationFullscreen.tsx` abre um overlay com lista lateral numerada + canvas central. Esc fecha. O canvas usa exatamente `FlowPresentationStepCanvas` (mesmo do preview do editor) — então o que você vê na edição é o que aparece para o cliente.

### Exportação para viewer estático

1. `npm run build` — gera `dist/` com `presentation.html` + bundles.
2. UI → `⋯ → Exportar para viewer estático` → grava em `exports/presentations/<nome>.json`.
3. `npm run zip:presentation -- ./exports/presentations/<nome>.json` → gera `exports/zips/<nome>.zip` self‑contained (Netlify‑ready).

Payload construído por `src/presentation/buildPresentationPayload.ts`.

---

## 16. Grupos da aba Classes (`class-groups.json`)

Só serve para **organizar a lista esquerda** do editor. Formato:

```json
{
  "groups": [
    { "id": "grp-patlas-f1-consulta", "name": "Consulta — Fase 1" }
  ],
  "assignments": {
    "form-patlas-produto-vigente-linha": "grp-patlas-f1-consulta"
  },
  "memberOrderByGroup": {
    "grp-patlas-f1-consulta": [
      "form-patlas-produtos-vigentes",
      "form-patlas-catalogo-licencas"
    ]
  }
}
```

- `groups` — lista canônica.
- `assignments` — mapa `formId → groupId`. Form sem entrada cai em "Sem grupo" (chave reservada `__sem_grupo__` em `EPIC_CLASS_UNGROUPED_ORDER_KEY`).
- `memberOrderByGroup` — ordem manual; ids inválidos são removidos e novos são acrescentados ao fim.

Reconciliação automática em `src/utils/classGroupMemberOrder.ts::reconcileMemberOrderByGroup`.

---

## 17. Pipeline de renderização (Canvas, Explorer, Apresentação)

```
DataTree (useDataTree)
   └─ epic.forms / .workspaces / .portals / .flows
      ├─ Editor de Classe
      │     └─ FormCanvas
      │          ├─ FormSectionedLayout (abas / acordeões)
      │          │   └─ FormFieldsGrid (grid 4-col)
      │          │       └─ fields/{Text|Number|...}Field (1 por type)
      │          ├─ FormReadModeMenuBar (chips de métodos)
      │          ├─ FormReadModeIdentityHighlight (header em modo read)
      │          └─ FormEditDecorActions (botão verde/vermelho)
      │
      ├─ WorkspaceExplorer (preview no editor e em etapa 'workspace')
      │     └─ 3 colunas: pacotes | objetos (cards de preset) | FormCanvas read-only
      │
      ├─ ServicePortalHomePageCanvas (preview portal)
      │
      └─ FlowPresentationStepCanvas (etapas)
            ├─ FlowBpmnActivityCanvas      (BPMN / Método)
            ├─ FlowClassActivityCanvas      (Classe → FormCanvas read-only)
            ├─ FlowWorkspaceActivityCanvas  (Workspace → WorkspaceExplorer)
            ├─ FlowServicePortalHomeActivityCanvas
            └─ HTML livre via dangerouslySetInnerHTML
```

### Estado dos valores digitados

- `CanvasRuntimeValuesProvider` cria um `Map<string,string>` indexado por `canvasRuntimeFieldKey(formId, ancestors, fieldId)`.
- Cada `*Field` lê o valor inicial do preset, mas grava no Map quando o usuário digita.
- O botão verde de "Salvar" (`onSaveCanvas`) chama `flushCanvasRuntimeToActivePreset` que persiste tudo de volta em `FormExampleValuePreset.fieldValues` do preset ativo.

---

## 18. Padrão `scripts/build-*.mjs` — fonte de verdade declarativa

Para épicos grandes (especialmente Projeto Atlas e Atlas) **não se edita o `forms.json` à mão**. Existem scripts ESM em `scripts/` que escrevem o JSON do épico. Padrão:

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const epicDir = path.join(__dirname, '../data/subprojects/<sub>/epics/<epic>')
const outPath = path.join(epicDir, 'forms.json')

// helper consistente em todos os builds
function field(id, label, type, opts = {}) {
  return {
    id, label, type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(opts.sectionId   ? { sectionId: opts.sectionId } : {}),
    ...(opts.options     ? { options: opts.options } : {}),
    ...(opts.linkedFormId? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong    ? { textLong: true } : {}),
    ...(opts.currency    ? { currency: true } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle  ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage? { alertMessage: opts.alertMessage } : {}),
    spec: opts.spec ?? '',
  }
}

const forms = [ /* ... FormDef[] ... */ ]

fs.writeFileSync(outPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
console.log(`Wrote ${outPath} — ${forms.length} forms`)
```

Scripts importantes (todos em `scripts/`):

| Script | Saída |
|--------|-------|
| `build-projeto-atlas-identidade.mjs` | `data/subprojects/projeto-atlas/epics/projeto-atlas-identidade/forms.json` |
| `build-projeto-atlas-parametrizacao.mjs` | `.../projeto-atlas-parametrizacao/forms.json` |
| `build-projeto-atlas-fase1-catalogo.mjs` | `.../projeto-atlas-fase1/forms.json` + `portals.json` + `flows.json` |
| `build-atlas-forms.mjs` | `data/subprojects/atlas/epics/atlas-epico/*.json` (épico antigo monolítico) |
| `build-peap-environment.mjs` | `data/subprojects/peap/epics/peap-desenvolvimento-agil/*.json` |
| `build-nk-forms.mjs`, `build-licitacao-forms.mjs`, `build-formalizacao-classes.mjs` | outros conjuntos |

Subdomínios reaproveitáveis (importados de vários builds):

- `projeto-atlas-cotacao-forms.mjs`
- `projeto-atlas-assinaturas-forms.mjs`
- `projeto-atlas-parametrizacao-forms.mjs`
- `data/projeto-atlas-licencas-catalogo.mjs` (catálogo de 83 licenças)
- `atlas-catalog-forms.mjs`, `atlas-contrato-forms.mjs`, `atlas-portal-cotacao-forms.mjs`, `atlas-proposta-forms.mjs`, etc.

### Como regenerar tudo de um épico

```powershell
node scripts/build-projeto-atlas-fase1-catalogo.mjs
node scripts/build-projeto-atlas-identidade.mjs
node scripts/build-projeto-atlas-parametrizacao.mjs
```

Os scripts são idempotentes: rodar 2x produz o mesmo arquivo. Vite vê a mudança e atualiza a UI.

---

## 19. Convenções de IDs e prefixos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| `FormDef.id` | `form-<prefixo>-<slug>` | `form-patlas-cotacao-recebida` |
| `FormField.id` | `<prefixo>-<dominio>-<slug>` | `patlas-cot-status` |
| `FormSection.id` | `sec-<prefixo>-<slug>` | `sec-patlas-cot-cab` |
| `FormMethod.id` | `<prefixo>-<dominio>-meth-<slug>` | `patlas-cot-meth-gerar-proposta` |
| `FormExampleValuePreset.id` | `<prefixo>-<dominio>-p-<slug>` ou `<prefixo>-<dominio>-preset-N` | `patlas-cot-p-tjmt-recebida` |
| `WorkspaceDef.id` | `ws-<prefixo>-<slug>` | `ws-patlas-fase1-catalogo` |
| `WorkspacePackage.id` | `pkg-<prefixo>-<slug>` | `pkg-patlas-f1-cotacoes` |
| `WorkspacePackageClass.id` | `cls-<prefixo>-<slug>` | `cls-patlas-gerenciamento-cotacoes` |
| `ServicePortalDef.id` | `portal-<prefixo>-<slug>` | `portal-patlas-cotacao-cliente` |
| `FlowListItem.id` | `flow-<prefixo>-<slug>` | `flow-patlas-portal-cotacao` |
| `FlowStep.id` | `step-<prefixo>-<slug>` | `step-patlas-portal-form` |
| `EpicClassGroup.id` | `grp-<prefixo>-<slug>` | `grp-patlas-f1-consulta` |
| `EMB_<dominio>` (campos embedded) | constante interna do script | `emb_patlas_cotacao_itens` |

Prefixos por épico (memorizar para não conflitar):

- **`patlas-`** — Projeto Atlas (todos os épicos novos: identidade, fase1, parametrização, catálogo backoffice).
- **`atlas-`** — Atlas legado (`atlas-epico` monolítico — preservar; não criar novas coisas lá).
- **`peap-`** — Plataforma PEAP.
- **`nk-`** — Naked.
- **`lic-`**, **`form-`** — licitações e formalização.

### IDs em arquivos JSON externos

Apenas slugs `^[a-z0-9][a-z0-9-]*$` para nomes de pasta (subprojeto/épico). Tudo o mais é texto livre.

---

## 20. Métodos com ação embutida (callbacks built‑in)

`src/utils/formMethodActions.ts::tryRunBuiltInFormMethod(form, methodId, getValue, epicForms)` é o dispatcher central. Hoje suporta:

| Dispatcher | Arquivo | Form/método específico |
|-----------|---------|------------------------|
| `downloadAtlasCobrancaReportPdf` | `atlasCobrancaReportPdf.ts` | gera PDF de cobrança |
| `runAtlasCatalogIntegrationMethod` | `atlasCatalogMethods.ts` | integrações de catálogo |
| `runAtlasPortalCotacaoMethod` | `atlasPortalCotacaoMethods.ts` | submissão de cotação no portal |
| `runAtlasPropostaMethod` / `runAtlasPropostaAssinaturaMethod` | `atlasPropostaMethods.ts` | métodos de proposta e assinatura |
| `runAtlasContratoWorkflowMethod` | `atlasContratoMethods.ts` | workflow do contrato |
| `runAtlasVisoesIntegracaoMethod` | `atlasVisoesIntegracaoMethods.ts` | visões de integração |
| `runAtlasPvVisaoMethod` | `atlasPvMethods.ts` | visões de produto vigente |
| `runAtlasNfUsuariosMethod` | `atlasNfUsuariosMethods.ts` | NF de usuários |
| `runAtlasFase1Method` | `atlasFase1Methods.ts` | métodos da Fase 1 (proposta → contrato) |

Padrão de implementação:

```ts
export function runMyMethod(
  form: FormDef,
  methodId: string,
  getValue: (k: string) => string | undefined,
): boolean {
  if (form.id !== 'form-XYZ') return false
  if (methodId !== 'meth-XYZ-something') return false
  // ... efeito (download, alert, etc.) ...
  return true   // tratamos o clique
}
```

Se nenhum dispatcher tratou, o app cai em `onReadModeMethodClick`, que é a navegação prototipada.

---

## 21. Migrações automáticas / formatos legados

Carregados sempre que o app lê o épico:

| Função | Onde | O que faz |
|--------|------|-----------|
| `migrateEpicForms` / `migrateFormLegacyDemoToPresets` | `src/utils/formExamplePresets.ts` | converte `field.demoValue` / `field.embeddedDemoInstances` (formato antigo embutido no campo) para `exampleValuePresets[0].fieldValues` |
| `normalizeFlowsFromEpic` | `src/utils/flowList.ts` | preenche `steps: []` e coage tipos |
| `bpmnRulesListResolved` | `src/utils/flowStep.ts` | converte `bpmnRules` (texto) em `bpmnRuleList` (array) |
| `assigneeRoleDetailText` | idem | converte `candidateGroups[]` legado em texto |
| `stripInlineServicePortalHomeWhenLinked` | `src/utils/servicePortalHomeData.ts` | remove duplicação quando o step linkou portal |
| `reconcileMemberOrderByGroup` | `src/utils/classGroupMemberOrder.ts` | conserta ordem de classes sumidas/novas |

O código **não escreve de volta** a versão migrada até o usuário tocar (e disparar um save). Quem ler o JSON deve aplicar as migrações.

---

## 22. Recomendações para criar coisas novas

> Estas regras refletem o que o time tem feito. Seguindo elas tudo permanece consistente entre Atlas legado e Projeto Atlas.

1. **Sempre prefira escrever um script `scripts/build-*.mjs`** para épicos não triviais (>10 forms). Vantagens:
   - reuso de constantes (`STATUS_*`, `METRICA`, etc.);
   - revisão diff‑friendly (linhas de JS vs. milhares de linhas de JSON);
   - presets gerados a partir de listas;
   - regeneração idempotente.
2. **Edição manual** do `forms.json` só para tweaks pontuais; senão o próximo `node scripts/build-...mjs` apaga.
3. **Cada épico em pasta própria** (`data/subprojects/<sub>/epics/<epic>/`). Subprojetos podem agrupar épicos correlatos.
4. **Mantenha 1 campo identidade** + **2–5 destaques** por classe (vitais para Explorer/cards).
5. **Workspaces seguem domínio**, não arquitetura: agrupe pacotes/classes pela visão do usuário final.
6. **Presets com nomes curtos** (até 48 caracteres). O preset name vira o título do card no Explorer.
7. **Status como `textOptions` + `relevance: 'highlight'`** — vira "tag" automática nos cards.
8. **Para listagem de UM menu só** (ex.: "Gerenciamento de cotações"), use uma única `WorkspacePackageClass` que aponta para todos os presets do form.
9. **Para listagem por seção/categoria** (ex.: Workspace + Simplifica + IA), use múltiplas classes ou múltiplos presets de "tela" com `embeddedRowsByFieldId`.
10. **Documente o épico em `context.md`** ao lado dos JSON, com os comandos de regeneração.

---

## Apêndice A — referência rápida de enums

```ts
FieldType = 'text' | 'number' | 'decimal' | 'boolean' | 'date'
         | 'reference' | 'textOptions' | 'embeddedReference'
         | 'file' | 'geopoint' | 'html' | 'alert'

FieldRelevance = 'identity' | 'highlight' | 'common' | 'advanced'
FieldSize      = 'small'    | 'medium'    | 'large'
FormSectionLayout = 'none' | 'accordion' | 'tabs'
FormMethodKind   = 'destaque' | 'menu'
FormCanvasMode   = 'edit' | 'read'

FlowActivityType =
  'html' | 'bpmnActivity' | 'method' | 'servicePortal' | 'workspace' | 'class'
ServicePortalSubtype = 'homePage' | 'service'
ServicePortalHomeSectionType = 'catalog' | 'html'

FieldVisibilityRuleAction = 'hide' | 'show' | 'readonly' | 'editable'
FieldAlertVariant = 'warning' | 'error' | 'info' | 'success'
EmbeddedDisplayMode = 'form' | 'table'
```

Rótulos PT‑BR (de `types.ts`):

```ts
FIELD_TYPE_LABELS: {
  text:'Texto', number:'Número', decimal:'Decimal', boolean:'Booleano',
  date:'Data', reference:'Referência', textOptions:'Opções em texto',
  embeddedReference:'Ref. Embutida', file:'Arquivo',
  geopoint:'Coordenada geográfica', html:'HTML', alert:'Alerta',
}

FIELD_RELEVANCE_LABELS: {
  identity:'Identidade', highlight:'Destaque', common:'Comum', advanced:'Avançado',
}

FIELD_SIZE_LABELS: { small:'Pequeno', medium:'Médio', large:'Grande' }
SIZE_SPAN:         { small: 1,        medium: 2,      large: 4 }
```

---

## Apêndice B — exemplo mínimo de classe

`FormDef` mínimo válido (uma classe "Pedido" com 3 campos e 2 cenários):

```json
{
  "id": "form-demo-pedido",
  "name": "Pedido",
  "sectionLayout": "none",
  "defaultCanvasMode": "read",
  "metadata": "Classe demonstrativa do Especificador.",
  "fields": [
    {
      "id": "demo-pedido-numero",
      "type": "text",
      "label": "Número do pedido",
      "size": "small",
      "readOnly": false,
      "required": true,
      "multiple": false,
      "relevance": "identity",
      "spec": "Identidade. Apenas leitura no Explorer."
    },
    {
      "id": "demo-pedido-status",
      "type": "textOptions",
      "label": "Status",
      "size": "medium",
      "readOnly": false,
      "required": true,
      "multiple": false,
      "relevance": "highlight",
      "options": ["Aberto", "Em andamento", "Concluído", "Cancelado"],
      "spec": ""
    },
    {
      "id": "demo-pedido-valor",
      "type": "decimal",
      "label": "Valor total (R$)",
      "size": "medium",
      "readOnly": false,
      "required": true,
      "multiple": false,
      "relevance": "highlight",
      "currency": true,
      "spec": ""
    }
  ],
  "methods": [
    { "id": "demo-pedido-meth-aprovar", "name": "Aprovar", "icon": "verified", "kind": "destaque" },
    { "id": "demo-pedido-meth-cancelar", "name": "Cancelar", "icon": "cancel", "kind": "menu" }
  ],
  "exampleValuePresets": [
    {
      "id": "demo-pedido-p1",
      "name": "Pedido aberto",
      "iconColor": "#0c1ba8",
      "fieldValues": {
        "demo-pedido-numero": "PED-0001",
        "demo-pedido-status": "Aberto",
        "demo-pedido-valor": 1250.5
      }
    },
    {
      "id": "demo-pedido-p2",
      "name": "Pedido concluído",
      "iconColor": "#059669",
      "fieldValues": {
        "demo-pedido-numero": "PED-0002",
        "demo-pedido-status": "Concluído",
        "demo-pedido-valor": 980
      }
    }
  ],
  "activeExamplePresetId": "demo-pedido-p1"
}
```

Para esta classe aparecer no Explorer:

```json
// workspaces.json
[
  {
    "id": "ws-demo-pedidos",
    "name": "Pedidos",
    "explorerChromeColor": "#0c1ba8",
    "explorerHeaderForeground": "#ffffff",
    "packages": [
      {
        "id": "pkg-demo-pedidos",
        "name": "Operacional",
        "classes": [
          {
            "id": "cls-demo-pedidos",
            "name": "Pedidos",
            "linkedFormId": "form-demo-pedido"
          }
        ]
      }
    ]
  }
]
```

Sem `linkedFormExamplePresetIds`, **todos** os presets aparecem como cards.

---

## Apêndice C — fluxo completo de um épico Atlas

Como exemplo prático, abaixo o caminho de **um item no Projeto Atlas Fase 1**, do build script até a tela do usuário:

```
scripts/build-projeto-atlas-fase1-catalogo.mjs
│
│  importa:
│   - scripts/projeto-atlas-cotacao-forms.mjs
│   - scripts/projeto-atlas-assinaturas-forms.mjs
│   - scripts/projeto-atlas-parametrizacao-forms.mjs
│   - scripts/data/projeto-atlas-licencas-catalogo.mjs   (83 itens)
│
└─→ escreve 3 arquivos:
       data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/forms.json     (13 FormDef)
       data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/portals.json   (1 portal "Convocação Pública")
       data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/flows.json     (1 flow do portal de cotação)

data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/
├─ epic.json                 { "name": "Fase 1 — Catálogo e proposta" }
├─ forms.json                (13 classes — produtos, licenças, serviços, cotações, propostas, contratos)
├─ workspaces.json           1 workspace "ws-patlas-fase1-catalogo" com 4 pacotes:
│                              • Consulta (Produtos / Licenças / Serviços)
│                              • Cotações (MTI) — Gerenciamento de cotações
│                              • Proposta
│                              • Assinaturas e contrato
├─ portals.json              portal-patlas-cotacao-cliente
├─ flows.json                flow-patlas-portal-cotacao  (home → form → confirmação | acompanhar)
├─ class-groups.json         4 grupos (Consulta/Cotações/Proposta/Assinaturas)
└─ context.md                "Regenerar: node scripts/build-projeto-atlas-fase1-catalogo.mjs"

UI:
  1. App.tsx lê via /api/data → DataTree.
  2. Usuário escolhe Projeto Atlas → Fase 1.
  3. FormList lista 13 classes agrupadas conforme class-groups.json.
  4. Aba Workspaces mostra "ws-patlas-fase1-catalogo".
  5. Click em "Catálogo de Licenças" → 83 cards (1 por preset) em FormCanvas read-only.
  6. Aba Apresentações → "Portal — cotação cliente" tem 4 etapas clicáveis.
  7. Botão ▶ abre fullscreen; click no card "Enviar cotação" navega para o step do form.
```

Documentação adicional no próprio repositório:

- `data/subprojects/projeto-atlas/MODELAGEM-PROJETO-ATLAS.md` — modelagem ER do Atlas.
- `data/subprojects/projeto-atlas/epics/projeto-atlas-identidade/IDENTIDADE-E-PERFIS-ARQUITETURA.md`
- `data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/REQUISITO-04-ASSINATURAS.md`
- `data/subprojects/projeto-atlas/epics/projeto-atlas-fase1/COTACAO-CLIENTE-MTI.md`
- `data/subprojects/projeto-atlas/epics/projeto-atlas-parametrizacao/HISTORIA-02-PARAMETRIZACAO.md`
- `README.md` — manual do usuário final do editor.

---

**FIM.** Tudo o que está acima reflete o estado real do código nesta data e pode ser usado como prompt/context para outra IA sem mais explicações. Quando descrever **uma intenção** ao agente, sempre indique:

1. **Em qual épico** trabalhar (`data/subprojects/<sub>/epics/<epic>/`).
2. **Qual o script de build** correspondente (se houver).
3. **O que muda** em termos de `FormDef` / `FlowStep` / `WorkspaceDef` / `ServicePortalDef`.
4. **Que IDs novos** introduzir (siga §19).
5. **Quais presets** usar para identidade/destaque (§7) e onde aparecem (§13).
