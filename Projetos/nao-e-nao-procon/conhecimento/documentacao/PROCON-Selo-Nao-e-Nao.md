# PROCON — Selo "Não é Não – Mulheres Seguras"

Atualizado: 2026-09-10  
Fontes: reunião 03/09 (fluxo/selo), reunião 10/09 (alinhamento de serviços), PDF de fluxo, detalhamento de delivery

## Separação de projetos
Este projeto **NÃO** é o Participação Social MT / Consulta Pública (SEPLAG).

**Corte nesta conversa Cursor:** começa na mensagem de 10/09 ~10:53 (*analise os documentos…* + PDF do fluxo + reunião 03/09 do selo). Tudo **antes** disso = SEPLAG. Ver `Documents\Elogroup - Teams\SEPARACAO-PROJETOS.md`.

## Decisões fechadas (10/09)
- **1 serviço apenas**: Solicitação de Selo
- **Não desenvolver** denúncia/fiscalização/apuração no sistema
- Apuração fora: canais atuais + **Sigadoc** (procedimento interno do órgão)
- No sistema: **revogar** selo já concedido = anexar decisão/cópia do processo + status REVOGADO + sair da lista pública
- **Notificação de revogação no sistema NÃO é necessária** (empresa já foi cientificada no Sigadoc)
- **Sem integração Sigadoc** neste momento
- **Sem integração Procon Digital** neste momento
- Integrações do delivery: **JUCEMAT** + **Validador MT** (+ **MT Login** para acesso)
- Lista pública via API: **fase futura**; MVP com analytics/relatório (Excel/PDF) e alimentação manual se preciso
- Próximos passos: Lucas/Fabiano ajustam proposta (1 serviço) → orçamento → MTI sobe no Sigadoc → OS → levantamento de requisitos na semana seguinte; alinhar JUCEMAT com Grisvaldo

## Escopo do sistema (entra)
1. Solicitação do selo (formulário + anexos + protocolo)
2. JUCEMAT — verificação e listagem de empresas
3. MT Login — autenticação do solicitante
4. Análise PROCON (conforme / não conforme / diligência 5 dias)
5. Decisão (deferir/indeferir) + recurso
6. Emissão: número, certificado/template, QR no Validador MT
7. Classe/lista Estabelecimentos com Selo (vigente 24 meses)
8. Renovação (pré-preenchido + aviso de vencimento)
9. Cancelamento a pedido
10. Revogação administrativa (documento + status REVOGADO)
11. Notificações: servidor, solicitante (resultado), próximo ao vencimento
12. Analytics: processo de solicitação + classe de empresas com selo

## Não entra
- Módulo de denúncia
- Módulo de fiscalização/apuração
- Integração Sigadoc
- Integração Procon Digital
- Curso (Escola de Governo) — só upload do certificado
- API pública da lista (fase 2)
- Arte SECOM do selo (pendente externo; sistema emite documento)

## Fluxo macro
Acesso MT Login → JUCEMAT lista empresas → Formulário Solicitação → Protocolar → Análise PROCON → (Ajustes/diligência 5 dias) → Decisão → Deferido: certificado+QR+lista | Indeferido: recurso → Vigente 24 meses → Renovar / Cancelar / Revogar

## Curso ≠ Selo
- Certificado do **curso** = Escola de Governo (por funcionário)
- **Selo** = certificado do estabelecimento, gerado no deferimento

## Pendências de negócio
- Quem pode solicitar (sócio/administrador/representante/filial) — regra pós-JUCEMAT
- MT Login CNPJ (provável só cidadão/PF)
- Arte do certificado/selo (SECOM / Gabinete da Mulher)
- Percentuais mínimos de capacitados (confirmar no decreto; PDF: ≥2; eventos >300: 10%)
- Efeito renovação tempestiva se vencer antes da decisão
- Gatilho automático no decreto (condenação consumerista → revogar selo) — só ideia
- Campos finais da lista pública

## Detalhamento delivery (referência)
Formulários: Solicitação; Notificação servidor; Notificação solicitante (resultado); Notificação próximo vencimento; Classe Estabelecimentos com Selo; Análise; Ajustes; Template Certificado; Recurso; Método Cancelamento; Formulário Renovação; **(+ Revogação — crítico)**  
Integrações: JUCEMAT; Validador MT; **(+ MT Login)**  
Relatórios: Analytics classe Empresas com Selo; Analytics processo Solicitação

## Documentacao de requisitos (documentador)
- Arquivo: `Documents\Elogroup - Teams\PROCON — Selo Não é Não\documentacao.md`
- Estrutura: necessidade | como é usado/ contexto | requisitos e regras | campos da tela

## FigJam
- Fluxo completo LR (atual): https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl
- Board horizontal LR: https://www.figma.com/board/WMKpyhM8myQ7SYr6d50qDl
- Board anterior (histórico): https://www.figma.com/board/5ZFphzkFaqHkDtuMKf0qbz

## Pasta do projeto
`Documents\\Elogroup - Teams\\PROCON — Selo Não é Não\\` (fontes em `fontes/`; documentação em `documentacao.md`)
