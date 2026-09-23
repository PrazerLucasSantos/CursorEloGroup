export type FieldType =
  | 'text'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'reference'
  | 'textOptions'
  | 'embeddedReference'
  | 'file'
  | 'geopoint'
  | 'html'
  | 'alert'

/** Variante visual do campo tipo alerta. */
export type FieldAlertVariant = 'warning' | 'error' | 'info' | 'success'

export type FieldSize = 'small' | 'medium' | 'large'

export type FieldRelevance = 'identity' | 'highlight' | 'common' | 'advanced'

/** Visualização do bloco ref. embutida no canvas / export */
export type EmbeddedDisplayMode = 'form' | 'table'

/** Item de arquivo na demonstração (nome sem extensão obrigatória + tipo/extensão). */
export interface FileDemoItem {
  name: string
  /** Extensão ou rótulo curto (ex.: pdf, PNG, docx). */
  kind: string
}

/**
 * Valor inicial só para demonstração (canvas e HTML exportado).
 * Por tipo: texto/data ISO; número; booleano; string[] (referência/opções múltiplas); { lat, lng } (geoponto);
 * `FileDemoItem[]` para campo arquivo (lista de anexos simulados).
 */
export type FieldDemoValue =
  | string
  | number
  | boolean
  | string[]
  | { lat: string; lng: string }
  | FileDemoItem[]

/** Célula da linha: valor escalar ou sub-bloco embutido recursivo. */
export type EmbeddedCellDemo =
  | FieldDemoValue
  | {
      embeddedDemoInstances: EmbeddedDemoRow[]
    }

/** Uma linha de demo: id do campo aninhado → valor ou sub-bloco. */
export type EmbeddedDemoRow = Partial<Record<string, EmbeddedCellDemo>>

/** Alias para sub-bloco na linha (mesmo formato que em EmbeddedCellDemo). */
export type EmbeddedChildBranch = Extract<EmbeddedCellDemo, { embeddedDemoInstances: unknown }>

export interface FormField {
  id: string
  type: FieldType
  label: string
  size: FieldSize
  readOnly: boolean
  /**
   * Oculto: o campo não é renderizado no canvas nem na exportação HTML (como somente leitura, mas invisível).
   * Omisso ou false: visível.
   */
  hidden?: boolean
  required: boolean
  multiple: boolean
  relevance: FieldRelevance
  htmlContent?: string
  textLong?: boolean
  options?: string[]
  currency?: boolean
  spec?: string
  /**
   * Ref. embutida ou referência: id de outro `FormDef` no mesmo épico.
   * Em `reference`, opções vêm das linhas do cadastro mestre (`form-atlas-cadastro-maestros`) que embute esse formulário.
   */
  linkedFormId?: string
  /**
   * Filtra opções de `reference` pelos valores seleccionados noutro campo deste formulário.
   * Ex.: ao escolher Catálogo, listar só Soluções/Produtos cujo campo de vínculo aponta para esse catálogo.
   */
  filterByReference?: {
    /** Campo fonte neste formulário (ex.: `…-catalogos`). Opcional se `matchEquals` for usado. */
    sourceFieldId?: string
    /**
     * Valor constante para filtrar o formulário vinculado (ex.: tipo Organização = `MTI`)
     * quando não há campo fonte dinâmico.
     */
    matchEquals?: string
    /**
     * Campo(s) no formulário `linkedFormId` que devem coincidir com o valor fonte
     * (ex.: `…-cat-produto-catalogo`, `…-cat-solucao-catalogo`).
     */
    matchFieldIds: string[]
  }
  /** Modo de exibição no canvas (ref. embutida múltipla); padrão: formulário */
  embeddedDisplay?: EmbeddedDisplayMode
  /**
   * IDs de campos do formulário vinculado a omitir nas colunas da tabela embutida
   * (ex.: Catálogo/Parceria/Solução herdados quando o bloco já está dentro do Catálogo).
   */
  embeddedTableHiddenFieldIds?: string[]
  /** Raiz (ref. embutida não múltipla); comportamento reservado para evolução futura */
  embeddedRoot?: boolean
  /** Seção (apenas campos raiz; obrigatório quando o formulário usa seções) */
  sectionId?: string
  /**
   * Visibilidade condicional simples (protótipo Demanda): mostra o campo só quando
   * `fieldId` no mesmo formulário tem o valor `equals`.
   */
  visibleWhen?: {
    fieldId: string
    equals: string
  }
  /** Só `type: 'alert'`: estilo (ícone padrão por variante). */
  alertVariant?: FieldAlertVariant
  /** Título exibido no banner do alerta (o `label` do campo é o nome na lista, como nos outros tipos). */
  alertTitle?: string
  /** Texto secundário abaixo do título. */
  alertMessage?: string
  /** Permite recolher a mensagem (só título visível). */
  alertCollapsible?: boolean
}

/** Campo a mostrar no formulário (não «oculto»). */
export function isFormFieldVisibleInForm(field: FormField): boolean {
  return field.hidden !== true
}

/** Modo do canvas do formulário (preview / export raiz); não altera `readOnly` por campo. */
export type FormCanvasMode = 'edit' | 'read'

/** Sem seções (lista única) | acordeão | abas no topo */
export type FormSectionLayout = 'none' | 'accordion' | 'tabs'

export interface FormSection {
  id: string
  title: string
  /** Nome do ícone Material Symbols (ex.: `description`, `calendar_month`) */
  icon?: string
  /**
   * Se definido, esta entrada é sub-seção da aba indicada (só um nível; só com `sectionLayout: 'tabs'`).
   * Campos usam `sectionId` = id da aba (direto no painel) ou id da sub-seção.
   */
  parentSectionId?: string
}

/** Método associado ao formulário (configuração na sidebar «Métodos»). */
export type FormMethodKind = 'destaque' | 'menu'

export interface FormMethod {
  id: string
  name: string
  /** Nome do glifo Material Symbols (ex.: `hub`, `article`) */
  icon: string
  kind: FormMethodKind
  /** Formulário de parâmetros exibido ao acionar o método no canvas (modo leitura). */
  inputFormId?: string
  /**
   * Se definido, o método só aparece quando o campo origem (`textOptions`) tem um dos valores listados
   * (cenário activo / valor no canvas). Útil para fluxos de processo guiados por status.
   */
  visibleWhen?: {
    sourceFieldId: string
    expectedOptionTexts: string[]
  }
}

export function fieldSupportsMultiple(type: FieldType): boolean {
  return type === 'reference' || type === 'textOptions' || type === 'embeddedReference'
}

/**
 * Conjunto nomeado de valores de exemplo para o canvas/export (um formulário pode ter vários).
 */
export interface FormExampleValuePreset {
  id: string
  name: string
  /**
   * Cor de fundo do ícone circular do cenário (listagem, header, export).
   * Deve ser uma das opções em `PRESET_ICON_COLOR_CHOICES` (hex com #); omisso: primeira da paleta.
   */
  iconColor?: string
  fieldValues?: Partial<Record<string, FieldDemoValue>>
  embeddedRowsByFieldId?: Partial<Record<string, EmbeddedDemoRow[]>>
}

/** Operador de condição nas regras de visibilidade (v1: só `eq`; extensível). */
export type FieldVisibilityOperator = 'eq'

/** Ação da regra condicional (visibilidade ou modo de edição no canvas). */
export type FieldVisibilityRuleAction = 'hide' | 'show' | 'readonly' | 'editable'

/**
 * Regra: quando o campo origem satisfaz a condição, aplica acção aos campos alvo (raiz).
 * Ordem do array na classe: última regra que afecta um alvo vence (por dimensão: visibilidade vs. edição).
 */
export type FieldVisibilityRule =
  | {
      id: string
      operator: FieldVisibilityOperator
      sourceFieldId: string
      action: FieldVisibilityRuleAction
      targetFieldIds: string[]
      sourceKind: 'boolean'
      expectedBoolean: boolean
    }
  | {
      id: string
      operator: FieldVisibilityOperator
      sourceFieldId: string
      action: FieldVisibilityRuleAction
      targetFieldIds: string[]
      sourceKind: 'textOptions'
      /** Texto da opção seleccionada (igual ao valor no canvas / cenário). */
      expectedOptionText: string
    }

export interface FormDef {
  id: string
  name: string
  fields: FormField[]
  /** Padrão do canvas na aba Formulários e na exportação HTML; padrão: edição. */
  defaultCanvasMode?: FormCanvasMode
  /** Se `accordion` ou `tabs`, `sections` e `sectionId` nos campos raiz são obrigatórios */
  sectionLayout?: FormSectionLayout
  sections?: FormSection[]
  /** Métodos próprios deste formulário (nome, ícone Material, tipo Destaque ou Menu). */
  methods?: FormMethod[]
  /** Cenários de valores de exemplo (aba «Valores de exemplo» na sidebar). */
  exampleValuePresets?: FormExampleValuePreset[]
  /** Preset usado no canvas e na exportação; omisso: o primeiro da lista. */
  activeExamplePresetId?: string
  /** Texto livre opcional sobre a classe (reservado para a aba metadata na sidebar). */
  metadata?: string
  /** Ids de campos cujo rótulo (`field__label`) fica oculto no canvas e na exportação. */
  hiddenLabelFieldIds?: string[]
  /** Regras condicionais: visibilidade e só leitura / editável (preview no canvas; não persiste `hidden` nem `readOnly`). */
  fieldVisibilityRules?: FieldVisibilityRule[]
}

/** Tipos de atividade escolhidos na UI (legado em JSON: `activity` ≈ BPMN). */
export type FlowActivityType = 'html' | 'bpmnActivity' | 'method' | 'servicePortal' | 'workspace' | 'class'
export type ServicePortalSubtype = 'homePage' | 'service'

export type ServicePortalHomeSectionType = 'catalog' | 'html'

/** Seção tipo catálogo (lista de serviços em cards). */
export interface ServicePortalHomeCatalogSection {
  id: string
  type: 'catalog'
  name: string
  /**
   * Quantidade de “slots” por linha (1–6): mesma largura por card; linhas incompletas ficam centradas.
   * Omisso: 3.
   */
  gridColumns?: number
  /**
   * Linhas de exibição (1–5); no máximo `gridColumns * gridRows` serviços aparecem no preview deste catálogo.
   * Omisso: 2.
   */
  gridRows?: number
  services?: ServicePortalCatalogService[]
}

/** Seção HTML livre no corpo da página inicial. */
export interface ServicePortalHomeHtmlSection {
  id: string
  type: 'html'
  htmlContent?: string
}

export type ServicePortalHomeSection = ServicePortalHomeCatalogSection | ServicePortalHomeHtmlSection

/** @deprecated Use `ServicePortalHomeCatalogSection` (com `type: 'catalog'`). Mantido para leitura de JSON antigo. */
export type ServicePortalCatalog = Omit<ServicePortalHomeCatalogSection, 'type'> & { type?: 'catalog' }

export interface ServicePortalCatalogService {
  id: string
  name: string
  description: string
  icon: string
  /** @deprecated Legado (normalizado). No formato atual os serviços vivem dentro do catálogo. */
  catalogId?: string
}

export interface BpmnPossiblePath {
  key: string
  value: string
}

/** Etapa de um fluxo (flows.json; campos extras preservados ao carregar/salvar). */
export interface FlowStep {
  id: string
  title: string
  /** Ausente até o usuário definir na UI; não é alterado depois. */
  type?: string
  htmlContent?: string
  /**
   * Etapa HTML livre: header com título + logo (mesmo estilo BPMN/workspace/portal), sem linha de tipo nem faixa de papel.
   */
  htmlPresentationShowHeader?: boolean
  /** Título no header quando `htmlPresentationShowHeader` está activo. */
  htmlPresentationHeaderTitle?: string
  linkedFormId?: string
  /**
   * Etapa do mesmo fluxo para a qual navegar no preview ao clicar no botão verde
   * de confirmação do formulário (modo edição).
   */
  bpmnFormConfirmNavigateStepId?: string
  /** Nome da atividade (em JSON histórico: `bpmnActivityKey`). */
  bpmnActivityKey?: string
  /** Objetivo da atividade (texto livre). */
  bpmnDescription?: string
  /** Tipo da atividade BPMN na UI: `userTask` (atividade de usuário) ou `entryForm` (formulário de entrada). */
  bpmnTaskType?: string
  /** Etapa `method`: variante visual do formulário no preview. */
  methodFormType?: 'input' | 'output'
  /** Entradas necessárias para executar a atividade. */
  bpmnInputs?: string
  /** Saídas geradas pela atividade. */
  bpmnOutputs?: string
  /** Regras de negócio em lista (uma string por regra). */
  bpmnRuleList?: string[]
  /** @deprecated Preferir `bpmnRuleList`. Texto corrido; na migração é repartido por linhas. */
  bpmnRules?: string
  /**
   * Prototipação de rotas: condição de saída → destino em texto (ex.: próxima etapa ou nome da atividade).
   * Complementa `bpmnRuleList` / regras em texto; aqui o foco é indicar o caminho de forma enxuta.
   */
  bpmnPossiblePaths?: BpmnPossiblePath[]
  /** Transição quando o resultado for aprovado. */
  /** @deprecated Substituído por `bpmnPossiblePaths` (ou regras em `bpmnRuleList`). */
  bpmnTransitionApproved?: string
  /** Transição quando o resultado for rejeitado. */
  /** @deprecated Substituído por `bpmnPossiblePaths` (ou regras em `bpmnRuleList`). */
  bpmnTransitionRejected?: string
  /** SLA / prazo máximo para concluir a atividade. */
  bpmnSla?: string
  /** O que ocorre se o prazo do SLA for ultrapassado (escalonamento, notificação, transição etc.). */
  bpmnSlaIfExceeded?: string
  /** Evento disparado ao iniciar a atividade. */
  bpmnOnStartEvent?: string
  /** Evento disparado ao concluir a atividade. */
  bpmnOnCompleteEvent?: string
  /** Papel principal / responsável pela tarefa. */
  assigneeRole?: string
  /**
   * Descrição do papel: de onde vem o ator, quem é, regras para atendimento por essa pessoa, etc.
   * (texto livre; multilinha permitido).
   */
  assigneeRoleDetail?: string
  /** @deprecated Preferir `assigneeRoleDetail`. Mantido para leitura de fluxos antigos. */
  candidateGroups?: string[]
  /** Subtipo do portal de serviços: página inicial ou serviço específico. */
  servicePortalSubtype?: ServicePortalSubtype
  /**
   * Página inicial reutilizável: id em `portals.json` do épico.
   * Quando definido, os campos `servicePortalHome*` e catálogos na própria etapa são ignorados em favor da definição.
   */
  linkedServicePortalId?: string
  /**
   * Etapa portal (página inicial): texto do preview entre papel e o canvas do portal (como a descrição do workspace).
   */
  servicePortalPresentationDescription?: string
  /**
   * Etapa portal (página inicial): prototipação — ao clicar num serviço do catálogo no preview,
   * navegar para esta etapa do mesmo fluxo. Chave: `ServicePortalCatalogService.id` do portal vinculado
   * (ou da configuração inline legada).
   */
  servicePortalServiceNavigateStepIds?: Record<string, string>
  /**
   * Etapa tipo `workspace`: id em `workspaces.json` do épico a exibir no preview (Explorer).
   */
  linkedWorkspaceId?: string
  /**
   * Preview workspace: ao clicar num método do formulário (modo leitura), navegar para esta etapa do mesmo fluxo.
   * Chave: `packageId::classId::methodId` (ids no workspace vinculado + `FormMethod.id`).
   */
  workspaceMethodNavigateStepIds?: Record<string, string>
  /**
   * Etapa workspace: texto do preview (bloco como «Objetivo» na BPMN), entre papel e Explorer.
   */
  workspacePresentationDescription?: string
  /**
   * Etapa `class`: título exibido no hero do preview; omisso usa `title` da etapa.
   */
  classPresentationTitle?: string
  /**
   * Etapa `class`: descrição contextual exibida acima do formulário.
   */
  classPresentationDescription?: string
  /**
   * Etapa `class`: prototipação — ao clicar num método do formulário no preview (modo leitura),
   * navegar para o `id` da etapa no mesmo fluxo. Chave: `FormMethod.id` do formulário vinculado (`linkedFormId`).
   */
  classMethodNavigateStepIds?: Record<string, string>
  /** Portal (página inicial): título na área hero. */
  servicePortalHomeHeroTitle?: string
  /** Portal (página inicial): subtítulo na área hero. */
  servicePortalHomeHeroSubtitle?: string
  /** Portal (página inicial): placeholder de busca. */
  servicePortalHomeSearchPlaceholder?: string
  /** Portal (página inicial): opções exibidas no menu superior. */
  servicePortalHeaderMenuOptions?: string[]
  /** Portal (página inicial): contador de notificações no topo. */
  servicePortalHeaderNotificationCount?: number
  /** Portal (página inicial): iniciais do usuário no avatar. */
  servicePortalHeaderUserInitials?: string
  /** Portal: cor primária do tema (hex, ex.: #0c1ba8). */
  servicePortalHomeColorPrimary?: string
  /** Portal: cor secundária do tema (hex). */
  servicePortalHomeColorSecondary?: string
  /** Portal: cor principal dos textos (hex). */
  servicePortalHomeColorText?: string
  /** Portal: cor de fundo da página (hex). */
  servicePortalHomeColorBackground?: string
  /** Portal: URL do logotipo (imagem) no header. */
  servicePortalHomeLogoUrl?: string
  /** Portal: URL da imagem de capa (hero) — sobrepõe o degradê padrão. */
  servicePortalHomeCoverImageUrl?: string
  /**
   * Página inicial: blocos ordenados (catálogo de serviços ou HTML livre).
   * Quando preenchido, tem prioridade sobre `servicePortalCatalogs` legado.
   */
  servicePortalHomeSections?: ServicePortalHomeSection[]
  /** @deprecated Preferir `servicePortalHomeSections` com `type: 'catalog'`. */
  servicePortalCatalogs?: ServicePortalCatalog[]
  /** @deprecated Formato legado (normalizado). Preferir `servicePortalHomeSections`. */
  servicePortalCatalogServices?: ServicePortalCatalogService[]
  /** Portal (serviço): nome amigável do serviço. */
  servicePortalServiceName?: string
  /** Portal (serviço): identificador/código no catálogo. */
  servicePortalServiceCode?: string
  /** Portal (serviço): rota/URL de entrada do serviço. */
  servicePortalServiceEntryUrl?: string
  /** Portal (serviço): resumo da proposta de valor e escopo. */
  servicePortalServiceSummary?: string
  /** Portal (serviço): prazo/SLA esperado para atendimento. */
  servicePortalServiceSla?: string
  /** Portal (serviço): área responsável pelo atendimento. */
  servicePortalServiceOwnerArea?: string
}

/** Campos da “página inicial” reutilizáveis (etapa embutida legada, `portals.json` ou definição mesclada). */
export type ServicePortalHomePageData = Pick<
  FlowStep,
  | 'servicePortalHomeHeroTitle'
  | 'servicePortalHomeHeroSubtitle'
  | 'servicePortalHomeSearchPlaceholder'
  | 'servicePortalHeaderMenuOptions'
  | 'servicePortalHeaderNotificationCount'
  | 'servicePortalHeaderUserInitials'
  | 'servicePortalHomeColorPrimary'
  | 'servicePortalHomeColorSecondary'
  | 'servicePortalHomeColorText'
  | 'servicePortalHomeColorBackground'
  | 'servicePortalHomeLogoUrl'
  | 'servicePortalHomeCoverImageUrl'
  | 'servicePortalHomeSections'
  | 'servicePortalCatalogs'
  | 'servicePortalCatalogServices'
>

/** Definição reutilizável de portal (página inicial) no épico, referenciada por `FlowStep.linkedServicePortalId`. */
export type ServicePortalDef = { id: string; name: string } & ServicePortalHomePageData

/** Classe dentro de um pacote do workspace (Explorer). */
export interface WorkspacePackageClass {
  id: string
  name: string
  /** Formulário do épico associado (mesmo `FormDef.id`). */
  linkedFormId?: string
  /**
   * Cenários de exemplo do formulário vinculado (`FormExampleValuePreset.id`) selecionados para esta classe
   * na listagem de objetos (vários permitidos).
   */
  linkedFormExamplePresetIds?: string[]
}

/** Pacote lógico do workspace (lista no Explorer + configuração). */
export interface WorkspacePackage {
  id: string
  name: string
  classes?: WorkspacePackageClass[]
}

/** Workspace reutilizável no épico — `workspaces.json`. */
export interface WorkspaceDef {
  id: string
  name: string
  /** Pacotes e classes exibidos/configuráveis no Explorer. */
  packages?: WorkspacePackage[]
  /** Cor do chrome (barra superior + fundo ao redor dos painéis), ex. `#7a8510`. */
  explorerChromeColor?: string
  /** Cor do texto e dos ícones do header: branco ou preto (igual ao portal). */
  explorerHeaderForeground?: '#ffffff' | '#000000'
  /** @deprecated Leitura só para dados antigos; preferir `explorerHeaderForeground`. */
  explorerIconColor?: string
  /** @deprecated Leitura só para dados antigos; preferir `explorerHeaderForeground`. */
  explorerHeaderText?: 'dark'
  /** Iniciais no avatar (até 4 caracteres); se vazio, derivadas de `name`. */
  explorerUserInitials?: string
}

/** Listagem de fluxos (dados completos em `flows.json`; a UI pode incluir etapas em sessão). */
export interface FlowListItem {
  id: string
  name: string
  steps?: FlowStep[]
}

/** Grupo da aba Classes no painel do épico — persistido em `class-groups.json`. */
export interface EpicClassGroup {
  id: string
  name: string
  /** Subgrupo aninhado visualmente abaixo do pai na aba Classes. */
  parentGroupId?: string
}

/**
 * Conteúdo de `class-groups.json` (mesmo diretório que `forms.json`).
 * Mantém `forms.json` como array puro de {@link FormDef}.
 */
export interface EpicClassGroupsFile {
  groups: EpicClassGroup[]
  /** formId → groupId; omitidos aparecem em «Sem grupo». */
  assignments: Record<string, string>
  /**
   * Ordem de exibição por grupo (`groupId` → ids de classe).
   * Chave `__sem_grupo__` para classes sem grupo (ver `EPIC_CLASS_UNGROUPED_ORDER_KEY` em utils).
   */
  memberOrderByGroup?: Record<string, string[]>
}

export interface Epic {
  id: string
  name: string
  forms: FormDef[]
  flows?: FlowListItem[]
  /** Definições reutilizáveis de portais (página inicial) — `portals.json`. */
  portals?: ServicePortalDef[]
  /** Definições de workspaces — `workspaces.json`. */
  workspaces?: WorkspaceDef[]
  /** Grupos da listagem de classes — `class-groups.json`. */
  classGroups?: EpicClassGroup[]
  /** Atribuições classe → grupo — `class-groups.json`. */
  classGroupAssignments?: Record<string, string>
  /** Ordem das classes por grupo — `class-groups.json`. */
  classGroupMemberOrder?: Record<string, string[]>
}

export interface Subproject {
  id: string
  name: string
  epics: Epic[]
}

export interface DataTree {
  projectName: string
  subprojects: Subproject[]
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto',
  number: 'Número',
  decimal: 'Decimal',
  boolean: 'Booleano',
  date: 'Data',
  reference: 'Referência',
  textOptions: 'Opções em texto',
  embeddedReference: 'Ref. Embutida',
  file: 'Arquivo',
  geopoint: 'Coordenada geográfica',
  html: 'HTML',
  alert: 'Alerta',
}

export const FIELD_RELEVANCE_LABELS: Record<FieldRelevance, string> = {
  identity: 'Identidade',
  highlight: 'Destaque',
  common: 'Comum',
  advanced: 'Avançado',
}

export const FIELD_SIZE_LABELS: Record<FieldSize, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
}

export const SIZE_SPAN: Record<FieldSize, number> = {
  small: 1,
  medium: 2,
  large: 4,
}
