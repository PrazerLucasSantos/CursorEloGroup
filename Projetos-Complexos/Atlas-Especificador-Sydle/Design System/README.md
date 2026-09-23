# Design System — Carteira de Projetos EloGroup

**Última atualização:** 2026-03-25

---

## Arquitetura em 3 Camadas

O Design System da carteira é organizado em três camadas hierárquicas com herança: cada camada inferior herda tudo das camadas acima e só precisa declarar o que diverge ou complementa.

### Camada 1 — Fundação (Global da Carteira)

**Pasta:** `camada-1-fundacao/`

Identidade base compartilhada por todos os materiais e projetos:

- Paleta de cores com tokens nomeados (primárias, secundárias, neutras, semânticas)
- Tipografia (famílias, pesos, escala tipográfica)
- Uso de logo e marca EloGroup
- Princípios gerais de visual (tom, estilo fotográfico, iconografia)

Vale para tudo — de um slide a uma tela de app.

### Camada 2 — Materialização por Tipo de Artefato (Global)

**Pasta:** `camada-2-materializacao/`

Divide-se em duas seções:

**Materiais de Negócio** (`materiais-de-negocio/`)
- Regras de slide (layouts padrão, margens, hierarquia de texto)
- Regras de documento (estilos de heading, formatação de tabela, cabeçalho/rodapé)
- Regras de artefatos de entrega

**Aplicações** (`aplicacoes/`)
- Tokens de UI (spacing scale, border-radius, shadows)
- Estados de componentes (hover, active, disabled, error)
- Regras de responsividade e acessibilidade

### Camada 3 — Extensões por Projeto

**Pasta:** `camada-3-extensoes-por-projeto/`

Contém apenas o que diverge ou complementa as camadas acima, organizado por projeto. Exemplos:

- SEFAZ-CE pode ter uma paleta secundária do cliente ou componentes específicos do domínio fiscal
- Se o projeto não tem nada específico (como SEFAZ-MT hoje), simplesmente não tem arquivo — herda tudo do global

**Convenção de nomes:** `{slug-do-projeto}.md` (ex: `sefaz-ce.md`, `sefaz-mt.md`)

---

## Princípio de Herança

```
Camada 3 (projeto)  →  só o que diverge/complementa
       ↑ herda de
Camada 2 (artefato) →  regras por tipo de material
       ↑ herda de
Camada 1 (fundação) →  identidade visual base
```

Se um projeto não declara algo, vale o que está na Camada 2. Se a Camada 2 não declara, vale o que está na Camada 1.

---

## Integração com o Cursor (kit do repositório)

Para o **Agent** alinhar HTML, slides e materiais de negócio a este sistema: **`AGENTS.md`** (secção *Design System*) e **`.cursor/rules/design-system-elogroup.mdc`**. No chat: `@Design System/README.md` e `@Design System/camada-1-fundacao/fundacao-visual.md`.

**Norma:** fluxo de entregáveis e pastas — **`AGENTS.md`** (§ Princípio operacional).
