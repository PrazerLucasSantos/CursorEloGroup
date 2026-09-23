# Conhecimento consolidado — Selo “Não é Não – Mulheres Seguras”

Atualizado em **21/09/2026**. Síntese operacional do que está decidido, modelado e pendente.

---

## 1. O que é o serviço

Serviço digital do **PROCON-MT** para **um único fluxo**: solicitação / concessão / renovação / cancelamento a pedido / revogação administrativa do selo **“Não é Não – Mulheres Seguras”**.

- **Curso ≠ Selo.** Certificado do curso = pessoa (Escola de Governo, fora do sistema). Selo = estabelecimento, nasce no **deferimento** (ou recurso provido).
- **MVP:** ~30 dias após OS, sujeito a integrações (JUCEMAT / Lucematch).

---

## 2. Decisões fechadas (não reabrir sem nova ata)

| Tema | Decisão | Fonte |
|------|---------|--------|
| Escopo | **1 serviço** só (solicitação do selo) | 10/09 |
| Fora do sistema | Denúncia, fiscalização e apuração (canais atuais + Sigadoc) | 10/09 |
| Revogação | Só backoffice: status REVOGADO + anexo do processo; **sem** notificar de novo | 10/09 |
| Validade do selo | **24 meses** (FigJam dizia 12; prevalece minuta/PDF/ata) | 03/09 + PDF |
| Status cancelamento | **CANCELADO A PEDIDO** (não só “CANCELADO”) | FigJam alinhado |
| Cartaz detalhado (190/180/A3/acionar) | Checklist do **analista**, não Sim/Não na solicitação | 18/09 |
| Sinal Vermelho detalhado | Checklist do analista (a partir das fotos) | 18/09 |
| Capacitados | Upload **individual** (certificado + vínculo); sem upload geral único | 18/09 |
| Mínimo capacitados | Até 300 func. → mín. **2**; acima → **10%** | 18/09 |
| Câmeras | Sim/Não; campos condicionais se Sim; **sem** upload | 18/09 |
| Procon Digital | Integração **descartada** por ora | 10/09 |
| Certificado emitido | QR via **Validador MT** | 03/09 |

---

## 3. Integrações

| Sistema | Uso | Status |
|---------|-----|--------|
| MT Login | Autenticação do responsável | Previsto |
| JUCEMAT / Lucematch (Gencematch) | Lista de estabelecimentos do CPF/CNPJ | Crítico; alinhamento técnico |
| Validador MT | QR do certificado | Padrão estadual |
| Receita (CPF×CNPJ) | Estabelecimentos do responsável | Documentado; **mock** no portal (não implementar agora) |
| Sigadoc | Apuração de revogação | Sem integração técnica; só anexo no backoffice |
| Escola de Governo | Curso/certificado pessoa | Fora do sistema |

---

## 4. Status do pedido (visão resumida)

RASCUNHO → PROTOCOLADO → AGUARDANDO ATENDIMENTO → EM ANÁLISE → (EM DILIGÊNCIA ↔ DILIGÊNCIA RESPONDIDA / NÃO RESPONDIDA) → PRONTO PARA DECISÃO → DEFERIDO / INDEFERIDO → (EM RECURSO) → pós: renovação / CANCELADO A PEDIDO / REVOGADO.

Diligência: **única**, prazo **5 dias** (Lei 7.692/2002 citada nas fontes).

---

## 5. Classes modeladas (épico)

| ID | Nome | Papel |
|----|------|-------|
| `form-nen-acesso` | Acesso | MT Login + JUCEMAT |
| `form-nen-solicitacao` | Solicitação | 7 abas do pedido |
| `form-nen-capacitado` | Capacitado | Embutido na aba Equipe |
| `form-nen-analise-decisao` | Análise e Decisão | Backoffice PROCON |
| `form-nen-atender` | Atender | Modal por status |
| `form-nen-ajustes` | Ajustes | Diligência (solicitante) |
| `form-nen-recurso` | Recurso | Após indeferimento |
| `form-nen-renovacao` | Renovação | Pós-selo |
| `form-nen-cancelamento` | Cancelamento | A pedido |
| `form-nen-revogacao` | Revogação | Só backoffice |
| `form-nen-estabelecimento-selo` | Lista / selo | Público / consulta |
| `form-nen-analytics` | Analytics | Relatórios |

Detalhe de abas/campos: [modelagem/](./modelagem/).

---

## 6. Formulário de solicitação — 7 abas

1. **Dados do estabelecimento** — responsável, CPF, estabelecimento, CNPJ/razão/fantasia/CNAE/endereço, foto fachada  
2. **Enquadramento** — boate, show, álcool, esporte  
3. **Equipe e capacitação** — qtd funcionários, qtd capacitados, %, lista de capacitados  
4. **Sinalização** — banheiro feminino + local visível (cada um com foto)  
5. **Procedimentos** — 11 perguntas Sim/Não do protocolo  
6. **Câmeras** — tem câmeras? (+ condicionais 30 dias / acesso)  
7. **Declarações** — implementação, veracidade, sanção 12 meses, conferência de envio  

---

## 7. Backoffice do analista

- Ambiente **não é HTML separado**: vive no Atlas (WorkspaceExplorer + FormCanvas).  
- Método **Atender** abre modal conforme status (Análise, Diligência, Decisão, Recurso…).  
- Abas da análise: Processo, Análise, Pedido, Checklist, Cartaz e Sinal Vermelho, Apoio, Diligência, Decisão, Resultado, Recurso.  
- Código: `src/utils/nenAnaliseDecisaoMethods.ts`.

---

## 8. Base legal citada

- Protocolo “Não é Não” / minuta de decreto do selo  
- Lei Estadual **7.692/2002** — diligência 5 dias / recurso  
- Lei Estadual **12.478/2024** — suporte à vítima (art. 2º)  
- Lei Estadual **11.889/2022** — Código Sinal Vermelho  

---

## 9. Pendências conhecidas

- Regra de quem pode solicitar (sócio / procuração / filial) — alinhar com JUCEMAT/Justemate  
- Nomenclatura de **vínculo** para freelancers/prestadores (Monalisa)  
- Textos finais das declarações (André)  
- Arte/modelo do selo (SECOM)  
- Percentuais/elegibilidade no decreto publicado (confirmar)  
- Integração Receita real (hoje mock)

---

## 10. Como regenerar artefatos

```bash
node scripts/build-nen-presentation-flows.mjs
node scripts/build-nen-requisitos-presentation.mjs
node scripts/align-nnseplag-figjam.mjs
node scripts/patch-nnseplag-analise-processo.mjs
```

Índice completo: [00-INDICE.md](./00-INDICE.md).
