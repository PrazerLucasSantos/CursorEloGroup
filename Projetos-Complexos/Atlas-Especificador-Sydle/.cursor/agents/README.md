# Agentes customizados — Atlas

Invocar no chat Agent com `/nome` (ex.: `/checkpoint`).

| Arquivo | Quando usar |
|---------|-------------|
| `preparador-briefing` | Antes da reunião |
| `ingestor-fontes` | Novas fontes (PDF/DOCX/áudio/Notion) |
| `gerador-perguntas` | Pré-call ou durante validação |
| `checkpoint` | Ao encerrar a reunião |
| `normalizador-documentador` | Gerar texto para PPTX (Documentador) |
| `backlog-builder` | Após checkpoint / doc oficial |
| `roadmap` | Planejamento por fases |
| `checkpoint-dev` | Antes de abrir PBI no ADO |
| `revisor-alinhamento` | Doc × protótipo × reunião |
| `ado-sync` | Lote aprovado → Azure DevOps |

## Reunião ao vivo (já existe como Skills)
Não são arquivos desta pasta — use `/granola-reuniao`:
- Anotador · Conferente · Redator · Consultor  
Skills: `C:\Users\LucasSantos\.cursor\skills\granola-*`

## Pasta global (opcional)
`C:\Users\LucasSantos\.cursor\agents\` — agentes para todos os projetos.
