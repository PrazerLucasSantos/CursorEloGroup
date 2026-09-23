# Selo “Não é Não – Mulheres Seguras” (PROCON-MT)

## Documento mestre de conhecimento do projeto

| Campo | Valor |
|--------|--------|
| **Versão** | 1.0 |
| **Data** | 20/09/2026 |
| **Cliente / área** | PROCON-MT · Protocolo Não é Não · Mulheres Seguras |
| **Natureza** | Documentação completa de negócio, processo, requisitos, protótipo e fluxos |
| **Status** | Consolidado a partir de PDF, atas, FigJam, protótipo Atlas Espec e modelagem BPMN |

Este documento reúne **tudo o que se conhece e está modelado** sobre o serviço digital do selo, de forma detalhada e profissional, para uso de negócio, requisitos, arquitetura e homologação.

---

## 1. Sumário executivo

O Estado de Mato Grosso institui o selo **“Não é Não – Mulheres Seguras”** para reconhecer estabelecimentos que implementam o **Protocolo Não é Não**: capacitação da equipe, sinalização, procedimentos de acolhimento e articulação com a rede de proteção à mulher.

A entrega digital concentra, em **um único serviço**:

1. Autenticação e seleção do estabelecimento  
2. Solicitação com evidências e protocolização  
3. Análise e diligência pelo PROCON  
4. Decisão (deferimento / indeferimento) e recurso  
5. Emissão do certificado eletrônico com QR (Validador MT)  
6. Pós-concessão: renovação, cancelamento a pedido e revogação administrativa  

**Curso ≠ Selo.** O certificado do curso é da **pessoa** (Escola de Governo, fora do sistema). O selo é do **estabelecimento** e só nasce no **deferimento** (ou no recurso provido).

**MVP prioritário:** cerca de 30 dias após abertura da OS, sujeito ao comportamento real das integrações (especialmente JUCEMAT).

---

## 2. Contexto e história do serviço

### 2.1 Problema que o serviço resolve

Hoje o processo depende de tramitação fragmentada (formulários, anexos e decisões dispersos). O serviço digital:

- padroniza o pedido do estabelecimento;  
- dá rastreabilidade à análise do PROCON;  
- emite certificado consultável pelo cidadão;  
- sustenta renovação e encerramento controlados do selo.

### 2.2 Fontes de verdade (ordem de uso)

| # | Fonte | O que fechou |
|---|--------|----------------|
| 1 | **PDF** “Fluxo para solicitação, concessão, renovação e revogação…” (04/09/2026) | Textos literais das perguntas, declarações, diligência 5 dias, validade 24 meses, análise item a item |
| 2 | **Reunião 03/09/2026** | Fluxo macro; Validador MT; JUCEMAT; validade 24 meses na minuta |
| 3 | **Reunião 10/09/2026** | **1 serviço**; **sem** denúncia/fiscalização/apuração na plataforma; revogação operacional (upload + status) |
| 4 | **Reunião 18/09/2026** | Estrutura da solicitação; foto da fachada; conteúdo legal do cartaz conferido **pelo analista** (não como Sim/Não na solicitação) |
| 5 | **FigJam** Fluxo Completo LR | Visão de processo em 6 seções + overlay de papéis de análise |
| 6 | **Protótipo Atlas Espec** (épico Seplag v1) | Telas, abas, campos, métodos, status, Atender por status, portal e workspace |

**FigJam (board):**  
https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR

### 2.3 Base legal e referências normativas (citadas nas fontes)

- Protocolo “Não é Não” / minuta de decreto do selo  
- **Lei Estadual nº 7.692/2002** — prazo de diligência (5 dias) e, subsidiariamente, recurso  
- **Lei Estadual nº 12.478/2024** — suporte/assistência à vítima (art. 2º)  
- **Lei Estadual nº 11.889/2022** — Código Sinal Vermelho  

Redações finais de percentuais mínimos, elegibilidade de solicitante e validade no decreto publicado permanecem **a confirmar** onde indicado neste documento.

---

## 3. Objetivos e escopo

### 3.1 No escopo desta entrega

| Capacidade | Descrição |
|------------|-----------|
| Acesso | MT Login + lista JUCEMAT + seleção da unidade + documento de representação (quando necessário) |
| Solicitação | Dados, enquadramento, equipe/capacitados, sinalização (2 fotos), procedimentos, câmeras condicionais, declarações, revisão e protocolização |
| Análise | Checklist por bloco + cartaz; diligência única; encaminhamento à autoridade |
| Decisão | Deferir (emite selo) ou indeferir (fundamenta + informa recurso) |
| Recurso | Peça do solicitante + julgamento (provido / não provido) |
| Emissão | Certificado eletrônico, QR Validador MT, registro de estabelecimentos com selo, notificações |
| Pós | Aviso de vencimento, renovação, cancelamento a pedido, revogação backoffice |
| Gestão MVP | Indicadores e exportação (analytics / lista de vigentes) |

### 3.2 Fora do escopo (decisão 10/09)

- Módulo de **denúncia**, **fiscalização** ou **apuração** na plataforma  
- Integração **Sigadoc**  
- Integração **Procon Digital**  
- **API** de publicação da lista pública em outros sites (fase futura)  
- Arte visual final do selo (**SECOM** / Gabinete da Mulher) — o sistema emite dados + QR independentemente da arte  

Na apuração externa, o selo permanece VIGENTE até decisão; no sistema do selo só se **opera a revogação** (anexo da decisão + status REVOGADO + saída da lista).

### 3.3 Princípio de produto

**Um serviço** cobre todo o ciclo de vida do selo (solicitação → pós). Não há serviço separado de denúncia nesta entrega.

---

## 4. Atores e canais

| Ator | Canal | Responsabilidades |
|------|--------|-------------------|
| **Solicitante** (estabelecimento autenticado) | Portal do estabelecimento | Solicitar, rascunho, protocolar, responder diligência, recorrer, renovar, cancelar a pedido |
| **Analista PROCON** | Área de trabalho (workspace) | Checklist, cartaz, diligência única, encaminhar para decisão |
| **Autoridade PROCON** | Workspace | Deferir / indeferir; julgar recurso; revogar |
| **Cidadão** | Validador MT (QR) | Consultar autenticidade do certificado |
| **Gestão PROCON** | Relatórios / analytics | Acompanhar fila, decisões e selos vigentes (MVP) |
| **Escola de Governo** | Fora do sistema | Oferece curso e emite certificado do capacitado |
| **Sistema** | Integrações | MT Login, JUCEMAT, geração de protocolo/selo, notificações |

---

## 5. Arquitetura da solução (visão)

```
┌─────────────────────┐     ┌──────────────────────────┐
│ Portal estabelecimento│     │ Workspace PROCON         │
│ · Solicitar selo      │     │ · Análise e Decisão       │
│ · Acompanhar pedidos  │     │ · Atender (modal/status)  │
└──────────┬────────────┘     │ · Selos / Revogação       │
           │                  │ · Analytics              │
           ▼                  └────────────┬─────────────┘
┌─────────────────────┐                    │
│ MT Login · JUCEMAT  │◄───────────────────┘
└──────────┬────────────┘
           ▼
┌─────────────────────┐     ┌──────────────────────────┐
│ Pedido (status)     │────►│ Selo (VIGENTE…)           │
│ + peças Ajustes /   │     │ QR → Validador MT         │
│   Recurso           │     │ Lista/exportação MVP      │
└─────────────────────┘     └──────────────────────────┘
```

### 5.1 Telas / classes do protótipo (inventário)

| Tela | Campos (aprox.) | Métodos | Abas / estrutura |
|------|-----------------|---------|------------------|
| Acesso (MT Login + JUCEMAT) | 8 | Entrar; Continuar | Identificação, Acesso, Estabelecimento |
| Capacitado (embutido) | 7 | — | Registro repetível |
| Formulário de Solicitação | 51 | Rascunho; Revisar; Protocolar | 7 abas |
| Formulário de Ajustes | 4 | Enviar complementação | Peça de diligência |
| Formulário de Recurso | 2 | Apresentar recurso | Peça do solicitante |
| Análise e Decisão | 40 | 12 (Atender, diligência, deferir…) | Processo, Análise (+ subabas), Diligência, Decisão, Resultado, Recurso |
| Atender | 40 | — (aberto pelo método Atender) | Abas filtradas por status |
| Estabelecimentos com Selo | 10 | Filtrar, exportar, baixar, cancelar, revogar, renovar, aviso | Cadastro do certificado |
| Renovação / Cancelamento / Revogação | 3–4 | Ações específicas | Pós-concessão |
| Analytics / relatórios | 13 | Filtrar; Exportar | MVP de gestão |

### 5.2 Padrão de trabalho do PROCON (Sydle / Atlas)

- A classe **Análise e Decisão** concentra o processo.  
- O método **Atender** abre a tela de atendimento com o **pedido embutido** no topo de cada aba.  
- As abas do Atender **respeitam o status** (não exibir tudo de uma vez).  
- **Julgamento de recurso** fica na Análise/Atender; a peça do solicitante traz só razões e anexos.

---

## 6. Máquinas de status

### 6.1 Status do pedido

```
RASCUNHO
  → PROTOCOLADO
  → AGUARDANDO ATENDIMENTO
  → EM ANÁLISE
  → EM DILIGÊNCIA
  → DILIGÊNCIA RESPONDIDA | DILIGÊNCIA NÃO RESPONDIDA
  → (retoma) EM ANÁLISE / PRONTO PARA DECISÃO
  → DEFERIDO | INDEFERIDO
  → EM RECURSO
  → FINALIZADO (quando aplicável)
```

### 6.2 Status do selo

```
VIGENTE → EXPIRADO | CANCELADO A PEDIDO | REVOGADO
```

### 6.3 Regras transversais de prazo e conformidade

| Código | Regra |
|--------|--------|
| RNG.002 | Prazo de análise/decisão: até **30 dias** (minuta); **suspenso** na diligência |
| RNG.003 | Diligência: prazo **5 dias** (Lei 7.692/2002); **única** (todas as pendências de uma vez) |
| RNG.004 | Ausência de resposta **não** gera indeferimento automático |
| RNG.005 | **Não deferir** com item obrigatório “não conforme” |
| RN.002 | Validade do selo = concessão + **24 meses** (FigJam mostra 12 — divergência documentada) |

---

## 7. Fluxo ponta a ponta (negócio + códigos T01–T36)

Os códigos **T01…T36** unificam FigJam (macro + detalhe + BPMN), arquivo `.bpmn` e apresentações Atlas.

### 7.1 Visão FigJam (6 seções macro)

| Seção | Nós | Código |
|-------|-----|--------|
| 1. Acesso e empresa | Início → MT Login → JUCEMAT → Seleciona | T01–T05 (+ T06–T09 no detalhe) |
| 2. Solicitação | Form → Revisa → Protocolar → PROTOCOLADO | T10–T19 |
| 3. Pré-análise | Análise → Conclusão → Ajustes/Notifica/5 dias **ou** Decisão | T22–T24 (+ overlay T20–T21C) |
| 4. Decisão | Deferir? → Certificado **ou** INDEFERIDO → Recurso? → Provido? | T25–T28 |
| 5. Emissão | Validador · Classe Selo · Notificações · VIGENTE | T29–T33 |
| 6. Pós | Aviso → Renovar / Cancelar / Revogar → sai lista | T34–T36 |

**Overlay de papéis (acima da Decisão no board):**  
T20 Primeira análise → T20A tudo certo | T20B ajustar | T20C necessidade de ajuste → T21 análise final → T21A aprovador | T21B reprovar → T21C solicitante entrou com recurso?

### 7.2 Tabela mestre T01–T36

| Código | Tipo BPMN | Atividade | Papel |
|--------|-----------|-----------|--------|
| **T01** | User Task | Acessar portal do estabelecimento | Solicitante |
| **T02** | User Task | Autenticar via MT Login | Solicitante |
| **T03** | Service Task | Listar empresas JUCEMAT | Sistema |
| **T04** | Gateway | Há estabelecimento vinculado? | Sistema |
| **T04A** | End | Bloquear (sem empresa) | Sistema |
| **T05** | User Task | Selecionar estabelecimento | Solicitante |
| **T06** | Gateway | É responsável cadastral? | Sistema |
| **T07** | User Task | Anexar documento de representação | Solicitante |
| **T08** | Service Task | Carregar dados cadastrais | Sistema |
| **T09** | User Task | Iniciar formulário de solicitação | Solicitante |
| **T10** | User Task | Enquadramento (4 perguntas) | Solicitante |
| **T11** | User Task | Equipe e capacitação (+ %) | Solicitante |
| **T12** | User Task | Registrar capacitados | Solicitante |
| **T13** | User Task | Sinalização + 2 fotos | Solicitante |
| **T14** | User Task | Procedimentos (11 declarações) | Solicitante |
| **T15** | User Task | Câmeras (condicionais) | Solicitante |
| **T16** | User Task | Declarações finais + fachada | Solicitante |
| **T17** | User Task | Revisar respostas e anexos | Solicitante |
| **T18** | User Task | Protocolar | Solicitante / Sistema |
| **T19** | Service Task | PROTOCOLADO + notifica PROCON | Sistema |
| **T20** | User Task | Primeira análise (overlay) | Analista |
| **T20A/B/C** | — | tudo certo / ajustar / necessidade de ajuste | Analista |
| **T21** | User Task | Análise final | Analista |
| **T21A/B/C** | — | aprovador / reprovar / recurso? | Autoridade / Sistema |
| **T22** | User Task | Formulário de Análise (checklist + cartaz) | Analista |
| **T23** | Gateway | Conclusão (Não conforme / Pronto) | Analista |
| **T23A** | User Task | Formulário de Ajustes (diligência única) | Analista |
| **T23B** | Service Task | Notificar solicitante | Sistema |
| **T23C** | User Task | Complementar em 5 dias | Solicitante |
| **T24** | User Task | Encaminhar decisão da autoridade | Analista |
| **T25** | Gateway | Deferir? | Autoridade |
| **T25A** | User Task | Registrar INDEFERIDO | Autoridade |
| **T26** | Gateway | Recurso? | Solicitante / Sistema |
| **T26A** | User Task | Formulário de Recurso | Solicitante |
| **T27** | Gateway | Provido? | Autoridade |
| **T27A** | End | Finalizado (sem emissão) | Sistema |
| **T28** | Service Task | Template Certificado + QR | Sistema |
| **T29** | Service Task | Validador MT | Sistema |
| **T30** | Service Task | Registrar Estabelecimentos com Selo | Sistema |
| **T31** | Service Task | Notificar servidor PROCON | Sistema |
| **T32** | Service Task | Notificar solicitante | Sistema |
| **T33** | Service Task | Selo VIGENTE (24 meses no protótipo) | Sistema |
| **T34** | Service Task | Notificação próximo ao vencimento | Sistema |
| **T35** | Gateway | Ação (Renovar / Cancelar / Revogar) | Solicitante / PROCON |
| **T35A** | User Task | Renovação → PROTOCOLADO | Solicitante |
| **T35B** | User Task | Cancelamento a pedido | Solicitante |
| **T35C** | User Task | Revogação backoffice | PROCON |
| **T36** | End | Sai da lista pública | Sistema |

### 7.3 Artefatos de fluxo disponíveis

| Artefato | Onde |
|----------|------|
| FigJam macro (6 seções) + overlay | Board LR |
| FigJam DETALHE A/B/C (perguntas e ramificações) | Mesmo board |
| FigJam **BPMN** (pool T01–T36) | Seção “BPMN — Processo Selo Não é Não” |
| Arquivo **BPMN 2.0** (`.bpmn`) | `exports/selo-nao-e-nao-fluxo.bpmn` · `PROCON — Selo Não é Não/fontes/` |
| Apresentações Atlas | `flow-nen-bpmn`, `flow-nen-fluxograma-detalhado`, `flow-nen-requisitos`, `flow-nen-prototipo-completo` |

---

## 8. Detalhamento por etapa de negócio

### 8.1 Acesso e identificação (T01–T09)

**Necessidade:** autenticar, listar só empresas elegíveis e vincular o pedido à unidade.

**Regras:**

- Somente empresas retornadas pela **JUCEMAT** e vinculadas ao usuário  
- Sem MT Login válido → bloqueio  
- Documento de representação se solicitante ≠ responsável cadastral  
- Quem pode solicitar (sócio / representante / matriz-filial) e MT Login para CNPJ: **a confirmar**

**Dados cadastrais carregados (T08):** CNPJ, razão social, nome fantasia, endereço, município, CNAE; responsável e contato do requerimento.

### 8.2 Solicitação — perguntas e evidências (T10–T19)

#### Aba Dados do estabelecimento

- Protocolo e status (sistema)  
- Responsável, contato, CPF  
- Estabelecimento / CNPJ / razão / fantasia / CNAE / endereço  
- **Fotografia da fachada** (obrigatória — alinhamento 18/09)

#### Aba Enquadramento (T10)

Perguntas Sim/Não:

1. Casa noturna ou boate?  
2. Espetáculo musical / shows / eventos musicais em local fechado?  
3. Venda de bebida alcoólica?  
4. Competição ou evento esportivo?

#### Aba Equipe e capacitação (T11–T12)

- Quantidade de funcionários/equipe  
- Quantidade capacitados  
- **Percentual calculado automaticamente**  
- **Mínimo:** ao menos **2** capacitados; se equipe/público **> 300**, mínimo **10%** (confirmar redação do decreto)  
- Tabela de capacitados: nome, função, tipo de vínculo, curso, data, certificado, comprovante de vínculo (não só CTPS)

#### Aba Sinalização (T13)

Na **solicitação**:

- Informação no banheiro feminino? + foto  
- Informação em local de ampla visualização? + foto  

**Não** entram como Sim/Não na solicitação (vão para o analista): forma de acionar, 190, 180, formato A3/texto oficial, Sinal Vermelho.

#### Aba Procedimentos (T14) — 11 declarações Sim/Não

Incluem, entre outras (textos do PDF): verificação reservada; proteção e afastamento do agressor; testemunhas; acionar PM; preservar vestígios; acompanhamento; autodeterminação da mulher; assistência (Lei 12.478/2024); Sinal Vermelho → 190 (Lei 11.889/2022); reconhecimento do gesto; compromisso com os direitos no Protocolo.

#### Aba Câmeras (T15)

- Existência de câmeras **não** é requisito de concessão  
- Se **Sim**: preservação ≥ 30 dias das imagens do fato; acesso legal (PC, perícia, envolvidos)  
- Recusa dessas obrigações condicionais → não conformidade na análise

#### Aba Declarações (T16) + revisão (T17) + protocolar (T18–T19)

- Declaração de implementação do Protocolo  
- Declaração de veracidade sob as penas da Lei  
- Sanção administrativa definitiva nos 12 meses anteriores?  
- Checkbox de revisão (habilita Protocolar)  
- Ao protocolar: nº, data/hora, comprovante, status **PROTOCOLADO**, notificação ao PROCON  
- Após PROTOCOLADO: sem edição livre — alterações via diligência

### 8.3 Análise, diligência e decisão (T20–T28)

#### Checklist do analista (por bloco)

Para cada bloco: **Conforme / Não conforme / Necessita complementação** (+ texto de complementação quando aplicável):

- Dados e fachada  
- Enquadramento  
- Equipe e capacitação  
- Sinalização (fotos)  
- Procedimentos  
- Câmeras (inclui N/A quando não há câmera)  
- Declarações  

#### Cartaz e Sinal Vermelho (analista)

- Forma de acionar o Protocolo no cartaz  
- Telefone **190**  
- Telefone **180**  
- Formato **A3** e texto oficial  
- **Sinal Vermelho**

#### Atender — abas por status

| Status | Abas no Atender |
|--------|-----------------|
| EM ANÁLISE / fila | Contexto · Checklist · Cartaz · Apoio |
| EM DILIGÊNCIA | Contexto · Diligência |
| Diligência respondida / não respondida | Contexto · Diligência · Checklist · Cartaz · Apoio |
| PRONTO PARA DECISÃO | Contexto · Checklist · Cartaz · Apoio · Decisão |
| EM RECURSO | Contexto · Recurso |

#### Diligência (T23A–T23C)

- Lista **todas** as pendências de uma vez  
- Notifica o estabelecimento  
- Prazo **5 dias**; suspende prazo de análise  
- Respondida → volta à análise  
- Não respondida → segue para decisão **com os autos** (sem indeferimento automático)

#### Decisão (T25–T27A)

- **Deferir:** emite certificado + QR + inclui na classe de selos + VIGENTE + notificações  
- **Indeferir:** parecer, requisitos não atendidos, fundamentos, info de recurso  
- **Recurso provido:** mesmos efeitos do deferimento  
- **Recurso não provido / sem recurso:** FINALIZADO

### 8.4 Emissão e pós-concessão (T28–T36)

**Emissão gera:** número do selo, certificado eletrônico, dados da unidade, QR (Validador MT), data de concessão, validade (concessão + 24 meses), status VIGENTE, inclusão em lista/relatório MVP, notificações.

**Pós:**

- Aviso próximo ao vencimento  
- **Renovar:** formulário pré-preenchido → PROTOCOLADO → mesmo ciclo  
- **Cancelar a pedido:** CANCELADO A PEDIDO → sai da lista; QR não vigente  
- **Revogar (só backoffice):** anexo da decisão → REVOGADO → sai da lista; sem notificação automática neste sistema (ciência no procedimento externo)

**Efeito da renovação tempestiva se o selo vencer antes da decisão:** pendência normativa.

---

## 9. Integrações

| Sistema | Função | Dependência |
|---------|--------|-------------|
| **MT Login** | Autenticação do solicitante | Bloqueia portal sem sessão |
| **JUCEMAT** | Lista e dados do estabelecimento | Homologar comportamento real (crítico no MVP) |
| **Validador MT** | Autenticidade via QR | Deve refletir VIGENTE vs EXPIRADO / CANCELADO / REVOGADO |
| Escola de Governo | Certificado do capacitado | Fora do sistema — só upload |
| Sigadoc / denúncia | Apuração | Fora — só resultado na revogação |

---

## 10. Identidade visual no processo (protótipo)

Na Análise e Decisão:

- **Nome do estabelecimento** = identidade (tag principal)  
- **Status** e **prazo restante** = destaques coloridos  

Evitar excesso de highlights; manter o essencial para fila e atendimento.

---

## 11. Protótipo e ambiente

| Item | Valor |
|------|--------|
| Épico Atlas | Projeto Não é Não — Seplag v1 |
| UI típica | localhost (Atlas Espec / espec-sydle-run) · caminho Não é Não / Seplag |
| Portal | Solicitar selo · Acompanhar solicitações |
| Workspace | PROCON — pacotes Solicitação, Análise e decisão, Selo e pós |

### 11.1 Apresentações no especificador

1. **Requisitos** — história, contexto, RQ/RN, campos (nome, tipo, regra, opções, modo de uso) + protótipos  
2. **Protótipo completo** — arquitetura e inventário técnico  
3. **Fluxograma detalhado** — espelho FigJam T01–T36  
4. **BPMN** — atividades BPMN navegáveis  

### 11.2 Scripts de regeneração (referência)

```bash
node scripts/build-nen-presentation-flows.mjs
node scripts/build-nen-requisitos-presentation.mjs
node scripts/build-nen-fluxograma-detalhado.mjs
node scripts/build-nen-bpmn-flow.mjs
```

---

## 12. Divergências documentadas

| Tema | FigJam / board | PDF / ata / minuta | Decisão no protótipo |
|------|----------------|--------------------|----------------------|
| Validade do selo | 12 meses | **24 meses** | **24 meses** até o decreto fechar |
| Cancelamento | “CANCELADO” | CANCELADO A PEDIDO | **CANCELADO A PEDIDO** |
| Denúncia no sistema | (não no MVP) | §§16–19 no PDF | **Fora** (10/09) |
| Cartaz legal na solicitação | — | Perguntas no PDF | Conferência no **analista** (18/09) |

---

## 13. Pendências de negócio (abrir antes do build final)

1. Quem pode solicitar (sócio-administrador, representante, matriz vs filial) e MT Login para CNPJ  
2. Redação final do percentual mínimo de capacitados (2; 10% se > 300 / público estimado)  
3. Prazo e cabimento do recurso no decreto  
4. Validade no decreto publicado (12 vs 24)  
5. Efeito da renovação tempestiva com selo vencido antes da decisão  
6. Perfil autorizado a revogar  
7. Política de SLA/escalonamento da fila PROCON  
8. Arte do certificado (SECOM) — sistema independente da arte final  
9. Comportamento real da **JUCEMAT** em homologação  

---

## 14. Glossário

| Termo | Significado |
|-------|-------------|
| Protocolo Não é Não | Conjunto de obrigações do estabelecimento para prevenção e acolhimento |
| Selo | Certificação do **estabelecimento** (“Local Seguro para Mulheres”) |
| Capacitado | Pessoa da equipe com curso e vínculo comprovados |
| Diligência única | Uma rodada com todas as pendências listadas de uma vez |
| Atender | Tela de trabalho do PROCON aberta a partir do processo, filtrada por status |
| Validador MT | Mecanismo oficial de consulta de autenticidade via QR |
| Revogação | Ato administrativo PROCON; distinto do cancelamento voluntário |

---

## 15. Mapa de artefatos do repositório

| Caminho | Conteúdo |
|---------|----------|
| `Projetos-Complexos/PROCON — Selo Não é Não/` | Pasta de fronteira do projeto |
| `fontes/_fluxo_selo_extract.txt` | Texto extraído do PDF |
| `fontes/requisitos-procon-nao-e-nao.md` | Prompt/estrutura documentador |
| `fontes/selo-nao-e-nao-fluxo.bpmn` | BPMN 2.0 |
| `DOCUMENTACAO-COMPLETA-PROJETO.md` | **Este documento** |
| `espec-sydle-run/.../projeto-nao-e-nao-seplag-v1/` | forms, flows, workspaces, portals, context |
| `espec-sydle-run/exports/selo-nao-e-nao-fluxo.bpmn` | Cópia do BPMN |
| `espec-sydle-run/exports/requisitos-procon-nao-e-nao.md` | Export de requisitos por classe |

---

## 16. Conclusão e próximos passos recomendados

O projeto está **especificado de ponta a ponta**: negócio (PDF + atas), processo (FigJam + BPMN T01–T36), requisitos (RQ/RN + campos) e protótipo navegável (portal, workspace, Atender por status).

**Próximos passos sugeridos:**

1. Homologar o protótipo com PROCON (especialmente Atender por status e checklist/cartaz)  
2. Fechar pendências da seção 13 em workshop curto  
3. Validar JUCEMAT e Validador MT em ambiente real  
4. Congelar validade e percentuais na redação final do decreto  
5. Usar o `.bpmn` / FigJam BPMN como contrato de processo para desenvolvimento  

---

*Documento gerado a partir do estado consolidado do conhecimento do projeto em 20/09/2026. Em caso de conflito entre fontes, prevalecem: (1) decisões de ata 10/09 e 18/09 para escopo; (2) PDF para textos de campos; (3) minuta/PDF para validade 24 meses até o decreto publicado; (4) protótipo Atlas como especificação operacional das telas.*
