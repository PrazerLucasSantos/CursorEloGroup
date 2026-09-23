título: Requisitos — Atlas Fase 2

fonte: Validação de Requisitos — Fase 2 (17/08/2026)
escopo: Cadastro de Catálogo e Produto (Fase 2). Consumo, OS, orçamento, saldo e apostila no contrato pertencem à Fase 3, citados aqui apenas como referência de fluxo.

classe 1: Métrica
necessidade: Padronizar as métricas utilizadas na comercialização dos produtos e serviços, garantindo que sejam cadastradas de forma centralizada e reutilizadas nos Catálogos e Produtos.
como é usado / contexto:
- A MTI mantém o cadastro das métricas utilizadas no processo de comercialização, como UST, USN e HST.
- As métricas são cadastradas de forma parametrizada e posteriormente referenciadas pelos Catálogos e Produtos, sem utilização de texto livre.
- O sistema deve permitir identificar em quais Catálogos, Parcerias e Produtos determinada métrica está sendo utilizada, evitando exclusões ou alterações que possam gerar relacionamentos inconsistentes.
requisitos:
RF-MET-01: Permitir à MTI criar, editar, consultar e listar métricas.
RF-MET-02: Permitir informar Nome, Descrição e Ativo da métrica.
RF-MET-03: Permitir utilizar métricas previamente cadastradas nos Catálogos e Produtos, não permitindo o preenchimento da métrica por texto livre.
RF-MET-04: Exibir os relacionamentos da métrica, permitindo identificar os Catálogos, Parcerias e Produtos que utilizam o registro.
RF-MET-05: Permitir ativar ou inativar uma métrica.
RF-MET-06: Impedir a exclusão de uma métrica que possua relacionamentos ativos no sistema.
regras:
RN-MET-01: O cadastro e a manutenção das métricas são de responsabilidade da MTI.
RN-MET-02: O Nome da métrica deve identificar a unidade utilizada na comercialização, como UST, USN ou HST.
RN-MET-03: A seleção de métricas em Catálogos e Produtos deve utilizar exclusivamente registros ativos previamente cadastrados.
RN-MET-04: Uma métrica utilizada por Catálogo, Parceria ou Produto não deve ser excluída enquanto possuir relacionamentos.
RN-MET-05: Caso uma métrica deixe de ser utilizada, deve ser preferencialmente inativada, preservando os registros e relacionamentos históricos.
RN-MET-06: Ao consultar uma métrica, o sistema deve disponibilizar a visão de seus relacionamentos para permitir ao usuário avaliar o impacto antes de sua inativação ou alteração.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Digitado (MTI) | Sim | Identificador. Exemplos: UST, USN, HST. Outras métricas podem existir.
Descrição | Texto | Não | Descrição da métrica. Ex.: Unidade de Serviço Técnico.
Ativo | Booleano | Sim | Define se a métrica está disponível para utilização em novos registros.
Relacionamentos | Derivado / somente leitura |  | Exibe onde a métrica está sendo utilizada: Catálogos, Parcerias e Produtos.

classe 2: Tipo de Cobrança
necessidade: Definir quando o produto é cobrado do cliente, com lista fechada: Mensal - cobrança todo mês; Anual - cobrança a cada ano; Conforme homologação - cobrança no momento da homologação; Única - cobrança uma única vez (usar quando o modelo de venda for Perpétuo).
como é usado / contexto:
- MTI mantém a lista parametrizada (sem texto livre no produto).
- Produto seleciona um tipo cadastrado - obrigatório.
- Tipo de cobrança não é cadastrado no Catálogo da parceria.
- Aparece no formulário de cadastro/edição.
requisitos:
RF-COB-01: Criar, editar e listar tipos de cobrança.
RF-COB-02: Tipo de cobrança obrigatório no Produto. Não se cadastra tipo de cobrança no Catálogo.
regras:
RN-COB-01: Cobrança ≠ forma de consumo; consumo sob demanda / OS fica fora do cadastro desta classe na Fase 2.
RN-COB-02: Valores oficiais: Mensal · Anual · Conforme homologação · Única. Se o modelo de venda for Perpétuo, o tipo de cobrança do produto é Única. Recorrência e pro rata ficam no contrato (Fase 3).
RN-COB-03: Cobrança no formulário; não no card.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Texto / Lista | Sim | Valores: Mensal · Anual · Conforme homologação · Única. Sob demanda não é tipo de cobrança.
Ativo | Booleano | Sim | Define se o tipo pode ser usado em novos cadastros de produto.

classe 3: Vertical de Serviço de TI
necessidade: Classificar as ofertas de serviço segundo as verticais de atuação da MTI em Tecnologia da Informação, permitindo organizar, identificar e consultar esses itens conforme a área de atuação.
como é usado / contexto:
- A MTI mantém o cadastro das Verticais de Serviço de TI.
- As Verticais representam áreas de atuação em Tecnologia da Informação, como Dados e Inteligência Artificial, Automação e Processos, Cibersegurança, Nuvem, Conectividade, Identidade e Governo, entre outras que venham a ser cadastradas.
- A Vertical é selecionada no Produto quando o tipo for Serviço.
- O vínculo é com a Parceria (via produto/catálogo daquela parceria), e não com o Parceiro/Organização (CNPJ).
- Um mesmo parceiro pode ter mais de uma parceria com a MTI, em verticais diferentes.
- Ao abrir uma Vertical, o sistema exibe as Parcerias que a utilizam (consulta reversa, somente leitura), para evitar inativação ou exclusão com registros órfãos.
requisitos:
RF-VERT-01: Permitir à MTI criar, editar, consultar e listar Verticais de Serviço de TI.
RF-VERT-02: Permitir informar Nome, Descrição e Ativo da Vertical.
RF-VERT-03: Permitir selecionar a Vertical no cadastro do Produto quando o tipo for Serviço.
RF-VERT-04: Exibir, na consulta da Vertical, as Parcerias relacionadas (somente leitura).
RF-VERT-05: Permitir usar a Vertical como classificação e filtro de produtos de serviço.
RF-VERT-06: Permitir ativar ou inativar uma Vertical.
RF-VERT-07: Impedir a exclusão de uma Vertical que esteja em uso.
regras:
RN-VERT-01: O cadastro e a manutenção das Verticais de Serviço de TI são de responsabilidade da MTI.
RN-VERT-02: A Vertical representa uma área de atuação de Tecnologia da Informação e não o nome de uma Solução, Produto, Grupo ou Parceria.
RN-VERT-03: O vínculo ocorre no Produto (tipo Serviço). Na tela da Vertical, as Parcerias aparecem por consulta reversa. Não se vincula a Vertical ao Parceiro/Organização.
RN-VERT-04: Um mesmo Parceiro/Organização pode possuir diferentes Parcerias associadas a diferentes Verticais de Serviço de TI.
RN-VERT-05: Somente Verticais ativas devem estar disponíveis para novos relacionamentos.
RN-VERT-06: Uma Vertical em uso não deve ser excluída; quando deixar de ser utilizada, deve ser inativada, preservando o histórico.
RN-VERT-07: Ao consultar uma Vertical, o sistema deve mostrar as Parcerias que utilizam esse cadastro.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Texto | Sim | Nome da vertical de atuação. Ex.: Dados e Inteligência Artificial, Automação e Processos, Cibersegurança, Nuvem, Conectividade, Identidade e Governo.
Descrição | Texto | Não | Descrição do escopo da vertical de atuação.
Ativo | Booleano | Sim | Define se a Vertical está disponível para novos relacionamentos.
Parcerias | Referência / somente leitura | Não | Consulta reversa. Mostra as parcerias que usam esta vertical. Não cadastrar parceria neste campo.

classe 4: Parceria
necessidade: Registrar e administrar o acordo comercial firmado entre a MTI e a Organização/Parceiro, separando a Parceria do cadastro da empresa (CNPJ) e servindo de contexto para Soluções, Catálogos e Produtos.
como é usado / contexto:
- A MTI cria e mantém a Parceria no backoffice.
- Uma mesma Organização pode participar de diferentes Parcerias com a MTI.
- A Parceria estabelece o contexto comercial usado depois para Soluções, Catálogos e Produtos.
- No Portal do Parceiro, o usuário vê e edita somente o que pertence às suas Parcerias.
- Ao salvar uma nova Parceria, o sistema gera automaticamente um Catálogo em branco, status Rascunho.
- Quem monta o catálogo e os produtos é o parceiro no portal.
- A MTI analisa, homologa e publica.
- O parceiro não publica e não apostila.
requisitos:
RF-PAR-01: Permitir à MTI criar, editar, consultar e listar Parcerias.
RF-PAR-02: Permitir vincular à Parceria uma Organização/Parceiro previamente cadastrado.
RF-PAR-03: Permitir que uma mesma Organização/Parceiro participe de diferentes Parcerias.
RF-PAR-04: Permitir informar Nome, Descrição, Observações e Ativo da Parceria.
RF-PAR-05: Exibir as Soluções relacionadas à Parceria.
RF-PAR-06: Ao salvar a Parceria, criar automaticamente o Catálogo em branco, status Rascunho, para o parceiro preencher.
RF-PAR-07: No Portal do Parceiro, restringir consulta e edição às Parcerias do usuário.
RF-PAR-08: Permitir ativar ou inativar a Parceria.
regras:
RN-PAR-01: A criação inicial e a manutenção da Parceria são de responsabilidade da MTI.
RN-PAR-02: Parceria e Organização são entidades distintas: Organização representa a empresa/CNPJ e Parceria representa o acordo comercial.
RN-PAR-03: Uma Organização pode participar de mais de uma Parceria.
RN-PAR-04: A Parceria deve ter uma Organização/Parceiro vinculado.
RN-PAR-05: As Soluções são relacionadas à Parceria depois que a Parceria existe. Não são pré-requisito para criar a Parceria.
RN-PAR-06: No Portal do Parceiro, o usuário só acessa as Parcerias às quais está vinculado.
RN-PAR-07: O Catálogo gerado ao salvar a Parceria nasce em Rascunho. O conteúdo é montado pelo parceiro. Homologar, publicar e apostilar são atos da MTI.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Texto | Sim | Nome da Parceria. Ex.: MTI HOST, MTI SIMPLIFICA.
Descrição | Texto | Não | Descrição do acordo/parceria.
Parceiro | Referência – Organização | Sim | Organização previamente cadastrada. Uma parceria, um parceiro.
Soluções | Relacionamento / somente leitura | Não | Soluções vinculadas depois da criação da Parceria.
Catálogos | Relacionamento / somente leitura | Não | Inclui o rascunho gerado ao salvar a Parceria. Conteúdo montado pelo parceiro.
Observações | Texto | Não | Informações complementares.
Ativo | Booleano | Sim | Controla se a Parceria está disponível para uso.

classe 5: Solução
necessidade: Registrar as Soluções comerciais disponibilizadas no contexto de uma Parceria, permitindo organizar os Catálogos e Produtos comercializados pela MTI.
como é usado / contexto:
- A Solução representa o nome comercial da oferta vinculada a uma Parceria, como MTI SaaS, MTI QI, MTI Simplifica, entre outras.
- A Solução é cadastrada pela MTI depois que a Parceria existe e organiza Catálogos e Produtos.
- O Catálogo relacionado à Solução é obtido automaticamente a partir da Parceria/Solução. Não deve ser selecionado manualmente de forma incompatível.
requisitos:
RF-SOL-01: Permitir à MTI criar, editar, consultar e listar Soluções.
RF-SOL-02: Permitir vincular a Solução a uma Parceria existente.
RF-SOL-03: Permitir informar Nome, Descrição e Ativo da Solução.
RF-SOL-04: Exibir o Catálogo relacionado à Solução de forma automática, quando existente (somente leitura).
RF-SOL-05: Disponibilizar a Solução para uso nos Catálogos da respectiva Parceria.
RF-SOL-06: Permitir ativar ou inativar a Solução.
regras:
RN-SOL-01: Toda Solução deve estar vinculada a uma Parceria.
RN-SOL-02: A Solução representa uma oferta comercial vinculada à Parceria.
RN-SOL-03: Somente Soluções da Parceria selecionada devem aparecer nos respectivos contextos.
RN-SOL-04: O vínculo com o Catálogo é determinado pelo sistema conforme Parceria e Solução. Não há seleção manual incompatível.
RN-SOL-05: Uma Solução com relacionamentos ativos não deve ser excluída; deve ser inativada quando necessário.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Texto | Sim | Nome comercial da Solução. Ex.: MTI Simplifica, MTI Host.
Parceria | Referência | Sim | Parceria à qual a Solução pertence.
Catálogo | Derivado / somente leitura | Não | Preenchido automaticamente conforme Parceria e Solução.
Descrição | Texto | Não | Descrição da Solução.
Ativo | Booleano | Sim | Ativa ou inativa a Solução para novos vínculos.

classe 6: Grupo
necessidade: Agrupar Produtos e Serviços em famílias dentro de cada Parceria, facilitando a organização, consulta e filtragem do Catálogo.
como é usado / contexto:
- Os Grupos são definidos no contexto de uma Parceria e utilizados para organizar os Produtos e Serviços pertencentes a ela.
- A MTI pode cadastrar e manter Grupos.
- O Parceiro também pode cadastrar Grupos no escopo das próprias Parcerias.
- Todo Produto deve estar vinculado a um Grupo.
- Na listagem de Grupos, o sistema deve permitir filtrar os registros por Parceria ou consultar todos os Grupos.
requisitos:
RF-GRP-01: Permitir criar, editar, consultar e listar Grupos.
RF-GRP-02: Permitir vincular cada Grupo a uma Parceria.
RF-GRP-03: Exigir a seleção de um Grupo no cadastro do Produto.
RF-GRP-04: Permitir filtrar a listagem de Grupos pela Parceria selecionada ou pela opção Todos.
RF-GRP-05: Permitir à MTI cadastrar e manter Grupos.
RF-GRP-06: Permitir ao Parceiro cadastrar e manter Grupos exclusivamente no escopo de suas Parcerias.
RF-GRP-07: Permitir ativar ou inativar um Grupo.
RF-GRP-08: Impedir a exclusão de Grupo que esteja relacionado a Produtos.
regras:
RN-GRP-01: Todo Grupo deve estar vinculado a uma Parceria.
RN-GRP-02: Todo Produto deve possuir um Grupo.
RN-GRP-03: Ao cadastrar ou selecionar um Grupo para um Produto, devem ser disponibilizados somente os Grupos pertencentes à respectiva Parceria.
RN-GRP-04: O Parceiro somente pode criar ou alterar Grupos pertencentes às Parcerias às quais possui acesso.
RN-GRP-05: A MTI pode administrar os Grupos das Parcerias.
RN-GRP-06: Um Grupo relacionado a Produto não deve ser excluído; quando deixar de ser utilizado, deve ser inativado ou os Produtos devem ser realocados.
RN-GRP-07: A listagem deve permitir consultar todos os Grupos ou restringi-los a uma Parceria específica.
campos:
Campo | Tipo | Obrig. | S. leitura | Regra
Nome | Texto | Sim | Não | Nome do Grupo
Parceria | Referência | Sim | Não | Parceria à qual o Grupo pertence
Descrição | Texto | Não | Não | Descrição do agrupamento
Ativo | Booleano | Sim | Não | Padrão ativo

classe 7: Modelo de Venda
necessidade: Classificar como o produto é comercializado (forma comercial), distinto de quando é cobrado (Tipo de Cobrança).
como é usado / contexto:
- A MTI cadastra e mantém os modelos de venda.
- O Produto seleciona um modelo cadastrado.
- Valores da lista: Por Licença · Por Serviço · Por Pacote · Perpétuo · Por UST. A MTI pode reduzir a lista antes da carga.
- Se o modelo for Perpétuo, o Tipo de Cobrança do produto é Única.
- Não oficializar on-premise / SaaS / subscrição como valores desta lista nesta versão.
requisitos:
RF-MV-01: Criar, editar e listar modelos de venda.
RF-MV-02: Exigir modelo de venda no Produto.
regras:
RN-MV-01: Modelo de venda ≠ tipo de cobrança (forma comercial ≠ ritmo de cobrança).
RN-MV-02: Valores: Por Licença · Por Serviço · Por Pacote · Perpétuo · Por UST.
RN-MV-03: Se o modelo for Perpétuo, o tipo de cobrança do produto é Única.
RN-MV-04: Não excluir modelo vinculado a produto publicado ou em uso; preferir inativar.
campos:
Campo | Tipo | Obrig. | Observação
Nome | Texto | Sim | Valores: Por Licença · Por Serviço · Por Pacote · Perpétuo · Por UST.
Descrição | Texto | Não | Explica o significado operacional do modelo.
Ativo | Booleano | Sim | Define se o modelo pode ser usado em novos cadastros de produto.

classe 8: Dados de Parceria por Produto
necessidade: Registrar custo, markup, período mínimo comercial e divisão percentual (parceiro × MTI) fora do preço de venda do produto.
como é usado / contexto:
- Um registro por combinação parceria × solução × produto.
- No Produto fica só o valor unitário de venda.
- Aqui ficam custo, markup, período mínimo e percentuais.
- Período mínimo vem no CSV do parceiro (12 / 24 / 36 / 48 / 60 meses). Perpétuo não entra neste campo (Perpétuo é Modelo de Venda + cobrança Única).
- Custo do parceiro é informado à MTI à parte — não trafega no CSV do parceiro.
- A MTI aplica o markup. O sistema calcula Distribuição do Parceiro (%) e Distribuição da MTI (%) em somente leitura. Fórmula exata pendente da MTI.
requisitos:
RF-DP-01: Permitir registrar dados comerciais por parceria × solução × produto.
RF-DP-02: Exigir período mínimo comercial com opções fechadas 12 / 24 / 36 / 48 / 60 meses.
RF-DP-03: Permitir à MTI informar custo do parceiro e markup.
RF-DP-04: Calcular e exibir distribuição percentual parceiro e MTI em somente leitura.
regras:
RN-DP-01: Separar dados comerciais da parceria do preço de venda do produto.
RN-DP-02: Markup não fica no cadastro do Produto; fica neste bloco, aplicado pela MTI.
RN-DP-03: Custo do parceiro não vai no CSV do portal do parceiro.
RN-DP-04: Período mínimo obrigatório; sem opção Perpétuo neste campo.
RN-DP-05: Vigência textual não é usada; o período mínimo governa o aspecto comercial.
RN-DP-06: % parceiro + % MTI = 100; campos somente leitura (cálculo a partir do markup). Fórmula exata = pendente MTI.
campos:
Campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra
Parceria | reference | Não | Não | Visível | Parceria à qual se aplicam custo/markup.
Solução | reference | Sim | Não | Visível | Solução associada às condições comerciais.
Produto | reference | Sim | Não | Visível | Produto ao qual se aplicam as condições.
Período mínimo (comercial) | textOptions | Sim | Não | Visível | 12 / 24 / 36 / 48 / 60 meses. Sem Perpétuo. Vem no CSV.
Custo do parceiro | number | Sim | Não | Visível | Custo de entrada informado à MTI à parte. Não é o valor unitário do Produto. Não vai no CSV do parceiro.
Markup | number | Sim | Não | Visível | Markup aplicado pela MTI. Não cadastrar no Produto.
Distribuição do parceiro | number | Sim | Sim | Visível | % da receita do parceiro. Somente leitura.
Distribuição da MTI | number | Sim | Sim | Visível | % da receita da MTI. Somente leitura.
Ativo | boolean | Sim | Não | Visível | Controla disponibilidade do registro.

classe 9: Catálogo da Parceria
necessidade: Organizar e manter o conjunto de Produtos e Serviços comercializados no contexto de uma Parceria e Solução, permitindo controlar sua identificação, versionamento, métricas comerciais, responsáveis e demais configurações necessárias ao cadastro dos Produtos. O Catálogo estabelece o contexto comercial no qual os Produtos são cadastrados e posteriormente disponibilizados para os processos de contratação.
como é usado / contexto:
- O Catálogo está relacionado a uma Parceria e à respectiva Solução.
- Ao salvar a Parceria, o sistema pode gerar o Catálogo em Rascunho; o parceiro monta o conteúdo (produtos e grupos) no portal.
- A MTI mantém as configurações estruturais e comerciais do Catálogo (incluindo toggles) e realiza a governança (análise, homologação, publicação).
- Os Produtos são cadastrados no contexto desse Catálogo, manualmente ou por CSV.
- Um Produto somente pode existir vinculado a um Catálogo previamente existente.
- O Catálogo controla métricas comerciais, valores associados às métricas, responsáveis e classificação quanto a Serviço, Licenciamento e Universal.
- Complexidade e coeficientes não ficam no Catálogo; ficam no Produto (Serviço).
- Consumo pelo Cliente, níveis de contratação e regras contratuais pertencem à Fase 3.
requisitos:
RF-CAT-01: Cadastrar e manter Catálogo da Parceria: Permitir criar, editar, consultar e manter o Catálogo relacionado a uma Parceria e Solução.
RF-CAT-02: Classificar o Catálogo: Permitir informar É Universal?, É Catálogo de Serviços? e É Catálogo de Licenciamento?.
RF-CAT-03: Configurar métricas do Catálogo: Permitir associar uma ou mais métricas comerciais previamente cadastradas ao Catálogo, com valor unitário.
RF-CAT-04: Registrar responsáveis do Catálogo: Permitir registrar os responsáveis associados ao Catálogo.
RF-CAT-05: Relacionar Produtos ao Catálogo: Permitir compor o Catálogo com Produtos cadastrados no seu contexto.
RF-CAT-06: Versionar o Catálogo: Permitir controlar as versões do Catálogo sem sobrescrever seu histórico.
RF-CAT-07: Controlar fluxo de análise: Permitir controlar o envio, análise, solicitação de ajustes, aprovação e reprovação do Catálogo e de seus Produtos.
RF-CAT-08: Registrar identificadores externos: Permitir armazenar códigos SIAG/Protheus do Catálogo, quando disponíveis (manual nesta fase).
RF-CAT-09: Identificar elegibilidade Universal: Permitir identificar quando um Catálogo possui característica Universal.
RF-CAT-00: Cardinalidade Parceria / Solução / Catálogo: Uma Parceria pode ter várias Soluções. Cada Catálogo pertence a uma Parceria e uma Solução. Na prática, a parceria pode ter vários catálogos — um por Solução.
regras:
RN-CAT-01.1: Todo Catálogo deve estar relacionado a uma Parceria.
RN-CAT-01.2: O Catálogo deve estar relacionado à Solução correspondente.
RN-CAT-01.3: O Catálogo deve possuir Nome.
RN-CAT-01.4: O sistema deve controlar a versão atual e permitir identificar a versão anterior do Catálogo.
RN-CAT-01.5: Um Produto somente poderá ser cadastrado após a existência do Catálogo ao qual será vinculado.
RN-CAT-01.6: Todo Produto deve estar vinculado a um Catálogo.
RN-CAT-02.1: O Catálogo deve permitir informar se possui característica Universal.
RN-CAT-02.2: O Catálogo deve permitir informar se contempla comercialização de Serviços.
RN-CAT-02.3: O Catálogo deve permitir informar se contempla comercialização de Licenciamento.
RN-CAT-02.4: A classificação Universal não substitui a classificação de Serviço ou Licenciamento. Os três toggles são independentes.
RN-CAT-03.1: O Catálogo pode possuir uma ou mais métricas comerciais.
RN-CAT-03.2: As métricas devem ser selecionadas a partir do cadastro de Métricas da MTI, sem utilização de texto livre.
RN-CAT-03.3: Para cada métrica relacionada ao Catálogo, deve ser informado o respectivo valor unitário.
RN-CAT-03.4: O valor unitário da métrica do Catálogo não substitui o valor unitário próprio do Produto.
RN-CAT-03.5: Somente métricas ativas devem estar disponíveis para novos relacionamentos.
RN-CAT-03.6: Não há tabela de complexidade/coeficientes no Catálogo. Essa parametrização fica no Produto (tipo Serviço).
RN-CAT-04.1: O Catálogo pode possuir Representante/Responsável.
RN-CAT-04.2: O Focal de Vendas deve ser mantido no Catálogo.
RN-CAT-04.3: O Focal de Pós-vendas deve ser mantido no Catálogo.
RN-CAT-04.4: A Unidade DTIC deve ser mantida no Catálogo.
RN-CAT-04.5: Essas informações devem ser herdadas ou exibidas no Produto quando necessário, sem novo preenchimento manual incompatível.
RN-CAT-05.1: Todo Produto deve estar relacionado a exatamente um Catálogo no momento do cadastro.
RN-CAT-05.2: O Catálogo deve existir antes do cadastro dos Produtos.
RN-CAT-05.3: Os Produtos podem ser cadastrados manualmente ou alimentados por CSV.
RN-CAT-05.4: O Catálogo pode ser criado sem Produtos e ter seus Produtos incluídos posteriormente.
RN-CAT-05.5: Ao selecionar o Catálogo no Produto, informações deriváveis como Parceria e Solução devem ser obtidas automaticamente.
RN-CAT-06.1: O sistema deve identificar a versão atual do Catálogo.
RN-CAT-06.2: Quando houver uma nova versão, a versão anterior deve permanecer disponível para consulta e rastreabilidade.
RN-CAT-06.3: Alterações em uma nova versão não devem sobrescrever informações históricas de versões anteriores.
RN-CAT-06.4: A utilização das versões em Contratos e demais fluxos posteriores deve respeitar as regras definidas na Fase 3.
RN-CAT-07.1: O Parceiro pode salvar e editar informações enquanto o cadastro estiver em rascunho.
RN-CAT-07.2: O Parceiro pode cadastrar Produtos e Grupos manualmente ou por CSV (CSV sem custo, markup e percentuais).
RN-CAT-07.3: Ao enviar para análise, o conteúdo enviado deve ficar indisponível para alteração pelo Parceiro enquanto aguarda parecer da MTI.
RN-CAT-07.4: A MTI pode Aprovar, Solicitar Ajuste ou Reprovar.
RN-CAT-07.5: Solicitação de Ajuste e Reprovação devem possuir justificativa.
RN-CAT-07.6: Em caso de Solicitação de Ajuste, o Parceiro pode corrigir e reenviar.
RN-CAT-07.7: Homologar e publicar são atos distintos. Publicação e apostila são responsabilidade da MTI. Publicar ≠ cliente ver.
RN-CAT-08.1: A integração automática com SIAG/Protheus não faz parte da implementação desta etapa.
RN-CAT-08.2: Os códigos poderão ser informados manualmente. Obrigatoriedade no cadastro: não. Obrigatórios no Contrato (Fase 3).
RN-CAT-09.1: A propriedade Universal pertence à configuração do Catálogo.
RN-CAT-09.2: A utilização do Catálogo nos níveis de contratação e o cálculo de fatores de conversão não fazem parte do cadastro desta classe.
RN-CAT-09.3: As regras de consumo, saldo, conversão e contrato serão tratadas nos respectivos fluxos posteriores (Fase 3).
RN-CAT-00.1: Catálogo exige Parceria e Solução.
RN-CAT-00.2: 1 linha de cardápio por Parceria+Solução, com versionamento.
RN-CAT-00.3: Parceria com N soluções >> até N catálogos.
RN-CAT-00.4: “Só um Ativo/Publicado por Parceria+Solução” = lacuna (validar MTI).
RN-G-CAT-01: A Fase 2 contempla a estrutura e manutenção de Catálogos e Produtos.
RN-G-CAT-02: A MTI mantém as configurações estruturais do Catálogo e realiza sua governança.
RN-G-CAT-03: O Parceiro monta o catálogo (rascunho) e cadastra Produtos/Grupos no contexto de suas Parcerias autorizadas.
RN-G-CAT-04: Produto e Catálogo são entidades distintas; todo Produto deve estar relacionado a um Catálogo.
RN-G-CAT-05: Licença e Serviço são tipos de Produto.
RN-G-CAT-06: As métricas do Catálogo devem utilizar o cadastro parametrizado de Métricas.
RN-G-CAT-07: Todo Produto possui seu próprio valor unitário.
RN-G-CAT-08: Regras de Contrato, apostilamento, saldo, OS e consumo pertencem aos fluxos posteriores (Fase 3).
campos:
Seção | Campo | Tipo | Obrig. | S. leitura | Regra
Identificação | Nome do Catálogo | Texto | Sim | Não | Nome do Catálogo
Identificação | Parceria | Referência | Sim | Não | Parceria à qual pertence
Identificação | Solução | Referência | Sim | Não | Filtrada conforme a Parceria
Identificação | Descrição | Texto | Não | Não | Descrição do escopo
Identificação | Versão atual | Texto | Sim | Sim* | Versão atualmente registrada; forma de geração ainda deve ser definida
Identificação | Versão anterior | Referência/Texto | Não | Sim | Preenchida quando houver versão anterior
Identificação | Ativo | Booleano | Sim | Não | Controla disponibilidade do Catálogo
Situação | Status do Catálogo | Lista | Sim | Sim | Controlado pelo workflow
Classificação | É Universal? | Booleano | Sim | Não | Indica característica Universal
Classificação | É Catálogo de Serviços? | Booleano | Sim | Não | Indica comercialização de Serviços
Classificação | É Catálogo de Licenciamento? | Booleano | Sim | Não | Indica comercialização de Licenciamento. Independente dos outros toggles.
Métricas | Métricas permitidas | Tabela incorporada | Não | Não | Métricas relacionadas ao Catálogo
↳ | Métrica | Referência | Sim | Não | Cadastro de Métrica
↳ | Valor unitário da Métrica | Número | Sim | Não | Valor da métrica no Catálogo
↳ | Ativo | Booleano | Sim | Não | Disponibilidade da relação
Códigos | Código SIAG – Catálogo | Texto | Não | Não | Manual nesta fase; obrigatório no Contrato (Fase 3)
Códigos | Código Protheus – Catálogo | Texto | Não | Não | Manual nesta fase; obrigatório no Contrato (Fase 3)
Responsáveis | Representante/Responsável | Referência | Não | Não | Responsável pelo Catálogo
Responsáveis | Focal de Vendas | Referência | Não | Não | Responsável comercial
Responsáveis | Focal de Pós-vendas | Referência | Não | Não | Responsável pós-venda
Responsáveis | Unidade DTIC | Referência | Não | Não | Unidade responsável
Produtos | Produtos | Relacionamento múltiplo | Não | Sim | Produtos pertencentes ao Catálogo
Observações | Observações | Texto | Não | Não | Informações complementares

classe 10: Produto
necessidade: Registrar o item comercializável, do tipo Licença ou Serviço, pertencente a um Catálogo da Parceria, contendo as informações necessárias para sua identificação, classificação, comercialização e posterior utilização nos processos de contratação. O Produto representa o nível mais detalhado do Catálogo e possui informações próprias, como nome, valor unitário, métrica, grupo e condições comerciais.
como é usado / contexto:
- O Produto é cadastrado no contexto de um Catálogo previamente existente.
- O Parceiro pode cadastrar Produtos pertencentes às suas Parcerias, manualmente ou por meio de CSV, e enviá-los para análise da MTI.
- A MTI também pode cadastrar Produtos pelo backoffice e é responsável por analisar os dados enviados, solicitar ajustes, aprovar ou reprovar.
- Ao selecionar o Catálogo, o sistema obtém automaticamente Parceria, Solução, versão e demais configurações aplicáveis.
- Tipo de Oferta (Universal | Individualizado) é herdado do Catálogo e fica somente leitura.
- Grupo é obrigatório. Part Number (SKU) é opcional.
- Complexidade, coeficiente, peso e quantidade da métrica ficam no Produto quando Tipo = Serviço; não dependem de tabela de complexidade no Catálogo.
- Focal de vendas, pós-vendas e DTIC não são editáveis no Produto; ficam no Catálogo.
- SIAG/Protheus do item são opcionais no cadastro; obrigatórios no Contrato (Fase 3).
- Regras de Contrato, saldo, OS, apostilamento e consumo pelo Cliente pertencem à Fase 3.
requisitos:
RF-PROD-01: Cadastrar Produto vinculado a um Catálogo: Permitir criar/editar o item no contexto de um Catálogo da parceria.
RF-PROD-02: Classificar tipo de produto (Licença | Serviço).
RF-PROD-03: Exibir tipo de oferta herdado do Catálogo (Universal | Individualizado), somente leitura.
RF-PROD-04: Informar comercialização (modelo de venda, cobrança, valor unitário, métrica).
RF-PROD-05: Condicionar Vertical, complexidade, coeficiente, peso e quantidade quando Tipo = Serviço.
RF-PROD-06: Exibir moeda universal quando o contexto for Universal (somente leitura; fator no consumo Fase 3).
RF-PROD-07: Permitir informar códigos SIAG/Protheus do item (opcionais no cadastro).
RF-PROD-08: Não cadastrar responsáveis no Produto; exibir/consultar os do Catálogo quando necessário.
RF-PROD-09: Participar do fluxo de análise do produto/catálogo.
RF-PROD-10: Informar identificação adicional (Nome, Part Number opcional, Grupo obrigatório, Vertical se Serviço, Descrição).
regras:
RN-PROD-01.1: Todo produto pertence a exatamente um Catálogo (versão).
RN-PROD-01.2: O Catálogo é o primeiro campo do formulário.
RN-PROD-01.3: Parceria, Solução e versão do catálogo são obtidas do Catálogo (somente leitura).
RN-PROD-01.4: Cadastro por tela ou CSV no contexto do catálogo.
RN-PROD-02.1: Tipo = somente Licença ou Serviço.
RN-PROD-02.2: Não usar Tipos 1/2/3 como tipo de produto (isso é nível de contratação/consumo).
RN-PROD-02.3: Se Serviço: exibir Vertical, Complexidade, Coeficiente, Peso e Quantidade da métrica por execução, quando aplicável.
RN-PROD-02.4: Se Licença: ocultar Vertical, Complexidade, Coeficiente, Peso e Quantidade da métrica por execução.
RN-PROD-03.1: Tipo de Oferta é herdado do Catálogo (É Universal? = Sim → Universal; caso contrário → Individualizado) e fica somente leitura.
RN-PROD-03.2: Não misturar produtos Universal e Individualizado no mesmo catálogo.
RN-PROD-03.3: Não confundir Tipo de Oferta do Produto com o toggle É Universal? do Catálogo (são conceitos distintos, mas a herança vem desse toggle).
RN-PROD-04.1: Todo produto tem valor unitário próprio.
RN-PROD-04.2: Tipo de cobrança do produto: Mensal · Anual · Conforme homologação · Única.
RN-PROD-04.3: Sob demanda não é Tipo de cobrança; é consumo/crédito/OS.
RN-PROD-04.4: Se modelo de venda = Perpétuo, cobrança = Única.
RN-PROD-04.5: Métrica do produto deve ser selecionável entre as métricas permitidas do Catálogo; sem texto livre.
RN-PROD-04.6: Modelo de venda: Por Licença · Por Serviço · Por Pacote · Perpétuo · Por UST.
RN-PROD-05.1: Complexidade, coeficiente, peso e quantidade ficam no Produto (Serviço). Não há tabela de complexidade no Catálogo.
RN-PROD-05.2: Coeficiente pode ser somente leitura conforme a faixa de complexidade escolhida no item.
RN-PROD-05.3: Vertical de Serviço de TI é selecionada quando Tipo = Serviço.
RN-PROD-06.1: Valor da moeda universal aparece quando o contexto é Universal.
RN-PROD-06.2: No cadastro, o valor pode vir preenchido como 1 (somente leitura). Fator de conversão ocorre no consumo (Fase 3), não no cadastro.
RN-PROD-07.1: Produto pode ter códigos SIAG/Protheus do item.
RN-PROD-07.2: Integração automática adiada; preenchimento manual/planilha. Opcionais no cadastro; obrigatórios no Contrato (Fase 3).
RN-PROD-07.3: Não editar no Produto os códigos do Catálogo / Catálogo Universal.
RN-PROD-08.1: Focal de vendas, pós-vendas e Unidade DTIC não são editáveis no Produto.
RN-PROD-08.2: Ficam no Catálogo da parceria.
RN-PROD-09.1: Parceiro envia; enquanto MTI não parecer, não altera o enviado.
RN-PROD-09.2: MTI: solicitar ajuste / reprovar (com justificativa) / aprovar (homologar).
RN-PROD-09.3: Publicação e disponibilização ao cliente são da MTI; cliente consome após apostila (Fase 3).
RN-PROD-10.1: Nome do produto obrigatório.
RN-PROD-10.2: Part Number (SKU) opcional; não preencher automaticamente com o Nome.
RN-PROD-10.3: Grupo obrigatório; filtrado pela Parceria do Catálogo.
RN-PROD-10.4: Vertical de Serviço de TI quando Tipo = Serviço.
RN-G-P-01: Produto é N1; Catálogo da parceria N2; Universal N3.
RN-G-P-02: Licença e Serviço podem coexistir no mesmo catálogo, conforme toggles.
RN-G-P-03: Valor unitário sempre no Produto.
RN-G-P-04: Cobrança do item ≠ forma de consumo (OS/crédito).
RN-G-P-05: Campos condicionais dependem do Tipo de produto (Licença/Serviço) e do tipo de oferta herdado.
RN-G-P-06: Parceiro cadastra; MTI governa; Cliente consome.
RN-G-P-07: Sem integração SIAG/Protheus em tempo real nesta fase.
campos:
Campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra
Catálogo | reference | Sim | Não | Visível | Primeiro campo do cadastro. Controla herança de Parceria, Solução, versão, métricas permitidas e tipo de oferta.
Parceria | reference | Sim | Sim | Visível | Obtida automaticamente do Catálogo selecionado. Não permite seleção manual incompatível.
Solução | reference | Sim | Sim | Visível | Obtida automaticamente do Catálogo selecionado. Somente leitura.
Versão do catálogo | text | Sim | Sim | Visível | Versão do Catálogo em que o Produto será gravado. Herdada; somente leitura.
Nome do produto | text | Sim | Não | Visível | Nome comercial específico do item. Não copiar automaticamente para Part Number.
Part Number (SKU) | text | Não | Não | Visível | Opcional. Não copiar o Nome.
Tipo de produto | textOptions | Sim | Não | Visível | Somente Licença ou Serviço. Não usar Tipos 1/2/3 (níveis de contratação).
Tipo de oferta | textOptions | Sim | Sim | Visível | Universal ou Individualizado. Herdado do Catálogo; somente leitura.
Grupo | reference | Sim | Não | Visível | Obrigatório. Filtrado pela Parceria do Catálogo.
Vertical de Serviço de TI | reference | Não | Não | Condicional: Tipo = Serviço | Seleção da Vertical. Oculto para Licença.
Descrição do produto | text | Não | Não | Visível | Escopo, entrega e resultado esperado.
Modelo de venda | reference | Sim | Não | Visível | Por Licença · Por Serviço · Por Pacote · Perpétuo · Por UST.
Tipo de cobrança | reference | Sim | Não | Visível | Mensal · Anual · Conforme homologação · Única. Sob demanda não é tipo de cobrança. Perpétuo → Única.
Consumo por ordem de serviço? | boolean | Não | Não | Condicional: Tipo de oferta = Universal | Representa consumo sob demanda / via OS (créditos). Não misturar com Tipo de cobrança. Oculto se Individualizado.
Valor unitário | number | Sim | Não | Visível | Preço próprio do Produto (Licença ou Serviço).
Métrica | reference | Não | Não | Visível | Selecionar métrica. Opções filtradas pelas métricas do Catálogo. Sem texto livre.
Quantidade da métrica por execução | number | Não | Não | Condicional: Tipo = Serviço | Oculto para Licença.
Valor da moeda universal | number | Não | Sim | Condicional: Tipo de oferta = Universal | Aparece preenchido com 1 e somente leitura. Sem fator de conversão no cadastro (fator no consumo Fase 3).
Complexidade | textOptions | Não | Não | Condicional: Tipo = Serviço | Faixas no item (Muito Baixa… Muito Alta). Oculto para Licença. Não depende de tabela no Catálogo.
Coeficiente de complexidade | number | Não | Sim | Mesma condição da Complexidade | Somente leitura conforme faixa escolhida no item.
Peso | number | Não | Não | Condicional: Tipo = Serviço | Oculto para Licença.
Código SIAG - Item | text | Não | Não | Visível | Opcional no cadastro; obrigatório no Contrato (Fase 3). Manual/planilha nesta fase.
Código Protheus - Item | text | Não | Não | Visível | Opcional no cadastro; obrigatório no Contrato (Fase 3). Manual/planilha nesta fase.
Status do produto | textOptions | Sim | Sim | Visível | Gerado pelo workflow (Rascunho · Em análise · Ajuste solicitado · Reprovado · Homologado · Publicado · Substituído).
métodos:
Método | Tipo | Quando aparece | Descrição
Importar CSV | Botão | Lista de produtos | Carga de produtos no catálogo (sem custo/markup/%).
Exportar CSV | Botão | Lista de produtos | Extrai a planilha do catálogo.
Exportar PDF | Botão | Lista / detalhe | Gera PDF do conjunto.
Enviar para análise | Botão | Rascunho do parceiro | Trava a edição e envia à MTI.
Aprovar | Botão | Análise MTI | Homologa o envio.
Solicitar ajuste | Botão | Análise MTI | Devolve ao parceiro com justificativa.
Inativar | Botão | Produto ativo | Inativa sem perder histórico.

classe 11: Catálogo Universal
necessidade: Agregar créditos universais da MTI (N3) e apontar para Catálogos da parceria elegíveis. É redirecionador — não substitui o cardápio da parceria nem o Produto; não tem focais/responsáveis.
como é usado / contexto:
- Mantido pela MTI.
- Vincula só catálogos com É Universal? = Sim.
- Nem toda parceria entra no crédito universal.
- Hierarquia: Produto >> Catálogo da parceria >> Catálogo Universal.
- Focais/DTIC ficam no Catálogo da parceria.
- Fator de conversão só no consumo N3>>N2 (não no cadastro).
- Sob demanda = consumo via OS de créditos (não é Tipo de cobrança do Produto).
requisitos:
RF-UNI-01: Cadastrar e manter Catálogo Universal.
RF-UNI-02: Vincular Catálogos da parceria elegíveis.
RF-UNI-03: Sem focais no N3.
RF-UNI-04: Consumo e conversão ocorrem na Fase 3 (não no cadastro).
RF-UNI-05: Códigos e status.
RF-UNI-06: Relacionamento com métricas quando o N2 é universalizável.
regras:
RN-UNI-01.1: É o nível 3 (créditos / redirecionador).
RN-UNI-01.2: Identificador obrigatório.
RN-UNI-01.3: Poucos universais agregam muitos N2/N1.
RN-UNI-02.1: Só com É Universal? = Sim.
RN-UNI-02.2: Parceria sem capacidade universal não entra nesse crédito.
RN-UNI-02.3: Referencia catálogos; não substitui cardápio/produto.
RN-UNI-03.1: Sem focais, DTIC ou responsáveis nesta tela.
RN-UNI-03.2: Responsáveis no Catálogo da parceria apontado.
RN-UNI-04.1: Consumo de crédito >> OS (sob demanda).
RN-UNI-04.2: Fator no consumo N3>>N2; não no cadastro N3.
RN-UNI-04.3: Cobrança Mensal/Anual/Única permanece no Produto.
RN-UNI-05.1: SIAG/Protheus manuais; integração adiada.
RN-UNI-06.1: Relaciona-se a métricas de serviços (USN/UST/HST) quando o N2 é universalizável.
RN-UNI-06.2: Tipo 3 = crédito/universal — ≠ tipo de produto Licença/Serviço.
campos:
Campo | Tipo | Obrg | S. Leitura | Visibilidade | Regra
Identificador | text | Sim | Não | Visível | Nome do crédito/catálogo universal. Redirecionador — não é cardápio de itens.
Status do catálogo | textOptions | Sim | Não | Visível | Ativo · Homologado · Paralisado (protótipo). Semântica fina = lacuna.
Catálogos | reference (múltiplo) | Sim | Não | Visível | Catálogos da parceria elegíveis. Somente É Universal? = Sim. Sem focais neste formulário.
Código SIAG - Catálogo Universal | text | Não | Não | Visível | Manual/planilha nesta fase; integração adiada.
Código Protheus - Catálogo Universal | text | Não | Não | Visível | Manual/planilha; integração adiada.
Observações | text | Não | Não | Visível | Notas livres. Opcional.

classe 12: Portal do Parceiro - visão geral
necessidade: O parceiro monta o catálogo da parceria (rascunho), cadastra grupos e produtos, e envia à MTI, sem acessar o backoffice. Não publica e não apostila.
como é usado / contexto:
- Parceiro: monta catálogo rascunho; cadastra Grupos; alimenta produtos (tela e/ou CSV) >> envia.
- CSV do parceiro não inclui custo, markup nem percentuais de distribuição.
- MTI: analisa produtos/catálogo; define toggles Universal / Serviços / Licenciamento; homologa, publica e apostila.
- Cliente: só consome a versão apostilada (Fase 3).
regras:
RN-PARC-06: Parceiro não publica / não apostila. Publicar ≠ cliente ver: liberação no portal do cliente é pela apostila no contrato.
seção tabela: Portal do Parceiro - Requisitos Funcionais consolidado
ID | Requisito
RF-PARC-01 | Salvar rascunho no escopo da própria parceria (catálogo/produtos — não criar a classe Parceria)
RF-PARC-02 | Incluir produtos manualmente ou por CSV (sem custo/markup/%)
RF-PARC-03 | Exportar CSV e PDF
RF-PARC-04 | Enviar à MTI e travar a edição
RF-PARC-05 | Corrigir após solicitação de ajuste
RF-PARC-06 | Status espelhado com o backoffice MTI
RF-PARC-07 | Visão planilha com filtros
RF-PARC-08 | Disponibilizar modelo de CSV (pode variar por parceria)
RF-PARC-09 | Fila de enviados e de ajustes
RF-PARC-10 | Justificativa da MTI em destaque
RF-PARC-11 | Novo rascunho após reprovação/paralisação
RF-PARC-12 | Histórico de status
RF-PARC-13 | Indicadores na home
RF-PARC-14 | Mensagem ao analista MTI
RF-PARC-15 | Cadastrar e manter Grupos no escopo das próprias Parcerias

classe 13: Portal do Cliente - visão geral
necessidade: Referência Fase 3 — o cliente consulta e consome o catálogo do contrato na versão apostilada, sem cadastrar catálogo nem produto. Não faz parte do escopo de cadastro da Fase 2.
como é usado / contexto:
- Parceiro: monta e envia produtos no catálogo da parceria.
- MTI: analisa, publica, versiona e apostila no contrato.
- Cliente (este portal): consome só a versão apostilada.
- Não cadastra catálogo nem produto.
requisitos:
RF-CLI-01: Consultar a versão apostilada do catálogo.
RF-CLI-02: Registrar demanda e receber/consultar orçamento.
RF-CLI-03: Distinguir OS, orçamento prévio e consumo (serviço: orçamento antes do consumo).
RF-CLI-04: Acompanhar demandas, orçamentos e OS.
RF-CLI-05: Não exibir versão nova do catálogo até o apostilamento.
RF-CLI-06: Cotação gera demanda - proposto.
RF-CLI-07: Aceitar ou recusar orçamento/proposta.
RF-CLI-08: Autorizar abertura/andamento da OS após aceite, quando aplicável.
RF-CLI-09: Consultar contratos vinculados ao cliente.
RF-CLI-10: Gravar snapshot da versão do catálogo na abertura de OS/orçamento.
RF-CLI-11: Listar itens do catálogo disponíveis na versão apostilada.
RF-CLI-12: Informar motivo ao recusar.
RF-CLI-13: Respeitar hierarquia (secretaria/unidade) no acesso e no saldo.
RF-CLI-14: Impedir cadastro de catálogo/produto pelo cliente.
RF-CLI-15: Abrir OS com origem Orçamento aceito ou Independente (licença pode dispensar orçamento).
RF-CLI-16: Em serviço, bloquear consumo/OS sem orçamento prévio.
RF-CLI-17: Exibir saldo global e por secretaria/unidade no contrato.
regras:
RN-CLI-01: Cliente cadastralmente é PJ; pessoas = responsáveis.
RN-CLI-02: Visibilidade do catálogo pela versão apostilada.
RN-CLI-03: OS e orçamento preservam a versão (snapshot).
RN-CLI-04: Rateio/segregação de saldo por secretaria/unidade no mesmo contrato.
RN-ORC-01: Serviço exige orçamento prévio antes do consumo.
RN-ORC-02: Em licenciamento, o orçamento pode ser dispensável.
RN-SNAP-01: Snapshot na abertura de OS/orçamento. Nova versão e apostila não reescrevem documentos já abertos; a nova versão vale para novos consumos.
RN-SNAP-02: Auditoria recupera catálogo/produtos a partir do snapshot.
RN-ESC-02: Cliente nunca cadastra catálogo nem produto.

classe 14: Backoffice MTI - análise e publicação
necessidade: Garantir que nada originado do parceiro entre em produção sem parecer da MTI.
como é usado / contexto:
- MTI: mantém listas, parcerias e soluções; analisa envios; habilita Universal?, Catálogo de serviços? e Catálogo de licenciamento? no catálogo da parceria; mantém o Catálogo Universal (redirecionador, sem focais); publica; apostila.
requisitos:
RF-MTI-01: Manter listas básicas, parcerias e soluções.
RF-MTI-02: Analisar envios (aprovar, solicitar ajuste ou reprovar).
RF-MTI-03: Publicar catálogo/produto já Homologado.
RF-MTI-04: Criar nova versão sem sobrescrever a anterior.
RF-MTI-05: Apostilar a versão no contrato do cliente.
RF-MTI-06: Paralisar catálogo/produto.
RF-MTI-07: Manter Catálogo Universal (sem focais).
RF-AN-01: Fila de itens aguardando análise.
RF-AN-02: Registrar a decisão do analista.
RF-AN-03: Exigir motivo em ajuste e reprovação.
regras:
- Homologar e publicar são atos distintos; publicar só após Homologado.
- Publicar ≠ cliente ver; liberação pela apostila.
- Toggles Universal?, Catálogo de serviços? e Catálogo de licenciamento? são da MTI no catálogo da parceria.
- Focais ficam no catálogo da parceria, não no universal.
- Fator Tipo 3: não é gate de cadastro/publicação do crédito universal; conversão ocorre no consumo (Fase 3).

classe 15: BPMN 1 - Cadastro base e criação dos Produtos (passos 1 a 4)
necessidade: Documentar o fluxo das listas básicas ao envio dos produtos para análise.
como é usado / contexto:
- Raias: MTI (backoffice) e Parceiro (portal).
- MTI — 1. Listas básicas: métrica, tipo de cobrança, Vertical de Serviço de TI, grupo, modelo de venda.
- MTI — 2. Parceria: nome, organização; ao salvar, gera Catálogo rascunho (casulo).
- MTI — 3. Solução: nome, parceria e descrição; Catálogo obtido automaticamente.
- Parceiro — 4. Monta catálogo, grupos e produtos no portal (tela ou CSV) e envia à MTI.
- Alternativa: MTI cadastra Produtos no backoffice, sem portal.
- Continua no BPMN 2: análise, publicação e apostila.

classe 16: BPMN 2 - Análise, publicação, apostila e Catálogo Universal (passos 5 a 9)
necessidade: Documentar o fluxo de análise até a disponibilização ao cliente.
como é usado / contexto:
- Raias: MTI (backoffice), Parceiro (portal) e Cliente (portal).
- Publicar não é a mesma coisa que o cliente ver.
- MTI — 5. Analisar: valores, métricas, CSV.
- MTI — 6. Homologar: parecer aprovado.
- MTI — 7. Publicar: vira Ativo e versionado.
- MTI — 8. Apostilar: no contrato.
- MTI — 9. Se elegível: apontar ao Catálogo Universal.
- Parceiro não publica e não apostila.

classe 17: BPMN 3 - Mapa de dependências entre as classes do Catálogo
necessidade: Documentar quem alimenta quem, da Organização até o Catálogo Universal.
como é usado / contexto:
- Etapa 1 — Listas básicas (MTI): Métrica (USN, UST, HST), Tipo de Cobrança, Vertical de Serviço de TI, Grupo, Modelo de Venda.
- Etapa 2 — Organização (empresa, CNPJ) → Parceria (acordo comercial) → Solução (oferta da parceria).
- A Parceria delimita o catálogo e os produtos; ao salvar, gera o casulo/rascunho.
- Catálogo da Parceria (N2) → Produtos (N1) → Catálogo Universal (N3), quando elegível.
- Dados de Parceria por Produto: custo, markup, período mínimo e % (fora do valor unitário do Produto).

classe 18: BPMN - Fluxo de Catálogo e Produtos, parte 1: rascunho, envio e análise
necessidade: Documentar o fluxo do cadastro base até a decisão sobre o envio do parceiro.
como é usado / contexto:
- Raias: Portal do Parceiro e Backoffice MTI.
- Portal do Parceiro: salvar rascunho; produtos manuais ou CSV (só a própria parceria); cadastrar grupos; exportar CSV/PDF; enviar à MTI (trava edição); corrigir e reenviar se ajuste solicitado.
- Backoffice MTI: analisar envio; solicitar ajuste / reprovar / homologar.

classe 19: BPMN - Fluxo de Catálogo e Produtos, parte 2: homologação, publicação, apostila e cliente
necessidade: Documentar homologação, publicação, apostila e consumo pelo cliente.
como é usado / contexto:
- Raias: Backoffice MTI e Portal do Cliente.
- Homologar, publicar e apostilar são atos diferentes.
- Backoffice MTI: habilitar toggles (Universal / Serviços / Licenciamento); confirmar focais e DTIC; publicar (Ativo publicado); apostilar no contrato.
- Portal do Cliente: consome só a versão apostilada (Fase 3).

classe 20: Tipo 1 - Item fechado
necessidade: Contratar um produto específico (licença ou serviço) identificado no contrato, sem saldo de catálogo e sem crédito universal. (Referência Fase 3 — o Tipo nasce no contrato, não no cadastro do produto.)
requisitos:
RF-T1-01: Vincular o objeto contratado a um produto específico do catálogo apostilado.
RF-T1-02: Restringir a abertura de OS/consumo ao item contratado.
regras:
RN-T1-01: Direito de consumo limitado ao item do contrato.
RN-T1-02: Sem saldo em moeda e sem aplicação de fator.
RN-T1-03: A versão do catálogo usada é a apostilada (snapshot na OS).
bloco: Contrata
Um produto específico (licença ou serviço), identificado no contrato.
bloco: Consome
Somente aquele item, na métrica do próprio produto.
bloco: Não usa
Saldo de catálogo (Tipo 2) nem crédito universal (Tipo 3).
bloco: Exemplo
Contrato: "Analista de requisitos - R$ X por execução". O cliente só consome esse serviço; não há saldo UST de catálogo.

classe 21: Tipo 2 - Saldo do catálogo
necessidade: Contratar moeda (USN, UST ou HST) ligada a um Catálogo da parceria e consumir produtos daquele catálogo debitando o saldo. (Referência Fase 3.)
requisitos:
RF-T2-01: Vincular o objeto contratado a um catálogo da parceria e à moeda (USN/UST/HST).
RF-T2-02: Controlar saldo do contrato e debitar por consumo, na métrica do produto.
RF-T2-03: Exibir saldo global e por secretaria/unidade.
regras:
RN-T2-01: Só consome produtos do catálogo contratado.
RN-T2-02: O débito usa a métrica do produto, sem fator de conversão.
RN-T2-03: Grupo é organização de listagem, não objeto contratual.
bloco: Contrata
Moeda (USN, UST ou HST) ligada a um Catálogo da parceria.
bloco: Consome
Produtos daquele catálogo, na métrica contratada, debitando o saldo.
bloco: Escopo
Grupo não é objeto do contrato — o vínculo é catálogo + moeda.
bloco: Exemplo
Contrato: "1.000 UST no Catálogo MTI Simplifica". O cliente abre OS de vários serviços Simplifica e cada uma desconta UST do saldo daquele catálogo.

classe 22: Tipo 3 (CGS) - Créditos universais
necessidade: Contratar créditos via Catálogo Universal e consumir produtos ativos com Universal = Sim de catálogos elegíveis, aplicando fator só no consumo. (Referência Fase 3.)
requisitos:
RF-T3-01: Vincular o objeto contratado a créditos no Catálogo Universal.
RF-T3-02: Listar apenas produtos ativos com Universal = Sim de catálogos elegíveis.
RF-T3-03: Calcular e exibir o fator de conversão no momento do consumo.
regras:
RN-T3-01: Elegibilidade = produto ativo + Universal = Sim + catálogo com É Universal? = Sim.
RN-T3-02: Métricas universais (USN/UST/HST) definem a moeda do fator.
RN-T3-03: Produto só Individualizado (Universal = Não) fica fora do Tipo 3.
RN-T3-04: O fator não é gate de cadastro nem de publicação do crédito universal.
bloco: Contrata
Créditos de TI e/ou de serviço, via Catálogo Universal (MTI Créditos - CGS).
bloco: Consome
Produtos ativos com Universal = Sim, pertencentes a catálogos elegíveis.
bloco: Fator
No consumo aplica-se o fator (crédito - produto). No cadastro do crédito universal, o fator não é aplicado.
bloco: Exemplo
Contrato: "Créditos de serviço MTI (Universal)". O cliente consome um produto Universal do Simplifica ou de outro catálogo elegível; o sistema converte crédito em produto pelo fator.

classe 23: Como se usa no dia a dia - exemplos
seção tabela: Como se usa no dia a dia - exemplos
Tipo | Contrato | Consumo no dia a dia
Tipo 1 | "Analista de requisitos - R$ X por execução" | Cliente consome somente esse serviço. Sem saldo UST de catálogo e sem fator.
Tipo 2 | "1.000 UST no Catálogo MTI Simplifica" | Cliente abre OS de vários serviços Simplifica; cada OS desconta UST do saldo daquele catálogo.
Tipo 3 (CGS) | "Créditos de serviço MTI (Universal)" | Cliente consome produto Universal do Simplifica ou de outro catálogo elegível; o sistema converte crédito em produto pelo fator.

classe 24: Fluxo ponta a ponta - do catálogo ao consumo
necessidade: Documentar o fluxo das três camadas: cadastro (Fase 2), contrato e consumo (Fase 3).
como é usado / contexto:
- Fase 2 — Catálogo: Produto (Licença/Serviço), métrica, Universal/Individualizado (herdado), catálogo e toggles (Universal / Serviços / Licenciamento).
- Contrato: objeto contratado = define o Tipo 1, 2 ou 3.
- Consumo (Fase 3): como o cliente gasta o que contratou.
- O Tipo nasce no contrato — nunca é escolhido no cadastro do produto.
- Tipo 1 — Item fechado: contrata um produto específico; consome somente aquele item.
- Tipo 2 — Saldo do catálogo: contrata moeda ligada ao catálogo; consome produtos debitando saldo.
- Tipo 3 (CGS) — Créditos universais: contrata créditos; consome produtos Universal elegíveis com fator no consumo.
