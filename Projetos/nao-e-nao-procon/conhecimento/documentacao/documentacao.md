# Documentacao de requisitos (reescrita na reuniao)
- Origem (PPTX): FLUXO PARA SOLICITAÇÃO, CONCESSÃO, RENOVAÇÃO E REVOGAÇÃO DO SELO “NÃO É NÃO – MULHERES SEGURAS” (PDF 04/09/2026)
- Reuniao: Protocolo de segurança para mulheres — fluxo do sistema e selo (03/09/2026); Reunião Não é Não — Alinhamento de Serviços (10/09/2026)
- Ultima atualizacao: 11/09/2026
- Legenda de status: validado | ainda nao validado na reuniao | ajustado na reuniao | corrigido (origem errada) | complementar
- FigJam (fluxo LR): https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl

Escopo do documento: **um serviço** — Solicitação / Concessão / Renovação / Cancelamento / Revogação administrativa do Selo “Não é Não – Mulheres Seguras”.  
**Fora do escopo de desenvolvimento:** módulo de denúncia, fiscalização e apuração no sistema (tramitam no Sigadoc / canais atuais do PROCON).

---

## necessidade

### Solicitação e concessão do selo
status da secao: validado

Permitir que estabelecimentos solicitem digitalmente o selo “Não é Não – Mulheres Seguras”, comprovando o cumprimento do Protocolo Não é Não, para análise e decisão do PROCON-MT.

### Capacitação da equipe (evidência)
status da secao: validado

Garantir que o estabelecimento comprove capacitação de integrantes da equipe no curso do Protocolo (ofertado pela Escola de Governo), anexando certificados e comprovação de vínculo com o estabelecimento. O curso é externo ao sistema; o sistema apenas recebe as evidências.

### Análise e diligência pelo PROCON
status da secao: validado

Permitir ao PROCON analisar respostas e documentos (conforme / não conforme / necessita complementação), solicitar diligência única de complementação e decidir pela concessão ou indeferimento do selo.

### Emissão e autenticidade do selo
status da secao: validado

Emitir automaticamente, no deferimento, o certificado/selo eletrônico do estabelecimento com número, dados da unidade, validade e QR Code integrado ao Validador de Documentos do Estado (Validador MT).

### Lista / classe de estabelecimentos com selo
status da secao: validado

Manter registro dos estabelecimentos com selo vigente (“Local Seguro para Mulheres”), atualizado nos eventos de deferimento, expiração, cancelamento e revogação. Publicação via API em outros sites fica para fase futura; no MVP, analytics/relatório viabiliza consulta/exportação.

### Renovação
status da secao: validado

Permitir renovação do selo (validade 24 meses) com formulário pré-preenchido, notificação prévia de vencimento e mesmo fluxo de análise, no que couber.

### Cancelamento a pedido
status da secao: validado

Permitir que o estabelecimento solicite voluntariamente o cancelamento do selo, com retirada da lista pública.

### Revogação administrativa
status da secao: ajustado na reuniao

Permitir que o PROCON, a qualquer momento, marque um selo concedido como REVOGADO, anexando a decisão ou cópia do procedimento interno (ex.: Sigadoc). A apuração da irregularidade **não** ocorre neste sistema. Não é necessária notificação de revogação pelo sistema (empresa já foi cientificada no procedimento externo).

### Integrações de acesso e empresa
status da secao: validado

Autenticar o solicitante via MT Login e, via JUCEMAT, verificar e listar empresas vinculadas para seleção da unidade do requerimento.

### Painéis e indicadores
status da secao: complementar

Disponibilizar analytics do processo de solicitação e da classe de estabelecimentos com selo (vigentes, a vencer, cancelados, revogados etc.), com exportação.

---

## como é usado/ contexto

### Atores
status da secao: validado

| Ator | Papel |
|------|--------|
| Solicitante (estabelecimento) | Acessa, seleciona empresa, preenche solicitação/renovação, responde diligência, apresenta recurso, cancela a pedido |
| Analista PROCON | Analisa requisitos, abre diligência, encaminha para decisão |
| Autoridade PROCON | Defere / indefere; julga recurso; registra revogação |
| Cidadão / público | Consulta autenticidade via QR (Validador MT) e lista de vigentes (via relatório/lista) |
| Escola de Governo | Fora do sistema — oferta o curso e emite certificado do funcionário |

### Curso ≠ Selo
status da secao: validado

- **Certificado do curso:** individual, Escola de Governo.  
- **Selo:** do estabelecimento, emitido pelo sistema no deferimento.

### Jornada principal (solicitação)
status da secao: validado

1. Solicitante autentica (MT Login).  
2. Sistema lista empresas via JUCEMAT; solicitante seleciona o estabelecimento.  
3. Preenche formulário (enquadramento, equipe, capacitados, sinalização, código, procedimentos, câmeras, declarações) e anexa evidências.  
4. Revisa e protocola → status PROTOCOLADO.  
5. Analista PROCON analisa item a item.  
6. Se necessário: diligência (5 dias) → estabelecimento complementa.  
7. Autoridade decide: deferido (emite selo + QR + inclui na classe/lista + notificações) ou indeferido (fundamentação + recurso).  
8. Selo vigente por 24 meses; aviso próximo ao vencimento.  
9. Pós-concessão: renovar, cancelar a pedido ou revogar (PROCON sobe documento e marca REVOGADO).

### Contexto de denúncia / fiscalização (fora do sistema)
status da secao: ajustado na reuniao

Denúncias pelos canais atuais e apuração no Sigadoc. Após decisão de revogação, o PROCON apenas operacionaliza no sistema do selo (anexo + status REVOGADO + saída da lista). Sem integração Sigadoc ou Procon Digital nesta entrega.

### Integrações
status da secao: validado

| Integração | Uso |
|------------|-----|
| MT Login | Autenticação do solicitante |
| JUCEMAT | Verificação e listagem de empresas |
| Validador MT | QR Code / autenticidade do certificado |

### Prazo de entrega (contexto)
status da secao: complementar

MVP alinhado a entrega urgente (~30 dias após abertura da OS), sujeito a comportamento das integrações (especialmente JUCEMAT).

---

## requisitos e regras

### RF-01 — Acesso e seleção de empresa
status da secao: validado

- Autenticação via MT Login.  
- Integração JUCEMAT para listar/verificar empresas vinculadas ao solicitante.  
- Requerimento vinculado à unidade do estabelecimento.  
- Documento de poderes de representação quando necessário.  
- Regra de quem pode solicitar (sócio / representante / filial): **ainda nao validado na reuniao** (pendência de negócio).

### RF-02 — Formulário de solicitação
status da secao: validado

O formulário deve contemplar, no mínimo:

1. Dados cadastrais do estabelecimento (CNPJ, razão social, nome fantasia, endereço, município, CNAE, responsável).  
2. Perguntas de enquadramento (ex.: casa noturna/boate; shows/eventos; bebida alcoólica; evento esportivo).  
3. Quantidade de funcionários e de capacitados; cálculo automático de percentual.  
4. Identificação de cada capacitado (nome, função, tipo de vínculo, curso, data) + certificados + comprovante de vínculo (CTPS, contrato, terceirizado, ato societário ou outro idôneo).  
5. Sinalização (banheiro feminino / local visível; forma de acionamento; 190; 180; formato A3 e texto oficial) + fotos.  
6. Sinal/código de acionamento + como é informado + foto do material.  
7. Declarações de procedimentos do protocolo (checklist sim/não — compromisso eletrônico).  
8. Câmeras: não é requisito; se SIM, perguntas condicionais de preservação 30 dias e acesso legal.  
9. Declarações finais (implementação, veracidade, sanção administrativa definitiva nos 12 meses anteriores, conforme decreto).  
10. Tela de revisão antes do envio; bloqueio se obrigatórios faltarem.

### RF-03 — Protocolização
status da secao: validado

Ao enviar: gerar número de protocolo, data/hora, comprovante e status PROTOCOLADO. Notificar servidor PROCON.

### RF-04 — Análise
status da secao: validado

- Status EM ANÁLISE.  
- Por requisito: Conforme / Não conforme / Necessita complementação (com especificação).  
- Exibir resposta, documento, base legal.  
- Prazo de análise/decisão: até 30 dias (minuta do decreto).  
- Impedir deferimento se houver requisito obrigatório “não conforme”.

### RF-05 — Diligência (Formulário de Ajustes)
status da secao: validado

- Diligência única; analista indica todas as pendências de uma vez.  
- Status EM DILIGÊNCIA; notificação ao solicitante.  
- Prazo 5 dias (Lei Estadual nº 7.692/2002).  
- Suspende contagem do prazo de análise.  
- Resposta → DILIGÊNCIA RESPONDIDA; sem resposta → DILIGÊNCIA NÃO RESPONDIDA.  
- Sem indeferimento automático por ausência de resposta; segue para decisão com elementos dos autos.

### RF-06 — Decisão
status da secao: validado

- **Deferido:** gera número do selo, certificado (template), dados da unidade, QR (Validador MT), datas de concessão e validade; status do selo VIGENTE; inclui na classe/lista; notifica solicitante (resultado) e servidor.  
- **Indeferido:** fundamentação (requisitos, fatos, base legal) + informação de recurso.

### RF-07 — Recurso
status da secao: validado

- Estabelecimento pode apresentar recurso.  
- Autoridade julga: provido → emite selo; não provido → finaliza pedido.  
- Prazo: regra especial do decreto ou, na ausência, Lei 7.692/2002.

### RF-08 — Validade e renovação
status da secao: validado

- Validade 24 meses.  
- Notificação de próximo ao vencimento.  
- Renovação com dados pré-preenchidos; fluxo análise → diligência → decisão → recurso.  
- Efeito se renovação tempestiva e selo vence antes da decisão: **ainda nao validado na reuniao**.

### RF-09 — Cancelamento a pedido
status da secao: validado

Estabelecimento solicita cancelamento → status CANCELADO A PEDIDO → sai da lista pública.

### RF-10 — Revogação administrativa
status da secao: ajustado na reuniao

- PROCON anexa decisão/cópia do procedimento e marca REVOGADO.  
- Remove da lista pública; consulta/QR indica não vigente.  
- Sem notificação automática de revogação no sistema.  
- Sem módulo de denúncia/fiscalização/apuração nesta entrega.  
- Sem integração Sigadoc / Procon Digital nesta entrega.

### RF-11 — Regras automáticas de conformidade (selo)
status da secao: complementar

| Situação | Resultado |
|----------|-----------|
| Nenhuma pessoa qualificada | Não conformidade |
| Capacitado sem comprovação de vínculo | Diligência / não conformidade |
| Menos de 2 capacitados ou < 10% em evento > 300 pessoas (confirmar decreto) | Não conformidade para o selo |
| Ausência de câmera | Não gera reprovação |
| Possui câmera e rejeita preservação 30 dias / acesso legal | Não conformidade |
| Cartaz sem forma de acionamento / sem 190 / sem 180 | Não conformidade |
| Código próprio inexistente | Não gera reprovação isolada (há requisito de ao menos um sinal — confirmar) |

Percentuais exatos: **ainda nao validado na reuniao** (confirmar redação final do decreto).

### RF-12 — Status
status da secao: validado

**Pedido:** RASCUNHO → PROTOCOLADO → EM ANÁLISE → EM DILIGÊNCIA → DILIGÊNCIA RESPONDIDA/NÃO RESPONDIDA → DEFERIDO ou INDEFERIDO → (EM RECURSO) → FINALIZADO  

**Selo:** VIGENTE → EXPIRADO | CANCELADO A PEDIDO | REVOGADO

### RF-13 — Analytics / relatórios
status da secao: complementar

- Analytics do processo de Solicitação de Selo.  
- Analytics da classe de Estabelecimentos com Selo (vigentes, a vencer, renovados, expirados, cancelados, revogados; filtros).  
- Exportação para planilha.  
- Indicadores de denúncia/apuração do PDF original: **corrigido (origem errada)** — fora do escopo desta entrega.

### RF-14 — Fora de escopo (explícito)
status da secao: ajustado na reuniao

Não desenvolver: denúncia no sistema; fiscalização/apuração; integração Sigadoc; integração Procon Digital; API de lista pública para site da Mulher (fase futura); arte SECOM do selo (pendência externa).

---

## campos da tela

### Tela 1 — Acesso e seleção de estabelecimento
status da secao: validado  
Objetivo: autenticar e escolher a unidade do requerimento.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Autenticação | integração | sim | MT Login | MT Login |
| Lista de empresas | lista/seleção | sim | Somente empresas retornadas pela JUCEMAT vinculadas ao usuário | JUCEMAT |
| Estabelecimento selecionado | seleção | sim | Vincula o requerimento à unidade | JUCEMAT / usuário |
| Documento de representação | arquivo | condicional | Exigir quando o solicitante não for o responsável cadastral definido | Upload |

Ações: Entrar; Selecionar empresa; Continuar.

### Tela 2 — Formulário de Solicitação
status da secao: validado  
Objetivo: coletar dados, declarações e evidências do protocolo.

#### 2.1 Dados do estabelecimento

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| CNPJ | texto | sim | Preferencialmente pré-preenchido da JUCEMAT | JUCEMAT |
| Razão social | texto | sim | Preferencialmente pré-preenchido | JUCEMAT |
| Nome fantasia | texto | sim | | JUCEMAT / usuário |
| Endereço | texto | sim | | JUCEMAT / usuário |
| Município | texto/lista | sim | | JUCEMAT / usuário |
| CNAE / atividade | texto/lista | sim | | JUCEMAT / usuário |
| Nome do responsável pelo requerimento | texto | sim | | Usuário |
| Contato do responsável | texto | sim | Telefone/e-mail | Usuário |

#### 2.2 Enquadramento

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| É casa noturna ou boate? | sim/não | sim | | Usuário |
| Realiza espetáculo/show/evento musical em local fechado? | sim/não | sim | | Usuário |
| Há venda de bebida alcoólica? | sim/não | sim | | Usuário |
| Trata-se de competição ou evento esportivo? | sim/não | sim | | Usuário |

#### 2.3 Equipe e capacitação

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Qtd. funcionários/equipe | número | sim | ≥ 0 | Usuário |
| Qtd. capacitados | número | sim | ≤ qtd. funcionários; calcular % automático | Usuário / sistema |
| Percentual capacitados | calculado | — | Exibir automaticamente | Sistema |
| Certificados do curso (geral) | arquivo(s) | sim | Curso Escola de Governo | Upload |

Regra mínima (confirmar decreto): ao menos 2 capacitados; eventos com público > 300 → mínimo 10% capacitados.

#### 2.4 Capacitados (repetível)

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Nome | texto | sim | Um registro por capacitado | Usuário |
| Função | texto | sim | | Usuário |
| Tipo de vínculo | lista | sim | Empregatício, prestação de serviço, terceirizado, sócio, outro | Usuário |
| Curso realizado | texto | sim | Protocolo Não é Não | Usuário |
| Data de conclusão | data | sim | | Usuário |
| Certificado | arquivo | sim | | Upload |
| Comprovante de vínculo | arquivo | sim | CTPS, contrato, etc. | Upload |

#### 2.5 Sinalização

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Mantém info de auxílio no banheiro feminino e local visível? | sim/não | sim | | Usuário |
| Contém forma de acionar o protocolo? | sim/não | sim | | Usuário |
| Contém telefone 190? | sim/não | sim | | Usuário |
| Contém telefone 180? | sim/não | sim | | Usuário |
| Formato mínimo A3 e texto oficial? | sim/não | sim | Texto legal fixo do cartaz | Usuário |
| Fotos da sinalização | arquivo(s) | sim | Local de ampla visualização e banheiro feminino | Upload |

#### 2.6 Sinal / código de acionamento

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Qual sinal ou código é utilizado? | texto | sim | Ao menos um | Usuário |
| Como é informado às mulheres? | texto | sim | | Usuário |
| Foto do material | arquivo | sim | Pode coincidir com cartaz | Upload |

#### 2.7 Procedimentos (declarações)

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Verifica de forma reservada se a mulher necessita assistência | sim/não | sim | Compromisso eletrônico | Usuário |
| Protege e afasta do agressor (inclusive visual) | sim/não | sim | | Usuário |
| Colabora na identificação de testemunhas | sim/não | sim | | Usuário |
| Solicita PM/agente quando necessário | sim/não | sim | | Usuário |
| Preserva local/vestígios até autoridade | sim/não | sim | | Usuário |
| Auxilia até transporte/comunicação à polícia | sim/não | sim | | Usuário |
| Cabe à mulher definir se sofreu constrangimento/violência | sim/não | sim | | Usuário |
| Suporte imediato (Lei 12.478/2024) | sim/não | sim | | Usuário |
| Orientação Código Sinal Vermelho (Lei 11.889/2022) | sim/não | sim | | Usuário |
| Reconhece sinal gestual universal de socorro | sim/não | sim | | Usuário |
| Compromete-se a assegurar direitos do protocolo | sim/não | sim | | Usuário |

#### 2.8 Câmeras (condicional)

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Dispõe de câmeras? | sim/não | sim | Se Não, pular bloco | Usuário |
| Preservará imagens do fato por ≥ 30 dias? | sim/não | condicional | Só se possui câmera | Usuário |
| Garantirá acesso legal (PC, perícia, envolvidos)? | sim/não | condicional | Só se possui câmera | Usuário |

#### 2.9 Declarações finais

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Declaração de implementação do protocolo | checkbox | sim | Texto fixo | Usuário |
| Declaração de veracidade | checkbox | sim | Texto fixo | Usuário |
| Sanção administrativa definitiva nos 12 meses anteriores | sim/não ou texto | sim | Conforme decreto | Usuário |

Ações: Salvar rascunho; Avançar; Voltar.

### Tela 3 — Revisão e envio
status da secao: validado  
Objetivo: confirmar dados e protocolar.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Resumo das respostas | leitura | — | Todos os blocos | Sistema |
| Lista de anexos | leitura | — | | Sistema |
| Pendências obrigatórias | alerta | — | Bloqueia envio se houver | Sistema |

Ações: Voltar para editar; **Protocolar solicitação** (método de tela).  
Mensagens: protocolo gerado; comprovante disponível.  
Notificação: ao servidor PROCON.

### Tela 4 — Formulário de Análise (PROCON)
status da secao: validado  
Objetivo: analisar cada requisito.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Nº protocolo | leitura | — | Cabeçalho | Sistema |
| CNPJ / empresa / estabelecimento / município | leitura | — | | Sistema |
| Data / prazo restante | leitura | — | | Sistema |
| Item do requisito | leitura | — | Resposta + anexo + base legal | Sistema |
| Conclusão do item | lista | sim | Conforme / Não conforme / Necessita complementação | Analista |
| Especificação da complementação | texto | condicional | Obrigatório se “Necessita complementação” | Analista |

Ações: Abrir diligência; Concluir análise / Encaminhar para decisão; Salvar.  
Regra: não deferir com item obrigatório “não conforme”.

### Tela 5 — Formulário de Ajustes (diligência)
status da secao: validado  
Objetivo: estabelecimento complementar pendências.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Pendências listadas pelo analista | leitura | — | Todas de uma vez | Analista / sistema |
| Resposta / esclarecimento | texto | sim | Prazo 5 dias | Solicitante |
| Anexos complementares | arquivo(s) | condicional | Conforme pendência | Upload |

Ações: Enviar complementação.  
Notificação: ao solicitante na abertura; ao servidor no retorno.

### Tela 6 — Decisão
status da secao: complementar  
Objetivo: autoridade deferir ou indeferir.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Parecer / fundamentação | texto | sim | | Autoridade |
| Requisitos não preenchidos | texto/lista | condicional | Se indeferir | Autoridade |
| Fundamentos legais | texto | sim se indeferir | | Autoridade |
| Decisão | lista | sim | Deferir / Indeferir | Autoridade |

Ações: **Deferir**; **Indeferir**.  
Efeitos do deferimento: emitir certificado (template), QR Validador MT, incluir na classe, notificar resultado.

### Tela 7 — Template / Certificado do Selo
status da secao: validado  
Objetivo: documento emitido do estabelecimento.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Número do selo | gerado | sim | Único | Sistema |
| CNPJ | leitura | sim | | Sistema |
| Nome fantasia | leitura | sim | | Sistema |
| Endereço / município | leitura | sim | | Sistema |
| Data de concessão | data | sim | | Sistema |
| Data de validade | data | sim | Concessão + 24 meses | Sistema |
| QR Code | imagem/link | sim | Validador MT | Sistema / Validador MT |
| Status | lista | sim | VIGENTE etc. | Sistema |

Ações: Baixar certificado. Arte visual final: pendência SECOM/Gabinete da Mulher.

### Tela 8 — Formulário de Recurso
status da secao: validado  
Objetivo: recorrer do indeferimento / julgar recurso.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Razões do recurso | texto | sim | Solicitante | Usuário |
| Anexos | arquivo(s) | não | | Upload |
| Decisão do recurso | lista | sim (autoridade) | Provido / Não provido | Autoridade |
| Fundamentação do julgamento | texto | sim (autoridade) | | Autoridade |

Ações: Apresentar recurso; Julgar recurso.

### Tela 9 — Formulário de Renovação
status da secao: validado  
Objetivo: renovar selo próximo ao vencimento.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Dados cadastrais | pré-preenchido | sim | Editáveis se alterados | Sistema |
| Demais blocos do formulário de solicitação | misto | sim | Revalidar condições; fotos atualizadas | Usuário / sistema |

Ações: Iniciar renovação; Protocolar renovação.  
Notificação: próximo ao vencimento.

### Tela 10 — Método / Cancelamento de Selo
status da secao: validado  
Objetivo: cancelamento voluntário.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Confirmação de cancelamento | checkbox/confirmação | sim | | Solicitante |
| Motivo (opcional) | texto | não | | Solicitante |

Ações: **Cancelar selo**. Efeito: CANCELADO A PEDIDO; sai da lista.

### Tela 11 — Método / Revogação de Selo
status da secao: ajustado na reuniao  
Objetivo: operacionalizar revogação após procedimento externo.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Estabelecimento / selo | seleção/leitura | sim | Selo VIGENTE | Sistema |
| Documento da decisão / processo | arquivo | sim | Cópia Sigadoc ou equivalente | Upload PROCON |
| Justificativa / referência do processo | texto | sim | | PROCON |
| Data da revogação | data | sim | | Sistema / usuário |

Ações: **Revogar selo**. Efeito: REVOGADO; sai da lista; QR/consulta não vigente.  
Sem notificação automática ao estabelecimento.

### Tela 12 — Classe Estabelecimentos com Selo (consulta/lista)
status da secao: complementar  
Objetivo: registro e consulta dos selos.

| Campo | Tipo | Obrigatório | Regra | Origem |
|-------|------|-------------|-------|--------|
| Nome fantasia | leitura | — | Público se vigente | Sistema |
| CNPJ | leitura | — | | Sistema |
| Endereço | leitura | — | | Sistema |
| Município | leitura | — | | Sistema |
| Número do selo | leitura | — | | Sistema |
| Data de concessão | leitura | — | | Sistema |
| Validade | leitura | — | | Sistema |
| Status | leitura | — | Vigente / Expirado / Cancelado / Revogado | Sistema |

Ações: Filtrar; Exportar (analytics); Abrir cancelamento/revogação conforme perfil.

### Tela 13 — Analytics
status da secao: complementar  
Objetivo: gestão do processo e da classe.

Indicadores mínimos: protocolados; em análise; em diligência; deferidos; indeferidos; tempo médio; vigentes; próximos do vencimento; renovados; expirados; cancelados; revogados; distribuição por município/atividade.  
Ações: Filtrar por período; Exportar planilha.

---

## o que mudou neste tick

- Documento criado na estrutura do documentador (necessidade; como é usado/ contexto; requisitos e regras; campos da tela).  
- Escopo ajustado conforme reunião 10/09: **sem** denúncia/fiscalização no sistema; **com** revogação administrativa.  
- Integrações fixadas: MT Login, JUCEMAT, Validador MT.  
- Indicadores de denúncia do PDF original removidos do escopo de entrega.

## pendencias de documentacao

1. Regra de quem pode solicitar (sócio / representante / filial) após JUCEMAT.  
2. Confirmar existência de MT Login para CNPJ (provável apenas PF).  
3. Percentuais mínimos de capacitados na redação final do decreto.  
4. Efeito jurídico da renovação tempestiva com selo vencido antes da decisão.  
5. Arte final do certificado/selo (SECOM / Gabinete da Mulher).  
6. Campos definitivos da lista pública “Local Seguro para Mulheres”.  
7. Separar ou unificar telas Análise × Decisão no desenho SYDLE.  
8. Gatilho automático de revogação por condenação consumerista (ideia de decreto — não decidido).
