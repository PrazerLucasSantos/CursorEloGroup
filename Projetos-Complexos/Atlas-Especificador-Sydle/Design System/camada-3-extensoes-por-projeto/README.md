# Camada 3 — Extensões por Projeto

**Status:** Ativo (herança pura para projetos sem customização)

Esta pasta contém apenas o que diverge ou complementa as Camadas 1 e 2 por projeto específico. Se um projeto não tem arquivo aqui, herda 100% do global.

## Convenção

- Um arquivo por projeto: `{slug-do-projeto}.md`
- Só declarar o que muda — não repetir o que já está nas camadas superiores
- Incluir justificativa para cada divergência

## Projetos atuais

| Projeto | Arquivo | Status |
|---------|---------|--------|
| SEFAZ-MT (Big Data / Autorregularização) | — | Herda tudo do global (sem extensão) |

## Exemplo de conteúdo

```markdown
# Extensão — SEFAZ-CE

## Paleta secundária do cliente
| Token | Hex | Uso |
|-------|-----|-----|
| `client-primary` | #XX | Cor institucional SEFAZ-CE |

## Componentes específicos
- Card de notificação fiscal: usa ícone de documento + cor semântica `warning`
```
