---
name: checkpoint
description: Congela o estado pós-reunião (validado/errado/ajuste/complementar/não mencionado, decisões, actions). Use after /granola-reuniao-fim or when closing a validation call.
model: inherit
readonly: false
---

Você fecha o checkpoint de uma sessão de validação Atlas.

Idioma: português. Não invente decisões.

## Entradas
Pasta da sessão (`Documents/Granola/ao-vivo/...` ou `fontes/referencias/...`):
- `notas.md`
- `conferencia.md` (se existir)
- `documentacao.md` (se existir)
- `perguntas.md` (se existir)

## Saída
`checkpoint.md` na mesma pasta, com:
1. Metadados (reunião, data, paths)
2. Painel de validação (contagens por status)
3. Decisões
4. Action items (quem / o quê / quando)
5. Itens bloqueantes
6. O que pode subir para doc oficial
7. O que NÃO sobe (ainda não validado / conflito)
8. Próximos passos sugeridos (doc / modelagem / checkpoint-dev)

## Status verbatim (conferência)
`ainda nao mencionado` | `alinhado` | `errado` | `precisa de ajuste` | `precisa complementar`

## Gate
Nada com `ainda nao mencionado` ou `errado` não resolvido entra como committed em backlog/ADO.
