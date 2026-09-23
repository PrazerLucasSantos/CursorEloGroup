título: Atlas — Requisitos do Fluxo de Demandas (F3)

fonte: Discovery Demanda F3 · 11/09/2026 · Transcrições Teams F1/F2 · Spec Consol. 1.0 (base v1.2) · Fluxo FigJam consolidado (board cnpLT7ErZjQgskRLWu2nID · ATLAS FLUXO ÚNICO)
escopo: Demanda pós-contrato (Consumo e Suporte) nos canais Portal Cliente, Portal Parceiro e Backoffice MTI. Cobre abertura, pré-aprovação N2, qualificação, via contrato, orçamento/proposta, OS, autorização, execução, termo/RAER, suporte e continuidade de medição. Fora deste documento: CRM de atendimento, retorno a orçamento antigo, distribuição por ociosidade e módulo fino de projetos (sessões próprias).

classe 1: Controle do documento e convenções
necessidade: Deixar explícito o que este documento decide, o que ainda é provisório e quem faz o quê — para que negócio, requisitos, desenvolvimento e homologação leiam a mesma verdade.
como é usado / contexto:
- Hierarquia de verdade: (1) fala literal nas transcrições F1/F2; (2) Consol. 1.0 / v1.2; (3) posição [PROVISÓRIO] só onde marcado; (4) itens [ABERTO] não se implementam por presunção.
- O fluxo FigJam é BPMN de análise (não modelo executável). As fases do board (P01–P08) mapeiam o processo; a numeração interna da Consol. §5 (P00–P07) é equivalente em conteúdo, com IDs diferentes.
- Exemplos numéricos da fala (21 dias, 24 h, 99,9%) ilustram — não viram parâmetro padrão do Atlas.
premissas:
- Atlas orquestra solicitação → análise → cobertura → OS → execução → homologação; ServiceNow recebe o atendimento já aprovado e em atendimento.
- Tipo na abertura = Consumo | Suporte. Licenciamento | Serviço é tipificação da análise, não substitui o tipo.
- Catálogo permanece na versão vinculada ao nascimento do contrato.
- Demandante, titular, consumidor e pagador são conceitos distintos (multi-CNPJ possível).
observações:
Marcadores: [CONFIRMADO] = fechado nas fontes · [PROVISÓRIO] = usar agora e validar com Luís Fellipe · [ABERTO] = PD sem base suficiente.
Mapeamento rápido board → este documento: P01 Abertura · P02 N2/PRE · P03 Qualificação · P04 Via contrato/Orçamento · P05 OS/autorização · P06 Execução · P07 Termo/RAER · P08 Medição (continuidade) · SUP = suporte.
bloco lista: Atores oficiais
- SISTEMA (Atlas): bloqueia campos, inicia SLAs, notifica, encaminha, envia ao ServiceNow, abre modal, gera RAER, preserva histórico, calcula indicadores.
- CLIENTE: solicitante, gestor e fiscal no portal (e papéis citados nas assinaturas).
- PARCEIRO: portal do parceiro — análise propositiva, bater ponto, declaração de entrega, participação em orçamento/dilação/ateste.
- MTI: backoffice (Explorer) — qualificação definitiva, deliberação, autorização de execução, encerramento com termo/RAER, responsáveis, suporte.
- ServiceNow e fabricante são dependências externas, não decidem no Atlas.
bloco tabela: Matriz de ações por ator
Ação | SISTEMA | CLIENTE | PARCEIRO | MTI
Abrir demanda | — | Portal | Portal | Backoffice
Bloquear dados / iniciar SLA demanda | Sim | — | — | —
Aprovar / devolver / recusar N2 | Encaminha | Gestor e fiscal | — | —
Qualificar / deliberar definitivo | Disponibiliza | — | Propositivo | Definitivo
Efetivar / bater ponto | Registra | — | Consumo/serviço | Avalia
Via contrato / orçamento | Status assinatura | Assina / aprova | Contribui | Detalha / delibera
Autorizar execução / enviar SN | SLA execução + envio | — | — | Autoriza (assina OS só no orçamento)
Encerrar + termo/RAER | Modal + RAER | Assina termo | Não assina termo | Encerra
Suporte (fila/grupo) | Encaminha | Abre tipo Suporte | Pode abrir | Atende / grupo

classe 2: Visão geral do processo
necessidade: Orquestrar no Atlas o ciclo completo da Demanda pós-contrato, com transparência de status para cliente, parceiro e MTI, e com o ServiceNow recebendo apenas o que já foi autorizado no Atlas.
como é usado / contexto:
- CLIENTE e PARCEIRO abrem pelo portal; MTI pelo backoffice.
- Dois relógios de prazo [PROVISÓRIO T3 / E46]: (1) prazo da demanda desde o registro; (2) prazo de execução desde a autorização.
- Assinatura da OS na recepção [PROVISÓRIO T2]: orçamento → gerente assina (E45); via contrato → só autoriza, sem reassinar (E21).
- Pedido de proposta pelo portal [PROVISÓRIO T1] entra no escopo; CRM e orçamento antigo ficam diferidos.
- Execução sem OS [PROVISÓRIO T4 / E50]: Atlas alerta e registra; não bloqueia de forma universal.
requisitos:
RF-VIS-01: Disponibilizar abertura nos três canais (portal cliente, portal parceiro, backoffice MTI).
RF-VIS-02: Manter linha do tempo e histórico visíveis a cliente, parceiro e MTI.
RF-VIS-03: Enviar demanda e OS ao ServiceNow já aprovadas e em atendimento após autorização no Atlas.
RF-VIS-04: Distinguir conclusão técnica de formalização por termo assinado.
regras:
RN-VIS-01: MTI não usa portal próprio de Demanda; opera no backoffice.
RN-VIS-02: Exemplos numéricos da fala não são parâmetros padrão.
RN-VIS-03: CRM de atendimento e retorno retroativo a orçamento estão diferidos.
RN-VIS-04: Toda ação de método deve indicar o ator (SISTEMA | CLIENTE | PARCEIRO | MTI).
RN-VIS-05: Tipo "Projeto" não foi confirmado como terceira opção do campo Tipo — não implementar.
campos:
Campo | Tipo | Obrig. | Observação
Canal de origem | Contexto | Sim | Indica se a demanda veio do portal (cliente/parceiro) ou do backoffice (MTI).
Tipo da demanda | Opção | Sim | Classifica a demanda como Consumo ou Suporte para o fluxo correto.
Status / estágio | Controlado | Sim | Mostra em que etapa a demanda está; vocabulário final em PD20.
Ator da última ação | Controlado | Sistêmico | Registra quem executou a última ação (SISTEMA, CLIENTE, PARCEIRO ou MTI).
métodos:
Abrir demanda | Botão | CLIENTE ou PARCEIRO (portal) · MTI (BO) | Inicia abertura.
Consultar timeline | Navegação | CLIENTE · PARCEIRO · MTI | Dados montados pelo SISTEMA.

classe 3: Abertura da demanda (FigJam P01)
necessidade: Registrar a necessidade de consumo ou suporte com identificação do solicitante, solução/contrato e descrição mínima, iniciando a contagem do prazo da demanda no registro.
como é usado / contexto:
- Quem preenche: CLIENTE, PARCEIRO ou MTI, conforme o canal.
- SISTEMA bloqueia dados do logado, exibe bloco contratual após a solução, valida descrição, registra, notifica, inicia SLA da demanda [CONFIRMADO E46] e abre o acompanhamento.
- Contato secundário é editável e [PROVISÓRIO L5] opcional.
- Cancelar fecha o formulário; não cancela demanda já registrada.
- Visibilidade após registro [CONFIRMADO fala 11/09]: Consumo → gerente técnico + titular da parceria; Suporte → grupo/classe do produto (pode 24×7).
- Correção de campos inválidos = perfil de origem (CLI | PAR | MTI), não “sempre cliente”.
requisitos:
RF-ABR-01: Apresentar seleção inicial Consumo ou Suporte.
RF-ABR-02: Preencher e bloquear solicitante, contato principal, número e data do evento.
RF-ABR-03: Permitir informar contato secundário sem obrigatoriedade.
RF-ABR-04: Exibir dados do contrato após seleção da solução.
RF-ABR-05: Exigir descrição; permitir observação vazia e anexos.
RF-ABR-06: Ao registrar, iniciar contagem do prazo declarado da demanda (inclusive suporte).
RF-ABR-07: Direcionar a visibilidade conforme tipo (consumo × suporte).
regras:
RN-ABR-01: Licenciamento e serviço não substituem Consumo/Suporte na abertura.
RN-ABR-02: Projeto não é terceiro tipo de demanda nesta fase.
RN-ABR-03: Abertura por parceiro/MTI — origem de solicitante/organização ainda parcial [ABERTO PD04].
RN-ABR-04: Sem solução informada, a demanda segue para triagem/qualificação MTI.
campos:
Campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra
Tipo da demanda | Opção (Consumo/Suporte) | Sim | Não | Abertura | Define o ramo da demanda; escolhido pelo ator do canal no início.
Solicitante | Referência | ND | Sim | Abertura | Identifica quem abriu; preenchido pelo sistema com o usuário logado.
Contato principal | Texto/ref | ND | Sim | Abertura | Exibe o contato padrão do solicitante para comunicação da demanda.
Número do contato | Texto | ND | Sim | Abertura | Telefone/contato associado, carregado pelo sistema.
Contato secundário | Texto/ref | Não | Não | Abertura | Permite informar um contato adicional opcional [PROVISÓRIO].
Data do evento | Data/hora | ND | Sim | Abertura | Marca quando a demanda foi aberta; origem fina em [ABERTO PD04].
Solução | Seleção | ND | Não | Abertura | Liga a demanda a uma solução e dispara o bloco contratual.
Número do contrato | Texto | — | Sim | Condicional | Mostra o contrato vinculado após escolha da solução.
Nome do contrato | Texto | — | Sim | Condicional | Identifica o contrato em texto legível para o operador.
Contratante / Contratada | Ref org | — | Sim | Condicional | Exibe as organizações do contrato para contexto da análise.
Vigência | Período | — | Sim | Condicional | Limita o período válido da demanda/OS frente ao contrato.
Saldo global | Monetário/qtde | — | Sim | Condicional | Informa saldo disponível; fórmula em [ABERTO PD16].
Total provisionado | Monetário/qtde | — | Sim | Condicional | Mostra o valor/quantidade provisionado no contrato.
OSs cobertas / em aberto | Numérico | — | Sim | Condicional | Resume OSs já cobertas e em aberto no contrato.
Consumo até o momento | Monetário/qtde | — | Sim | Condicional | Exibe o consumo acumulado para apoiar a decisão de abertura.
Percentual de execução | % | — | Sim | Condicional | Indica o percentual já executado do contrato.
Descrição do contrato | Texto | — | Sim | Condicional | Texto descritivo do contrato para leitura na abertura.
Descrição da demanda | Texto longo | Sim | Não | Abertura | Narrativa do pedido; preenchida pelo ator do canal.
Observação | Texto longo | Não | Não | Abertura | Complemento livre opcional do solicitante.
Anexos | Arquivos | ND | Não | Abertura | Anexa evidências do pedido; limites em [ABERTO PD03].
métodos:
Selecionar Consumo/Suporte | Opção | CLIENTE · PARCEIRO · MTI | Abertura.
Informar secundário / solução / descrição / anexos | Formulário | CLIENTE · PARCEIRO · MTI | —
Cancelar | Botão | CLIENTE · PARCEIRO · MTI | Fecha formulário (não cancela registrada).
Registrar | Botão | CLIENTE · PARCEIRO · MTI | SISTEMA grava, notifica, inicia SLA, abre timeline.
Corrigir dados (retorno de validação) | Formulário | Perfil de origem | Antes do registro válido.

classe 4: Listagem, timeline e indicadores
necessidade: Localizar demandas e acompanhar status, linha do tempo, histórico e indicadores de prazo para os três perfis.
como é usado / contexto:
- Consulta: CLIENTE, PARCEIRO e MTI (cada um vê o que a regra de visibilidade permite).
- SISTEMA monta listagem, timeline, histórico, cards de SLA e andamento de projeto (API ServiceNow).
- Desfechos citados do último estágio: efetivado, entregue, rejeitado — nomenclatura final em [ABERTO PD20].
requisitos:
RF-ACO-01: Listar demandas visíveis ao perfil.
RF-ACO-02: Exibir status, timeline, histórico e último evento.
RF-ACO-03: Exibir indicadores de prazo (início, declarado, situação, totalizador).
RF-ACO-04: Exibir andamento de projeto quando houver integração.
regras:
RN-ACO-01: Timeline deve ser evidente para cliente, parceiro e MTI [CONFIRMADO E47].
RN-ACO-02: Há duas medições distintas de prazo (demanda × execução) [PROVISÓRIO T3]; relação fina em [ABERTO PD15].
campos:
Campo | Tipo | Obrig. | Observação
Identificador | ID/texto | Sistêmico | Código único da demanda na listagem e no detalhe.
Status | Opção | Sistêmico | Situação atual da demanda; vocabulário em [ABERTO PD20].
Linha do tempo | Etapas | Sim | Mostra o avanço pelos estágios do fluxo (5–8 ilustrativos).
Histórico | Eventos | Sistêmico | Registra eventos, devoluções e alterações para auditoria.
SLA demanda — início | Data/hora | Sistêmico | Marca o início do prazo da demanda no registro (E46).
SLA execução — início | Data/hora | Condicional | Marca o início do prazo de execução na autorização (E21/E46).
Andamento projeto | Composto | Condicional | Exibe progresso do projeto quando houver integração ServiceNow.
métodos:
Listar / filtrar | Navegação | CLIENTE · PARCEIRO · MTI | —
Consultar timeline / SLA | Navegação | CLIENTE · PARCEIRO · MTI | —
Atualizar indicadores | Automático | SISTEMA | Inclui consulta SN quando aplicável.

classe 5: Pré-aprovação N2 do cliente (FigJam P02)
necessidade: Quando a demanda exigir nível 2, permitir que gestor e fiscal da organização cliente aprovem, devolvam ou recusem antes da operação MTI.
como é usado / contexto:
- Ações humanas: somente CLIENTE (gestor e fiscal).
- SISTEMA encaminha, registra a decisão e aplica o efeito (libera MTI / devolve ao solicitante / encerra).
- O que define “nível 2” e a sequência gestor×fiscal permanecem em [ABERTO PD02 / PD07].
- Devolver retorna ao solicitante / perfil de origem para correção e reenvio.
requisitos:
RF-N2-01: Encaminhar demanda N2 a gestor e fiscal do cliente.
RF-N2-02: Registrar aprovar, devolver ou recusar com efeitos descritos.
RF-N2-03: Exibir dados da demanda em somente leitura para o aprovador.
regras:
RN-N2-01: Gestor e fiscal são cargos da organização cliente [CONFIRMADO L6].
RN-N2-02: Ambos os papéis têm as três ações (aprovar / devolver / recusar).
RN-N2-03: Sem N2 aplicável, o fluxo segue direto à qualificação MTI.
campos:
Campo | Tipo | Obrig. | Observação
Dados da demanda | Composto | Sistêmico | Exibe o pedido em somente leitura para o aprovador N2.
Decisão | Opção | Sim | Permite aprovar, devolver ou recusar antes da operação MTI.
Motivo | Texto | Condicional | Explica devolução ou recusa; detalhar regra fina em PD07.
métodos:
Encaminhar para N2 | Automático | SISTEMA | Quando aplicável.
Aprovar | Botão | CLIENTE (gestor e fiscal) | Libera análise MTI.
Devolver | Botão | CLIENTE (gestor e fiscal) | Retorna ao solicitante/origem.
Recusar | Botão | CLIENTE (gestor e fiscal) | Encerra a demanda.

classe 6: Preparação de responsáveis (PRE / Consol. P00)
necessidade: Garantir, no cadastro do contrato com parceria, a designação de titular e substitutos e o painel da gestão técnica — contexto que não se repete a cada demanda.
como é usado / contexto:
- Exclusivo MTI (gerente) no backoffice.
- SISTEMA sinaliza a necessidade de designação e alimenta o painel (eventos e propostas em contratação).
- Substituto 2 corresponde ao gerente [CONFIRMADO]. Mecanismo de férias/ausência e múltiplas parcerias: [ABERTO PD11].
- Distribuição automática por ociosidade está diferida.
requisitos:
RF-RES-01: Sinalizar necessidade de designação ao cadastrar contrato com objeto de parceria.
RF-RES-02: Registrar titular, substituto 1 e substituto 2.
RF-RES-03: Exibir no painel demandas da responsabilidade e propostas em contratação.
regras:
RN-RES-01: Designação pelo gerente; ociosidade automática fora do escopo.
RN-RES-02: Gatilho de férias foi citado; origem e acionamento automático ainda abertos [ABERTO PD11].
campos:
Campo | Tipo | Obrig. | Observação
Sinalização de designação | Notificação | Sistêmica | Alerta o gerente a designar responsáveis no contrato com parceria.
Titular / substituto 1 / substituto 2 | Usuário | Sim | Define quem responde pela demanda; subst. 2 = gerente.
Demandas / propostas no painel | Lista/numérico | Sistêmico | Mostra o volume sob responsabilidade da gestão técnica.
métodos:
Sinalizar designação | Automático | SISTEMA | Cadastro contrato com parceria.
Designar responsáveis | Formulário | MTI | —
Abrir painel da gestão técnica | Navegação | MTI | —

classe 7: Qualificação e deliberação MTI (FigJam P03)
necessidade: Qualificar vínculos (produto, catálogo, itens, parceria), tipificar licenciamento/serviço, registrar a manifestação do parceiro e a deliberação definitiva da MTI.
como é usado / contexto:
- Mesma visualização de menu: MTI (backoffice) e PARCEIRO (portal).
- PARCEIRO age em caráter propositivo [CONFIRMADO RN10 / E06]; MTI delibera em definitivo.
- PARCEIRO em consumo/serviço pode efetivar / “bater ponto” [CONFIRMADO E48]; timing fino vs assinaturas: [ABERTO PD09].
- Em licenciamento, medidas podem incluir credencial, appliance ou notificação ao fabricante (credencial não é obrigatória em todo caso).
- Encaminhamentos da deliberação MTI: Via contrato | Orçamento | Devolver (correção do solicitante) | Recusar.
- Devolver não cria loop de reanálise só na MTI: o solicitante/origem corrige e a demanda retorna ao cadastro.
requisitos:
RF-ANL-01: Reaproveitar vínculos e complementar produto, catálogo, itens e parceria.
RF-ANL-02: Disponibilizar a demanda ao parceiro quando houver parceria (1+; individual ou coletivo).
RF-ANL-03: Diferenciar campos de licenciamento e de serviço.
RF-ANL-04: Registrar proposta do parceiro e deliberação definitiva da MTI.
RF-ANL-05: Exigir motivo ao devolver; registrar confirmação/assinatura ao aprovar quando aplicável.
RF-ANL-06: Permitir efetivar/bater ponto pelo parceiro em consumo/serviço.
regras:
RN-ANL-01: Menu do parceiro = mesmo da MTI, propositivo; MTI definitiva.
RN-ANL-02: Catálogo na versão vinculada ao nascimento do contrato.
RN-ANL-03: Credencial não é obrigatória em todo licenciamento.
RN-ANL-04: Variação do menu por tipo/estado: [ABERTO PD10].
RN-ANL-05: Declaração/efetivação do parceiro não encerra sozinha o fluxo.
campos:
Campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra
ID e status | Composto | Sistêmico | Sim | Sempre | Identifica a demanda e seu estado atual no fluxo.
Contrato / solução / descrição | Composto | Sistêmico | Sim | Sempre | Exibe o contexto herdado da abertura para a análise.
Parceria | Ref | Condicional | Condicional | Condicional | Associa a parceria; MTI edita em definitivo e PAR propõe.
Produto / catálogo / itens | Ref/Multi | Condicional | Não | Qualificação | Qualifica o que será atendido; MTI decide e PAR propõe.
Tipo da análise | Licenciamento/Serviço | Condicional | Derivado | Análise | Tipifica a demanda para liberar campos e ações corretas.
Ação de decisão | Opção | Sim | Não | Por perfil | Registra a deliberação (via contrato, orçamento, devolver, recusar).
Motivo | Texto | Sim se devolver | Não | Ao devolver | Justifica a devolução para correção pelo solicitante.
Efetivação / bater ponto | Registro | Condicional | Não | Consumo/serviço | Permite ao parceiro declarar efetivação; timing em PD09.
métodos:
Disponibilizar ao parceiro | Automático | SISTEMA | Quando parceria identificada.
Complementar vínculos / tipificar | Formulário | MTI · PARCEIRO (propositivo) | —
Via contrato / Orçamento / Devolver / Recusar | Botão | MTI = definitivo · PAR = propositivo | —
Efetivar / bater ponto | Ação | PARCEIRO | Só consumo/serviço.
Registrar deliberação | Automático | SISTEMA | Após ação MTI.

classe 8: Atendimento via contrato (FigJam P04 — ramo)
necessidade: Detalhar o atendimento sobre contrato próprio ou patrocinado, coletar assinaturas do cliente e só então liberar o caminho operacional de OS/autorização.
como é usado / contexto:
- Detalhamento: MTI (catálogo, itens, descrição, NEC, valores).
- Assinaturas do detalhamento: CLIENTE — gestor, fiscal e solicitante [CONFIRMADO].
- SISTEMA controla status de assinatura e “com quem está”.
- Cobertura: contrato próprio do cliente ou contrato patrocinador (pagamento por outro órgão, sujeito a autorização).
- Após assinaturas, no caminho via contrato a MTI autoriza execução sem reassinar a OS [PROVISÓRIO T2 / E21].
requisitos:
RF-CTR-01: Relacionar atendimento a contrato, catálogo, itens, descrição, NEC e valores.
RF-CTR-02: Distinguir contrato próprio e patrocinador.
RF-CTR-03: Encaminhar às assinaturas de gestor, fiscal e solicitante.
RF-CTR-04: Exibir status de assinatura e com quem está o documento.
RF-CTR-05: Permitir devolver o detalhamento para ajuste antes de seguir.
regras:
RN-CTR-01: Início efetivo do atendimento via contrato ocorre após as assinaturas aplicáveis.
RN-CTR-02: Via contrato: após vínculo/assinaturas, não se reassina a OS na recepção — autoriza-se a execução [PROVISÓRIO].
campos:
Campo | Tipo | Obrig. | Observação
Contrato aplicável | Ref | Sim | Indica se o atendimento usa contrato próprio ou patrocinado.
Autorização do patrocinador | Registro | Condicional | Registra anuência quando outro órgão paga.
Catálogo / itens / NEC / valores | Relação/Texto | Sim | Detalha o que será entregue e os valores do atendimento.
Destinatários de assinatura | Papéis | Sim | Define gestor, fiscal e solicitante que devem assinar.
Status / com quem está | Controlado | Sistêmico | Mostra o andamento das assinaturas e o detentor atual.
métodos:
Detalhar atendimento via contrato | Formulário | MTI | —
Encaminhar assinaturas | Botão | MTI / SISTEMA | Destino: CLIENTE.
Assinar detalhamento | Fluxo | CLIENTE (gestor + fiscal + solicitante) | —
Devolver detalhamento | Botão | CLIENTE | Volta ao detalhamento MTI.
Atualizar status de assinatura | Automático | SISTEMA | —

classe 9: Orçamento, cobertura e proposta (FigJam P04 — ramo)
necessidade: Elaborar ou reaproveitar orçamento de consumo; se não houver cobertura, registrar a forma de pagamento ou o pedido de proposta — sem liberar execução automaticamente.
como é usado / contexto:
- Elaboração: MTI/operação e contribuição do PARCEIRO (propositiva). Cadeia citada inclui vendas → parceiro → gerente → cliente.
- Classes de orçamento: Licenciamento (itens, quantitativos, valores) e Serviço (com projeto: épicos/histórias/sprints; ou sob demanda, sem projeto).
- Catálogo na versão do contrato.
- Aprovação do orçamento: CLIENTE. Sem cobertura: CLIENTE escolhe indenização | nova contratação | desistir.
- Indenização: atendimento pode prosseguir, mas o rito comercial permanece registrado [CONFIRMADO nuance Claude/Consol.].
- Nova contratação: proposta (PO) com de acordo MTI e parceiro [PROVISÓRIO T1 / E54]; pedido automático pelo portal fica de fora (E39).
- CRM e retorno a orçamento antigo: diferidos.
requisitos:
RF-ORC-01: Elaborar orçamento com itens/quantitativos nas classes licenciamento e serviço.
RF-ORC-02: Submeter assinaturas do orçamento e acompanhar status/SLA de assinatura.
RF-ORC-03: Após aprovação com cobertura, gerar OS ou autorizar OS existente.
RF-ORC-04: Registrar decisão sem cobertura (indenização / nova contratação / desistência).
RF-ORC-05: Permitir solicitar/registrar proposta de contratação pelo portal quando aplicável [PROVISÓRIO T1].
regras:
RN-ORC-01: Parceiro contribui no orçamento; não decide em definitivo.
RN-ORC-02: Escolher indenização/nova contratação não autoriza execução automaticamente.
RN-ORC-03: No caminho orçamento, gerente da operação assina a OS na recepção [PROVISÓRIO E45] — ver classe OS.
RN-ORC-04: CRM e voltar orçamento antigo = diferido.
RN-ORC-05: Totais, validade, moeda e recusa de assinatura: [ABERTO] detalhar.
campos:
Campo | Tipo | Obrig. | Observação
Detalhamento do orçamento | Itens | Sim | Monta itens/quantitativos/valores do orçamento de consumo.
Classe (licenciamento/serviço) | Opção | Sim | Define quais campos e estrutura o orçamento exige.
Estrutura de projeto | Composto | Condicional | Organiza épicos/histórias/sprints quando o serviço tem projeto.
Assinaturas do orçamento | Papéis/status | Sim | Controla quem assina, com quem está e o SLA de assinatura.
Forma de pagamento | Opção | Condicional | Registra indenização, nova contratação ou desistência sem cobertura.
Pedido / registro de proposta (PO) | Ação/registro | Condicional | Abre/registra proposta de contratação [PROVISÓRIO T1 / PD25].
métodos:
Elaborar / reaproveitar orçamento | Formulário | MTI · PARCEIRO | —
Concordar na cadeia operacional | Ação | MTI · PARCEIRO | Conforme papéis.
Aprovar orçamento | Fluxo | CLIENTE | SISTEMA gera/autoriza OS se houver cobertura.
Definir pagamento | Opção | CLIENTE | Indenização | Nova contratação | Desistir.
Registrar proposta (PO) | Ação | MTI · PARCEIRO (de acordo) · CLIENTE (pedido) | Não automático.

classe 10: OS, conferência e autorização (FigJam P05)
necessidade: Vincular OS gerada ou existente, conferir quantitativos e vigência, controlar saldo/consumo e autorizar a execução no Atlas antes do envio ao ServiceNow.
como é usado / contexto:
- Vínculo, conferência e autorização: MTI.
- Assinar OS na recepção: MTI (gerente) somente no caminho orçamento [PROVISÓRIO T2 / E45].
- Via contrato: não reassinar; autorizar [PROVISÓRIO E21].
- Divergência de quantitativos: devolve-se a DEMANDA (não só a OS) [CONFIRMADO L7 / E12]; correção pelo solicitante/origem.
- Sem OS: SISTEMA alerta e registra; não bloqueia universalmente [PROVISÓRIO T4 / E50].
- Após autorizar: SISTEMA inicia SLA de execução e envia demanda+OS ao ServiceNow “aprovada e em atendimento”.
requisitos:
RF-OS-01: Vincular OS gerada ou existente à demanda.
RF-OS-02: Conferir quantitativos e vigência; devolver a demanda com motivo se divergirem.
RF-OS-03: Controlar vigência (≤ contrato), saldo e consumo da OS.
RF-OS-04: Registrar autorização de execução no Atlas nos dois caminhos.
RF-OS-05: No caminho orçamento, registrar assinatura do gerente na recepção da OS [PROVISÓRIO].
RF-OS-06: Alertar ausência de OS sem bloqueio universal [PROVISÓRIO].
RF-OS-07: Tratar substituição de OS com ateste e histórico.
regras:
RN-OS-01: Via contrato → autorizar sem reassinar (E21). Orçamento → assinar OS (E45) e autorizar.
RN-OS-02: Autorização operacional é obrigatória nos dois caminhos.
RN-OS-03: Inexistência de OS não retira obrigação de pagamento diante de consumo (E50).
RN-OS-04: Cardinalidade demanda×OS, fórmulas de saldo: [ABERTO PD12 / PD13 / PD16].
campos:
Campo | Tipo | Obrig. | Observação
Número / tipo de vínculo OS | Texto/opção | Condicional | Associa a OS gerada ou existente à demanda.
Vigência / saldo / consumo | Período/valores | Sim/Sistêmico | Controla vigência (≤ contrato), saldo e consumo da OS.
Qtde solicitada / autorizada | Numérico | Condicional | Confere quantitativos; divergência devolve a demanda.
Assinatura recepção OS | Registro | Condicional | Registra assinatura do gerente na recepção (só orçamento).
Autorização da execução | Registro | Sim | Libera a execução no Atlas antes do envio ao ServiceNow.
Ateste substituição | Concordância | Na substituição | Registra anuência da equipe MTI e do parceiro na troca de OS.
métodos:
Vincular / gerar OS | Ação | MTI · SISTEMA | —
Conferir quantitativos e vigência | Ação | MTI | —
Devolver demanda com motivo | Botão | MTI | Objeto = DEMANDA.
Corrigir demanda | Formulário | Solicitante / origem | Retorno à conferência.
Assinar OS (recepção) | Botão | MTI (gerente) | Só caminho orçamento.
Autorizar execução | Botão | MTI | SISTEMA: SLA execução + envio SN.
Alertar ausência de OS | Automático | SISTEMA | Não bloqueia universalmente.

classe 11: Execução, alterações e entrega (FigJam P06)
necessidade: Executar licenciamento ou serviço, acompanhar prazos e consumo, registrar dilação e alterações com histórico, e declarar a entrega com avaliação da MTI quando houver parceiro.
como é usado / contexto:
- Execução: PARCEIRO e/ou MTI.
- Licenciamento: disponibilizar credencial, appliance ou outro comprovante.
- Serviço: com projeto (épicos/histórias/sprints) ou sob demanda sem estrutura de projeto.
- Timeline/SLA/consumo visíveis a CLIENTE, PARCEIRO e MTI.
- Dilação: autorização das partes envolvidas (Cliente + MTI + parceiro).
- Substituição de OS exige ateste da equipe e do parceiro; SISTEMA preserva histórico.
- Declaração de entrega: PARCEIRO (ou MTI executor); MTI avalia a declaração do parceiro.
- Contingência: se a API ServiceNow falhar, admite-se finalização manual registrada (inferência operacional marcada no fluxo; tratamento formal ainda aberto).
- Renovação/suspensão de serviço continuado: [ABERTO PD17].
requisitos:
RF-EXE-01: Registrar disponibilização de licenciamento conforme entregável.
RF-EXE-02: Registrar execução de serviço com ou sem projeto.
RF-EXE-03: Exibir acompanhamento de prazo, consumo e timeline.
RF-EXE-04: Registrar dilação com autorização das partes.
RF-EXE-05: Refletir alteração de estimativa em OS e demanda com histórico.
RF-EXE-06: Registrar declaração de entrega e avaliação MTI quando aplicável.
regras:
RN-EXE-01: Serviço sem projeto não exige épicos/sprints por presunção.
RN-EXE-02: Dilação sem concordância das partes não se considera autorizada.
RN-EXE-03: Declaração do parceiro não substitui a avaliação da MTI.
campos:
Campo | Tipo | Obrig. | Observação
Disponibilização / execução | Composto | Condicional | Registra a entrega de licenciamento ou a execução do serviço.
Progresso / % / sprint | Composto | Condicional | Acompanha progresso do projeto via ServiceNow quando aplicável.
Dilação | Evento | Condicional | Registra prorrogação autorizada por MTI, parceiro e cliente.
Alteração de estimativa | Registro | Condicional | Atualiza estimativa na OS/demanda com histórico.
Declaração de entrega / anexos | Texto/arquivos | Sim | Formaliza a entrega com evidências pelo executor.
Avaliação MTI | Registro | Condicional | Avalia a declaração do parceiro antes do encerramento.
métodos:
Executar licenciamento ou serviço | Ação | PARCEIRO · MTI | —
Consultar prazos / timeline | Navegação | CLIENTE · PARCEIRO · MTI | —
Registrar dilação | Botão | MTI (inicia) | Autorizações das partes.
Atualizar estimativa / substituir OS | Ação | MTI · PARCEIRO | Com ateste na substituição.
Declarar entrega | Botão | PARCEIRO · MTI | —
Avaliar atendimento do parceiro | Botão | MTI | —
Consultar ServiceNow | Automático | SISTEMA | Quando aplicável.

classe 12: Termo de homologação e RAER (FigJam P07)
necessidade: Encerrar a demanda na conclusão técnica, abrir o termo de homologação relacionando o autorizado ao executado, coletar assinaturas do cliente e gerar o RAER no mesmo evento.
como é usado / contexto:
- Quem encerra: MTI [PROVISÓRIO L2].
- SISTEMA abre o modal do termo e gera o RAER no mesmo evento [PROVISÓRIO L4 / RN35].
- RAER: cliente não visualiza; campos e assinaturas do RAER ficam para agenda Hire [ABERTO PD23].
- Assinantes do termo [CONFIRMADO L3]: gestor, fiscal e solicitante. Participação de equipe/parceria só se confirmada formalmente (não presumir).
- Recusa do termo não cancela automaticamente a demanda; efeito fino [ABERTO].
- Ajuste do termo: CLIENTE ou MTI; documento já assinado: [ABERTO PD21].
- Conclusão técnica ≠ formalização assinada.
requisitos:
RF-TER-01: Encerrar a demanda com conclusão técnica pela MTI.
RF-TER-02: Abrir modal do termo ao encerrar.
RF-TER-03: Compor termo com OS, execução, evidências e estimado versus realizado.
RF-TER-04: Encaminhar assinaturas a gestor, fiscal e solicitante.
RF-TER-05: Permitir solicitar ajuste (cliente ou MTI).
RF-TER-06: Associar termo assinado à demanda.
RF-TER-07: Gerar RAER no mesmo evento do termo (campos diferidos).
RF-TER-08: Não exibir o RAER ao cliente no portal.
regras:
RN-TER-01: Conclusão técnica e formalização são estados distintos.
RN-TER-02: Recusa do termo não cancela automaticamente.
RN-TER-03: Campos/responsáveis do RAER não se inventam nesta fase [ABERTO PD23].
campos:
Campo | Tipo | Obrig. | Observação
Abertura do modal / geração RAER | Comportamento | — | Abre o termo e gera o RAER no encerramento técnico pela MTI.
Composição do termo | Relação | Sim | Confronta o autorizado com o executado e as evidências.
Assinantes do termo | Papéis | Sim | Define gestor, fiscal e solicitante que homologam.
RAER | Documento | Sistêmico | Documento gerado no mesmo evento; não visível ao cliente.
Solicitação de ajuste | Registro | Condicional | Permite pedir correção no termo antes da assinatura final.
Termo assinado | Documento | Sistêmico | Associa o termo homologado à demanda.
métodos:
Encerrar demanda | Botão | MTI | Dispara modal + RAER.
Compor / conferir termo | Formulário | MTI | —
Assinar termo | Fluxo | CLIENTE (gestor + fiscal + solicitante) | —
Solicitar ajuste | Botão | CLIENTE · MTI | Efeito PD21.
Registrar recusa | Botão | CLIENTE | Sem cancelamento automático.
Associar termo assinado | Automático | SISTEMA | Após assinaturas.

classe 13: Suporte (FigJam SUP / Consol. P07)
necessidade: Encaminhar demanda de suporte ao(s) grupo(s) de apoio da classe/produto qualificado, distribuir o profissional por carga e disponibilidade, e acompanhar no Atlas sem impor projeto/história nem o ramo comercial completo de consumo.
como é usado / contexto:
- Abertura: tipo Suporte (qualquer canal autorizado).
- MTI/SISTEMA qualifica o tipo de demanda (produto, classe de serviço, descrição) — isso define para qual(is) grupo(s) de apoio o pedido cai.
- Complemento Luís Fellipe (dinâmica ágil): pode cair para muitos grupos (ex.: configuração de backup → Infra + Rede na mesma demanda).
- SISTEMA encaminha cada grupo acionado à sua fila (crédito/capacidade do grupo) e inicia SLA da demanda no registro.
- Dentro de cada grupo: sorteio/distribuição do profissional por disponibilidade e número de tarefas já assumidas (menor carga recebe a próxima; ex.: 4 pessoas com 6 tarefas, 1 com 3 → próxima vai para quem tem 3).
- Atendimento: MTI/grupo (equipe, terceirizado ou sobreaviso; regime pode ser 24×7 sem universalizar).
- PARCEIRO não usa o rito de “bater ponto” de consumo neste ramo.
- Qual registro marca o início do atendimento: [ABERTO PD27].
- Resolução, aceite, reabertura e aplicabilidade de orçamento/OS/termo: [ABERTO PD22].
- Fluxo no protótipo: flow-proto-demanda-suporte (8 passos: qualificação → 1+N grupos → distribuição → fila → SN).
requisitos:
RF-SUP-01: Encaminhar suporte a um ou mais grupos de apoio conforme o tipo/classe qualificado.
RF-SUP-02: Distribuir profissional por grupo com base em disponibilidade e menor carga de tarefas (redistribuição manual MTI registra histórico).
RF-SUP-03: Exibir regime aplicável e preservar eventos/histórico/satisfação no Atlas.
RF-SUP-04: Comunicar com ServiceNow sem exigir projeto/história.
regras:
RN-SUP-01: Suporte não usa “bater ponto” de parceiro como no consumo.
RN-SUP-02: Não impor orçamento/OS/termo a todo suporte.
RN-SUP-03: Mínimo 1 grupo; N grupos quando o tipo exigir competências distintas — cada grupo faz seu próprio sorteio.
campos:
Campo | Tipo | Obrig. | Regra | Visibilidade | Observação
Grupos de apoio | Ref grupo (multiple) | Sim | Derivados do tipo/classe; MTI ajusta se ambíguo | Tipo = Suporte | Luís: 1 ou N grupos (ex.: Infra + Rede). Cada um recebe na própria fila.
Profissionais atribuídos | Texto (por grupo) | Sistêmico | Menor carga + disponibilidade por grupo | Tipo = Suporte | Resultado da distribuição automática; redistribuição manual com motivo no histórico.
Critério de distribuição | Lista | Sistêmico | Padrão = menor carga + disponibilidade | Tipo = Suporte | Alternativa: redistribuição manual MTI.
Regime 24×7 | Sim/Não | Condicional | Do serviço — não universalizar | Tipo = Suporte | Sobreaviso quando aplicável ao produto/classe.
Contagem de prazo | Data/hora | Sistêmico | Inicia no registro (E46) | Sempre | SLA da demanda de suporte.
Início do atendimento | — | — | — | — | Marco — definição em [ABERTO PD27].
Histórico / satisfação | Eventos | Condicional | Preservar eventos disponíveis | Conforme etapa | Satisfação quando houver no Atlas.
métodos:
Abrir suporte | Fluxo flow-proto-demanda-suporte | CLIENTE · PARCEIRO · MTI | Tipo = Suporte.
Qualificar tipo | Ação | MTI / SISTEMA | Define grupo(s).
Encaminhar grupo(s) | Automático | SISTEMA | 1+N grupos na fila.
Distribuir profissional | Automático | SISTEMA | Carga + disponibilidade (Luís).
Atender na fila | Ação | MTI / grupo | Sem bater ponto.
Comunicar SN / preservar histórico | Automático | SISTEMA | Sem projeto/história.

classe 14: Medição, ateste e faturamento (FigJam P08 — continuidade)
necessidade: Registrar a continuidade pós-formalização (medição, ateste e encaminhamento financeiro) sem congelar integrações ainda não detalhadas nas fontes de Demanda.
como é usado / contexto:
- Continuidade discutida; detalhe fino e integrações permanecem abertos.
- Ateste do cliente: citado prazo de 5 dias úteis somente para o relatório de ateste — não generalizar.
- Emissão Atlas futura/condicionada permanece marcada como tal.
requisitos:
RF-MED-01: Consolidar medição de consumo real e itens recorrentes quando aplicável.
RF-MED-02: Relacionar pendências visíveis antes do pedido de venda.
RF-MED-03: Registrar ateste do cliente ou decurso do prazo do relatório.
RF-MED-04: Encaminhar para faturamento / continuidade financeira sem inventar conector.
regras:
RN-MED-01: Cinco dias úteis referem-se ao relatório de ateste citado — não a todo o processo.
RN-MED-02: Integrações HCMX/emissão: a detalhar — não presumir.
campos:
Campo | Tipo | Obrig. | Observação
Medição consolidada | Composto | Condicional | Consolida consumo real e itens recorrentes para faturamento.
Pendências | Lista | Condicional | Lista pendências visíveis antes do pedido de venda.
Ateste / prazo do relatório | Registro/tempo | Condicional | Registra ateste do cliente ou decurso do prazo (5 d.u. no relatório citado).
Pedido de venda / faturamento | Continuidade | Condicional | Encaminha a continuidade financeira sem presumir integração.
métodos:
Consolidar medição | Ação | MTI / SISTEMA | —
Receber relatório e atestar | Fluxo | CLIENTE | —
Encaminhar faturamento | Ação | MTI / SISTEMA | Continuidade.

classe 15: Portal do Cliente — visão por canal
necessidade: Agrupar o que o solicitante, o gestor e o fiscal fazem no portal do cliente.
como é usado / contexto:
- Ator: CLIENTE. SISTEMA aplica regras de tela, SLA e notificação.
- Faz: abrir/consultar, N2, assinar detalhamento/orçamento/termo, definir pagamento/proposta, timeline, dilação quando parte, suporte.
- Não faz: deliberação definitiva MTI, designação de responsáveis, autorizar execução/SN, encerrar demanda, ver RAER.
requisitos:
RF-PCL-01: Abrir e consultar demandas de consumo e suporte.
RF-PCL-02: Executar aprovação interna N2 (gestor e fiscal).
RF-PCL-03: Assinar atendimento via contrato, orçamento e termo.
RF-PCL-04: Definir pagamento / solicitar proposta sem cobertura [PROVISÓRIO].
RF-PCL-05: Acompanhar timeline, SLA e dilação quando for parte.
regras:
RN-PCL-01: Contato secundário opcional na abertura.
RN-PCL-02: Fiscal tem as mesmas ações N2 que o gestor.
RN-PCL-03: RAER não é exibido ao cliente.
campos:
Campo | Tipo | Obrig. | Observação
Herdados das classes de abertura, N2, via contrato, orçamento, termo e suporte | — | — | Reutiliza os campos das telas do cliente conforme a etapa.
métodos:
Nova demanda | Botão | CLIENTE | —
Aprovar / Devolver / Recusar N2 | Botão | CLIENTE (gestor/fiscal) | —
Assinar via contrato / orçamento / termo | Fluxo | CLIENTE | —
Definir pagamento / Solicitar proposta | Ação | CLIENTE | Sem cobertura.
Consultar timeline/SLA | Navegação | CLIENTE | —

classe 16: Portal do Parceiro — visão por canal
necessidade: Disponibilizar Demanda no portal do parceiro (além do catálogo), com análise propositiva, efetivação e declaração de entrega.
como é usado / contexto:
- Ator: PARCEIRO. Deliberação definitiva permanece com a MTI.
- Faz: abrir/listar da parceria, analisar (propositivo), bater ponto, contribuir em orçamento/proposta, declarar entrega, atestar substituição, dilação.
- Não faz: N2 do cliente, assinar termo, ver RAER, autorizar execução/SN, encerrar demanda, designar responsáveis MTI.
requisitos:
RF-PPR-01: Abrir e listar demandas da parceria.
RF-PPR-02: Analisar com o mesmo menu da MTI em modo propositivo.
RF-PPR-03: Efetivar atendimento (bater ponto) em consumo/serviço.
RF-PPR-04: Declarar entrega e atestar substituição de OS.
RF-PPR-05: Participar de orçamento/proposta e dilação.
regras:
RN-PPR-01: Proposta do parceiro não encerra sozinha; MTI delibera.
RN-PPR-02: Canal do parceiro é Demanda, não só catálogo [CONFIRMADO L8].
campos:
Campo | Tipo | Obrig. | Observação
Herdados das classes de abertura, qualificação, orçamento, OS e entrega | — | — | Mesmos campos da operação, com efeito só propositivo na análise.
métodos:
Nova / listar demanda | Botão | PARCEIRO | —
Analisar (menu propositivo) | Botão | PARCEIRO | Sem efeito definitivo.
Efetivar / bater ponto | Ação | PARCEIRO | Consumo/serviço.
Participar orçamento / dilação / ateste OS | Ação | PARCEIRO | —
Declarar entrega | Botão | PARCEIRO | —

classe 17: Backoffice MTI — visão por canal
necessidade: Operar no Explorer Atlas a ponta a ponta operacional: abertura, qualificação definitiva, comercialização, OS, autorização, encerramento com termo/RAER, responsáveis e suporte.
como é usado / contexto:
- Ator: MTI. SISTEMA aplica SLA, envio SN, modal termo+RAER.
- Autoriza execução; assina OS só no caminho orçamento [PROVISÓRIO].
- Encerra demanda e dispara termo + RAER.
requisitos:
RF-BO-01: Abrir demanda no backoffice.
RF-BO-02: Qualificar e deliberar de forma definitiva.
RF-BO-03: Detalhar via contrato e orçamento; autorizar execução; enviar SN.
RF-BO-04: Avaliar declaração do parceiro; encerrar com termo e RAER.
RF-BO-05: Designar titulares/substitutos e usar o painel da gestão.
RF-BO-06: Operar fila/contexto de suporte.
regras:
RN-BO-01: Autorização no Atlas antecede o ServiceNow.
RN-BO-02: MTI encerra a demanda [PROVISÓRIO L2].
campos:
Campo | Tipo | Obrig. | Observação
Escopo completo das classes de processo | — | — | Consolida no backoffice todos os campos operacionais da demanda.
métodos:
Abrir / qualificar / deliberar (definitivo) | Botões | MTI | —
Detalhar via contrato / orçamento | Formulário | MTI | —
Assinar OS (caminho orçamento) | Botão | MTI | —
Autorizar execução | Botão | MTI | → SISTEMA envia SN.
Avaliar declaração do parceiro | Botão | MTI | —
Encerrar demanda | Botão | MTI | → modal + RAER.
Designar responsáveis / painel | Formulário/navegação | MTI | —
Atender suporte | Ação | MTI / grupo | —

classe 18: Pendências de validação (PDs) e o que não fazer
necessidade: Explicitar o que ainda depende de validação com o cliente e o que não deve ser implementado por presunção.
como é usado / contexto:
- Usar esta classe como checklist de workshop com Luís Fellipe.
- Itens [PROVISÓRIO] já orientam o protótipo, mas exigem carimbo formal.
- Itens [ABERTO] bloqueiam desenho fino até resposta.
premissas:
- Não inventar campos de RAER, calendário universal de SLA, nem tipo Projeto.
- Não contar SLA de execução durante a análise (conflita com E46).
requisitos:
RF-PD-01: Manter rastreio dos PDs abertos até fechamento formal.
RF-PD-02: Separar no backlog o que é Confirmado, Provisório e Aberto.
regras:
RN-PD-01: PD sem resposta ≠ regra opcional; é ausência de regra.
RN-PD-02: Provisório pode ir ao protótipo com etiqueta de validação.
bloco lista: Itens provisórios em uso (validar)
- T1 Pedido de proposta pelo portal (não automático) — PD25.
- T2 Assinatura OS: E45 orçamento × E21 via contrato — PD14.
- T3 Dois SLAs (registro × autorização) — PD15.
- T4 Execução sem OS: alerta, sem bloqueio universal — PD12.
- L2 MTI encerra · L3 assinantes do termo · L4 RAER no mesmo evento · L5 secundário opcional.
bloco lista: Itens abertos (não implementar por presunção)
- PD02 / PD07 — definição e sequência do N2.
- PD03 — limites de anexo.
- PD04 — origem de dados quando PAR/MTI abre.
- PD09 / PD10 — timing do bater ponto e variação do menu.
- PD11 — ausência/férias e múltiplas parcerias.
- PD12 / PD13 / PD16 — emissor OS, cardinalidade, saldo.
- PD15 — calendário, pausas, relação dos dois SLAs.
- PD17 — renovação/suspensão de serviço continuado.
- PD20 — vocabulário final de status/timeline.
- PD21 — ajuste de termo já assinado.
- PD22 / PD27 — fronteira e início do suporte.
- PD23 — campos/responsáveis do RAER (agenda Hire).
- PD25 — formalizar proposta no portal.
bloco lista: Explicitamente fora / não copiar
- CRM de atendimento e retorno a orçamento antigo.
- Distribuição automática por ociosidade.
- Tipo "Projeto" como terceira opção do Tipo da demanda.
- Contar prazo de execução durante a análise/qualificação.
observações:
Documento alinhado ao FigJam consolidado (cnpLT7ErZjQgskRLWu2nID). Qualquer divergência futura entre board e este MD deve ser resolvida pela hierarquia de fontes da classe 1 — não pelo protótipo.
