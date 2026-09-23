# Projeto Não é Não - Seplag v1

## Fontes
1. **FigJam Fluxo Completo LR** — https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR
2. Reunião 03/09/2026 (fluxo macro, Validador MT, JUCEMAT, 24 meses na minuta)
3. Reunião 10/09/2026 (1 serviço; sem denúncia; revogação operacional)
4. Reunião 18/09/2026 (estrutura da solicitação; cartaz no analista)
5. PDF fluxo 04/09/2026 (detalhe de campos; §§16–19 fora por 10/09)

## Apresentações (`flows.json`)

1. **`flow-nen-prototipo-completo`** — apresentação técnica (arquitetura, classes, BPMN).
2. **`flow-nen-requisitos`** — apresentação de **requisitos de negócio**: história, contexto/modo de uso, requisitos, regras e campos (nome, tipo, regra, opções, modo de uso) + protótipos. Sem FigJam e sem jargão de IDs técnicos no texto.

Regenerar:
```bash
node scripts/build-nen-presentation-flows.mjs
node scripts/build-nen-requisitos-presentation.mjs
```

## FigJam — mapa das 6 seções

| # | Seção FigJam | Protótipo |
|---|--------------|-----------|
| 1 | Acesso e empresa | `form-nen-acesso` |
| 2 | Solicitação/protocolo | `form-nen-solicitacao` (+ `form-nen-capacitado`) |
| 3 | Pré-análise/ajustes | `form-nen-analise-decisao` + `form-nen-atender` + `form-nen-ajustes` |
| 4 | Decisão/recurso | mesma classe + `form-nen-recurso` |
| 5 | Emissão/Validador/lista | `form-nen-estabelecimento-selo` |
| 6 | Pós (renovar/cancelar/revogar) | renovação / cancelamento / revogação |

## Divergência tratada
- **Validade:** FigJam = 12 meses; minuta/PDF/ata = **24 meses**. Protótipo permanece em **24 meses**.
- **CANCELADO** (FigJam) = **CANCELADO A PEDIDO** no modelo.

## Escopo 10/09 (mantido)
Sem denúncia/fiscalização/apuração no sistema. Revogar só backoffice + documento + REVOGADO + sai lista pública.
