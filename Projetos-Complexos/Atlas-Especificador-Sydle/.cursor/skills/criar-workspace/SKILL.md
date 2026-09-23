---
name: criar-workspace
description: Modelar workspaces (Explorer) no Espec com todas as configurações disponíveis: aparência, pacotes, classes, vínculo com formulários e cenários da listagem de objetos.
paths:
  - "Espec/data/**/workspaces.json"
  - "Espec/src/components/workspace/**/*.tsx"
  - "Espec/src/types.ts"
---

# Criar workspace — Espec (TJCE)

Esta skill guia a criação de um `WorkspaceDef` completo no `workspaces.json` do épico.

Objetivo: entregar um workspace coerente para o Explorer (pacotes, classes e listagem de objetos) sem inventar campos fora do modelo.

---

## Leitura rápida para IA (ordem de execução)

1. Identificar **papel-alvo** do workspace (ex.: fiscal de contrato).
2. Montar pacotes e classes para cobrir a **jornada ponta a ponta** do papel.
3. Para cada classe operacional, definir `linkedFormId`.
4. Para cada `linkedFormId`, garantir **>= 5 `exampleValuePresets`** no formulário referenciado.
5. Se houver menos de 5, criar presets faltantes no `forms.json` antes de finalizar.
6. Validar ids, presets, consistência e JSON final.

Se houver conflito entre seções desta skill, esta seção prevalece.

---

## Conceito (estilo Sydle One)

- **Workspace é uma área de trabalho por papel/jornada**, não só uma árvore técnica.
- O workspace deve reunir as classes necessárias para a pessoa executar o trabalho de ponta a ponta.
- **Pacotes** são agrupadores de classes por domínio de negócio.
- **Classes** são os tipos de objeto daquele domínio (normalmente vinculados a formulário).
- A modelagem deve refletir o sistema por contexto funcional.

Exemplos:

- Pacote **Gestão contratual**: `Contrato`, `Aditivo`, `Fiscalização`, `Fornecedor`.
- Pacote **RH**: `Colaborador`, `Lotação`, `Férias`.
- Pacote **Financeiro**: `Empenho`, `Pagamento`, `Liquidação`.

Regra de ouro: classe entra no pacote onde o usuário naturalmente procuraria esse objeto no processo real.

### Exemplo de desenho por papel (fiscal de contrato)

Para o workspace **Fiscal de contrato**, incluir classes que ele realmente usa no dia a dia:

- **Gestão contratual**: `Contrato`, `Aditivo`, `Fiscalização`.
- **Financeiro**: `Empenho`, `Liquidação`, `Pagamento` (quando impacta acompanhamento).
- **Fornecedores**: `Fornecedor` e cadastros relacionados.
- **Apoio** (se existir no produto): `Ocorrência`, `Notificação`, `Medição`.

Critério de inclusão: se a ausência da classe obriga o usuário a sair do workspace para concluir uma tarefa comum do papel, essa classe provavelmente deve estar no workspace.

---

## Critérios obrigatórios (Definition of Done)

- `workspaces.json` no épico correto.
- Todo `linkedFormId` aponta para formulário existente no mesmo épico.
- Todo formulário referenciado no workspace tem **no mínimo 5** presets.
- `linkedFormExamplePresetIds` (quando usado) contém ids válidos do formulário.
- JSON parseando sem erro.

---

## Onde gravar

- Arquivo: `Espec/data/subprojects/<subproject>/epics/<epic>/workspaces.json`
- Formato: **array** de `WorkspaceDef`
- Cada item representa 1 workspace reutilizável do épico

---

## Workflow recomendado

### 1) Descobrir contexto

- Qual épico/subprojeto receberá o workspace?
- Qual é o **papel-alvo** (ex.: fiscal de contrato, gestor de RH, analista financeiro)?
- Quais tarefas esse papel precisa concluir dentro da área de trabalho?
- Quais formulários (`forms.json`) já existem no épico?
- Quais classes devem virar objetos navegáveis no Explorer?

### 2) Definir estrutura por domínio

- Listar pacotes (macrodomínios)
- Listar classes por pacote
- Definir quais classes terão `linkedFormId`

### 3) Definir aparência

- `explorerChromeColor`
- `explorerHeaderForeground`
- `explorerUserInitials` (opcional)

### 4) Configurar listagem de objetos

- Para cada classe com `linkedFormId`:
  - validar que o formulário referenciado possui **pelo menos 5** `exampleValuePresets`;
  - se tiver menos de 5, criar presets adicionais no `forms.json` do épico;
  - usar todos os presets (`linkedFormExamplePresetIds` omitido), ou
  - filtrar presets específicos (`linkedFormExamplePresetIds`).

### 5) Validar consistência

- `linkedFormId` existe no `forms.json` do mesmo épico
- todo formulário referenciado por classe no workspace tem **>= 5** presets
- cada `linkedFormExamplePresetIds[i]` existe no formulário referenciado
- JSON válido

---

## Modelo completo (catálogo)

### `WorkspaceDef` (raiz)

- `id: string` — obrigatório, único no épico
- `name: string` — obrigatório, nome exibido na lista e no Explorer
- `packages?: WorkspacePackage[]` — estrutura da árvore (pacotes e classes)
- `explorerChromeColor?: string` — cor do chrome (hex `#RGB` ou `#RRGGBB`)
- `explorerHeaderForeground?: '#ffffff' | '#000000'` — cor do texto/ícones do header
- `explorerUserInitials?: string` — iniciais do avatar (até 4 chars; maiúsculas)
- `explorerIconColor?: string` — **legado** (evitar em novos dados)
- `explorerHeaderText?: 'dark'` — **legado** (evitar em novos dados)

### `WorkspacePackage` (agrupador de classes)

- `id: string` — obrigatório, único dentro do workspace
- `name: string` — obrigatório
- `classes?: WorkspacePackageClass[]` — classes do pacote

### `WorkspacePackageClass` (objeto do domínio)

- `id: string` — obrigatório, único dentro do pacote
- `name: string` — obrigatório
- `linkedFormId?: string` — `FormDef.id` do mesmo épico
- `linkedFormExamplePresetIds?: string[]` — ids de presets do formulário vinculado

### Semântica rápida dos campos críticos

- `packages`: navegação por domínio (macroáreas).
- `linkedFormId`: habilita listagem de objetos e detalhe do formulário.
- `linkedFormExamplePresetIds`:
  - `undefined` => usa todos os presets;
  - usar só quando quiser filtrar cenários.
- `explorerChromeColor`: inválido cai no default `#7a8510`.
- `explorerHeaderForeground`: apenas branco/preto.
- `explorerUserInitials`: opcional; se vazio, deriva de `name`.

---

## Campos legados (compatibilidade)

Só manter quando estiver editando JSON antigo; em novos workspaces, não usar:

- `explorerIconColor`
- `explorerHeaderText`

Prioridade de leitura da cor do header no app:
1. `explorerHeaderForeground`
2. `explorerHeaderText === 'dark'` => preto
3. `explorerIconColor` preto => preto
4. fallback => branco

---

## Regras práticas de modelação

1. Criar sempre `id` estável (UUID ou padrão local consistente).
2. Não repetir ids de pacote/classe no mesmo nível.
3. Modelar por papel operacional (e não por estrutura técnica).
4. Garantir cobertura da jornada sem exigir troca de workspace para tarefas comuns.
5. Evitar excesso: remover classes fora da rotina do papel.
6. Ao usar `linkedFormId`, aplicar regra mínima de 5 presets.
7. Se array ficar vazio, preferir omitir (`undefined`) em vez de `[]`.
8. Evitar campos legados em dados novos.
9. Usar nomes de domínio (evitar nomes genéricos como "Pacote 1").

---

## Template mínimo

```json
[
  {
    "id": "workspace-id",
    "name": "Nome do workspace",
    "explorerChromeColor": "#7a8510",
    "explorerHeaderForeground": "#ffffff",
    "explorerUserInitials": "WS",
    "packages": [
      {
        "id": "pkg-1",
        "name": "Pacote",
        "classes": [
          {
            "id": "cls-1",
            "name": "Classe",
            "linkedFormId": "form-id"
          }
        ]
      }
    ]
  }
]
```

---

## Exemplo completo (com filtro de presets)

```json
[
  {
    "id": "ws-formalizacao-contratual",
    "name": "Formalização contratual",
    "explorerChromeColor": "#1f4f8f",
    "explorerHeaderForeground": "#ffffff",
    "explorerUserInitials": "FC",
    "packages": [
      {
        "id": "pkg-contratos",
        "name": "Contratos",
        "classes": [
          {
            "id": "cls-contrato-admin",
            "name": "Contrato administrativo",
            "linkedFormId": "form-contrato-lei14133",
            "linkedFormExamplePresetIds": [
              "evp-con-pregao",
              "evp-con-obra"
            ]
          }
        ]
      },
      {
        "id": "pkg-execucao",
        "name": "Execução e fiscalização",
        "classes": [
          {
            "id": "cls-ator-exec",
            "name": "Atores da execução",
            "linkedFormId": "form-contrato-ator-execucao"
          },
          {
            "id": "cls-item-contrato",
            "name": "Itens do contrato",
            "linkedFormId": "form-contrato-item-lei14133"
          }
        ]
      }
    ]
  }
]
```

---

## Checklist de entrega

- [ ] `workspaces.json` no épico correto
- [ ] ids únicos (`workspace`, `package`, `class`)
- [ ] `linkedFormId` válidos no mesmo épico
- [ ] cada formulário referenciado no workspace possui **no mínimo 5** `exampleValuePresets`
- [ ] presets válidos em `linkedFormExamplePresetIds` (quando usados)
- [ ] sem campos legados em novo JSON
- [ ] JSON parseando sem erro

---

## Referências de código

- Tipos: `Espec/src/types.ts`
- Configuração UI: `Espec/src/components/workspace/WorkspaceConfigPanel.tsx`
- Render Explorer: `Espec/src/components/workspace/WorkspaceExplorer.tsx`
- Tema e defaults: `Espec/src/utils/workspaceExplorerTheme.ts`
