# Projeto Atlas — Matriz de Telas, Abas, Campos e Exemplos de Preenchimento

**Base:** documento `Atlas_Requisitos_Corrigido.docx` e ajustes analisados nas fontes do Projeto Atlas.

**Observação importante:** os exemplos abaixo são exemplos de preenchimento para protótipo e validação. Quando um dado real não estiver confirmado nas fontes, usei valor ilustrativo/fictício e mantive o campo como pendente ou condicional quando aplicável.

## Legenda

| Valor | Significado |
|---|---|
| Sim | Campo obrigatório conforme requisito/documento. |
| Não | Campo opcional. |
| Condicional | Obrigatório apenas em determinado contexto. |
| Pendente | Necessita validação com o cliente ou definição técnica. |

## 1. Matriz completa de campos

| Tela | Aba | Campo | Tipo | Obrigatório | Regra/Validação | Exemplo MTI | Exemplo Parceiro | Exemplo Cliente | Status |
|---|---|---|---|---|---|---|---|---|---|
| Organização | Dados da Organização | Tipo de Organização | Lista | Sim | Selecionar MTI, Parceiro ou Cliente. Parceiro e Cliente não são níveis organizacionais. | MTI | Parceiro | Cliente | Confirmado |
| Organização | Dados da Organização | Nome | Texto | Sim | Não pode ser vazio. | MTI — Empresa Mato-grossense de Tecnologia da Informação | EloGroup | SEPLAG | Confirmado |
| Organização | Dados da Organização | CNPJ | Texto | Pendente | Validar formato quando informado. Obrigatoriedade pendente. | 00.000.000/0000-00 | 00.000.000/0000-00 | 00.000.000/0000-00 | Pendente de validação |
| Organização | Dados da Organização | E-mail | Texto | Pendente | Validar formato quando informado. | contato@mti.mt.gov.br | contato@elogroup.com.br | contato@seplag.mt.gov.br | Pendente de validação |
| Organização | Dados da Organização | Ativo | Booleano | Sim | Organização inativa não deve ser utilizada em novos vínculos; manter histórico. | Sim | Sim | Sim | Confirmado |
| Organização | Dados da Organização | Dados de contato | Grupo | Pendente | Composição a validar; pode incluir telefone e endereço. | Telefone institucional e endereço da sede MTI | Telefone comercial e endereço da EloGroup | Telefone institucional e endereço da SEPLAG | Pendente de validação |
| Nível Organizacional | Dados do Nível | Nome | Texto | Sim | Não pode ser vazio; serve apenas para classificar Unidade Organizacional. | Diretoria | Gerência | Unidade | Confirmado |
| Nível Organizacional | Dados do Nível | Ativo/Inativo | Booleano | Pendente | Confirmar se a classe terá controle de situação. Não consta como campo confirmado. | Sim | Sim | Sim | Pendente de validação |
| Unidade Organizacional | Dados da Unidade | Organização | Referência | Sim | Deve referenciar Organização cadastrada. | MTI | EloGroup | SEPLAG | Confirmado |
| Unidade Organizacional | Dados da Unidade | Ativo | Booleano | Sim | Unidade inativa não deve ser usada em novos vínculos; manter histórico. | Sim | Sim | Sim | Confirmado |
| Unidade Organizacional | Dados da Unidade | Nome | Texto | Sim | Não pode ser vazio. | Diretoria de Relacionamento com Cliente | Gerência de Projetos | Unidade de Gestão de Contratos | Confirmado |
| Unidade Organizacional | Dados da Unidade | Sigla | Texto | Sim | Não pode ser vazia. | DIRC | GPROJ | UGC | Confirmado |
| Unidade Organizacional | Dados da Unidade | Unidade Pai | Referência | Não | Não pode referenciar a própria unidade nem gerar ciclo hierárquico. | MTI | EloGroup | SEPLAG | Confirmado |
| Unidade Organizacional | Dados da Unidade | Nível Organizacional | Referência | Sim | Deve referenciar nível cadastrado; classifica a unidade, não define hierarquia sozinho. | Diretoria | Gerência | Unidade | Confirmado |
| Unidade Organizacional | Dados da Unidade | Caminho | Texto calculado | Não | Gerado pelo sistema conforme Unidade Pai; não deve ser editado manualmente. | MTI > DIRC | EloGroup > Gerência de Projetos | SEPLAG > Unidade de Gestão de Contratos | Confirmado |
| Unidade Organizacional | Dados da Unidade | Dados adicionais | Grupo | Não | Campos adicionais opcionais conforme classe padrão existente. | Horário, telefone e endereço da DIRC | Horário, telefone e endereço da Gerência de Projetos | Horário, telefone e endereço da UGC | Confirmado/Pendente composição |
| Pessoa | Dados Pessoais | Nome | Texto | Sim | Não pode ser vazio. | Lucas Santos | Fernanda Iwasaka | João da Silva | Confirmado |
| Pessoa | Dados Pessoais | Foto | Arquivo imagem | Não | Formato permitido pelo sistema. | foto_lucas.png | foto_fernanda.png | foto_joao.png | Confirmado |
| Pessoa | Dados Pessoais | Data de nascimento | Data | Não | Não pode ser maior que a data atual. | 10/06/1995 | 15/03/1990 | 22/08/1985 | Confirmado |
| Pessoa | Documentos | Documentos | Lista | Não | CPF válido quando informado; pode conter CPF e outros documentos. | CPF: 000.000.000-00 | CPF: 111.111.111-11 | CPF: 222.222.222-22 | Confirmado |
| Pessoa | Contatos | Telefones | Lista | Não | Permitir múltiplos registros. | (65) 99999-0001 | (11) 99999-0002 | (65) 99999-0003 | Confirmado |
| Pessoa | Contatos | E-mails | Lista | Não | Validar formato e permitir múltiplos registros. | lucas@mti.mt.gov.br | fernanda@elogroup.com.br | joao@seplag.mt.gov.br | Confirmado |
| Pessoa | Endereços | Endereços | Lista | Não | Permitir múltiplos registros. | Endereço institucional MTI | Endereço comercial EloGroup | Endereço institucional SEPLAG | Confirmado |
| Pessoa | Acesso | Ativo para acesso | Booleano | Sim | Indica possibilidade de acesso; acesso operacional tratado em Servidor. | Sim | Sim | Sim | Confirmado |
| Pessoa | Complementares | Dados complementares | Grupo | Não | Conforme classe existente; disponibilidade dos campos deve ser verificada no ambiente compartilhado. | MT-ID e aceite de notificações | Código externo e anexos | Aceite de notificações e anexos | Pendente composição |
| Servidor | Dados Operacionais | Pessoa | Referência | Sim | Deve referenciar Pessoa cadastrada. Todo servidor possui pessoa. | Lucas Santos | Fernanda Iwasaka | João da Silva | Confirmado |
| Servidor | Dados Operacionais | Organização | Referência | Sim | Deve referenciar Organização cadastrada. | MTI | EloGroup | SEPLAG | Confirmado |
| Servidor | Dados Operacionais | Unidade de atuação | Referência | Condicional | Obrigatória quando a organização possuir unidade formal aplicável; para parceiro/cliente simples, pode ser não aplicável. | DIRC | Gerência de Projetos | Não aplicável ou Unidade de Gestão de Contratos | Ajustado como condicional |
| Servidor | Dados Operacionais | Cargo/Ocupação | Referência | Sim | Deve estar disponível para organização/unidade aplicável; não é pertencimento estrutural fixo da unidade. | Analista | Gerente de Projetos | Fiscal de Contrato | Confirmado |
| Servidor | Dados Operacionais | Ativo para acesso | Booleano | Sim | Servidor inativo não acessa backoffice nem atua em novos workflows. | Sim | Sim | Sim | Confirmado |
| Servidor | Dados Operacionais | Situação | Lista | Pendente | Opções a validar. | Ativo | Ativo | Ativo | Pendente de validação |
| Servidor | Dados Operacionais | Matrícula | Texto | Pendente | Obrigatoriedade a validar; aplicável principalmente à MTI. | MTI-123456 | ELG-7890 | SEPLAG-445566 | Pendente de validação |
| Cargo | Dados do Cargo | Organização | Referência | Sim | Cargo pertence à Organização. | MTI | EloGroup | SEPLAG | Confirmado |
| Cargo | Dados do Cargo | Nome do Cargo | Texto | Sim | Não pode ser vazio. | Diretor | Gerente de Projetos | Fiscal de Contrato | Confirmado |
| Cargo | Dados do Cargo | Sigla/Abreviatura | Texto | Sim | Não pode ser vazia. | DIR | GP | FISC | Confirmado |
| Cargo | Dados do Cargo | Função | Texto ou lista | Sim | Formato a validar; descreve/classifica a função. | Gestão da diretoria | Gestão de projetos do parceiro | Fiscalização de contrato | Confirmado/Pendente formato |
| Cargo | Dados do Cargo | Unidade relacionada | Referência | Condicional | Vínculo de atuação, não estrutural fixo; obrigatório para MTI quando aplicável, pendente para parceiro/cliente simples. | DIRC | Gerência de Projetos | Unidade de Gestão de Contratos ou não aplicável | Ajustado como condicional |
| Cargo | Dados do Cargo | Pode assinar | Booleano | Sim | Indica se participa de assinatura. | Sim | Sim | Sim | Confirmado |
| Cargo | Dados do Cargo | Papel na assinatura | Lista | Condicional | Obrigatório se Pode assinar = Sim; opções exatas pendentes. | Aprovador/Assinante | Assinante do parceiro | Assinante/Fiscal | Pendente opções |
| Cargo | Dados do Cargo | Região | Lista múltipla | Pendente | Permitir 26 estados + DF e opção Todos. Obrigatoriedade e default pendentes. | Todos | SP, RJ ou Todos | MT ou Todos | Confirmado formato/Pendente obrigatoriedade |
| Cargo | Dados do Cargo | Ativo | Booleano | Sim | Cargo inativo não entra em novos vínculos. | Sim | Sim | Sim | Confirmado |
| Cargo | Dados do Cargo | Observações | Texto longo | Não | Campo livre. | Cargo usado em fluxos da MTI | Cargo usado na parceria Simplifica | Cargo usado para fiscalização do contrato | Confirmado |
| Cargo | Dados do Cargo | Atribuição técnica | Referência técnica | Não | Gerada internamente quando necessário; não expor à MTI como regra de negócio. | DIR_DIRC_MTI | GP_ELOGROUP | FISC_SEPLAG | Interno |
| Cargo | Ocupantes | Pessoa/Servidor | Referência | Sim | Deve referenciar cadastro válido. | Lucas Santos | Fernanda Iwasaka | João da Silva | Confirmado |
| Cargo | Ocupantes | Unidade de atuação | Referência | Condicional | Unidade dentro da organização quando aplicável. | DIRC | Gerência de Projetos | Unidade de Gestão de Contratos ou não aplicável | Ajustado como condicional |
| Cargo | Ocupantes | Condição | Lista | Sim | Titular, Substituto ou Suplente; essencial para auditoria. | Titular | Suplente | Substituto | Confirmado |
| Cargo | Ocupantes | Data de início | Data | Pendente | Obrigatoriedade a validar. | 01/06/2026 | 01/06/2026 | 01/06/2026 | Pendente de validação |
| Cargo | Ocupantes | Data de fim | Data | Não | Deve ser posterior ao início quando informada. | 31/12/2026 | Não informado | 31/12/2026 | Confirmado |
| Cargo | Ocupantes | Ativo | Booleano | Sim | Ocupante inativo não atua em novos fluxos. | Sim | Sim | Sim | Confirmado |
| Cargo | Permissões de Visualização | Tipo de Processo | Referência | Sim | Deve referenciar Tipo de Processo cadastrado. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Cargo | Permissões de Visualização | Escopo de Visualização | Lista | Sim | Opções a validar: sua unidade, sua organização, todos. | Todos os processos da MTI ou por produto | Processos da sua organização | Processos vinculados ao cliente | Pendente opções |
| Cargo | Permissões de Visualização | Unidade/Organização de referência | Referência | Condicional | Obrigatório conforme escopo. | DIRC ou MTI | EloGroup | SEPLAG | Pendente conforme escopo |
| Cargo | Permissões de Visualização | Produto/Parceria | Referência | Pendente | Aplicável quando a visualização da MTI for controlada por produto/parceria. | Simplifica | Simplifica — parceria EloGroup | Contrato Simplifica SEPLAG | Pendente de validação |
| Cargo | Permissões de Visualização | Ativo | Booleano | Sim | Permissão inativa não se aplica a novos processos. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Versões | Nome | Texto | Sim | Não pode ser vazio. | Versão 1 — MTI | Versão 1 — Parceiros | Versão 1 — Clientes | Confirmado |
| Configurações do Processo | Versões | Vigente | Booleano | Sim | Apenas uma versão deve estar vigente por vez. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Versões | Ativo | Booleano | Sim | Versão inativa não entra em novos processos; mantém histórico. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Versões | Data de início | Data | Pendente | Obrigatoriedade a validar. | 01/06/2026 | 01/06/2026 | 01/06/2026 | Pendente de validação |
| Configurações do Processo | Versões | Data de fim | Data | Não | Deve ser posterior à data de início. | 31/12/2026 | 31/12/2026 | 31/12/2026 | Confirmado |
| Configurações do Processo | Tipos de Processo | Nome | Texto | Sim | Não pode ser vazio. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Configurações do Processo | Tipos de Processo | Ativo | Booleano | Sim | Tipo inativo não entra em novos fluxos. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Tipos de Processo | Descrição | Texto longo | Não | Campo livre. | Processo de proposta da MTI | Processo de contrato do parceiro | Processo de OS do cliente | Confirmado |
| Configurações do Processo | Ações | Tipo de Processo | Referência | Sim | Deve referenciar Tipo de Processo ativo. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Configurações do Processo | Ações | Nome da Ação | Texto | Sim | Não pode ser vazio. Base confirmada: Aprovar e Recusar. | Aprovar | Recusar | Aprovar | Confirmado |
| Configurações do Processo | Ações | Ativo | Booleano | Sim | Ação inativa não entra em novos fluxos. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Ações | Exige justificativa | Booleano | Condicional | Sim quando Ação = Recusar; mensagem e detalhe técnico a definir. | Não para Aprovar | Sim para Recusar | Não para Aprovar | Confirmado para Recusar |
| Configurações do Processo | Workflow de Assinatura | Nome | Texto | Sim | Não pode ser vazio. | Workflow de Proposta MTI | Workflow de Contrato Parceiro | Workflow de OS Cliente | Confirmado |
| Configurações do Processo | Workflow de Assinatura | Versão | Referência | Sim | Deve referenciar versão válida. | Versão 1 | Versão 1 | Versão 1 | Confirmado |
| Configurações do Processo | Workflow de Assinatura | Tipo de Processo | Referência | Sim | Deve referenciar tipo válido. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Configurações do Processo | Workflow de Assinatura | Ativo | Booleano | Sim | Workflow inativo não entra em novos processos. | Sim | Sim | Sim | Confirmado |
| Configurações do Processo | Etapas do Workflow | Ordem | Número | Sim | Deve indicar sequência. | 1 | 2 | 3 | Confirmado |
| Configurações do Processo | Etapas do Workflow | Organização | Referência | Sim | Necessário para identificar o cargo correto, pois cargo pertence à Organização. | MTI | EloGroup | SEPLAG | Confirmado |
| Configurações do Processo | Etapas do Workflow | Unidade Organizacional | Referência | Condicional | Obrigatória quando o fluxo exigir unidade formal; pendente cenário de unidade inteira sem cargo. | DIRC | Gerência de Projetos | Unidade de Gestão de Contratos ou não aplicável | Ajustado como condicional |
| Configurações do Processo | Etapas do Workflow | Cargo | Referência | Sim/Condicional | Obrigatório quando assinatura for por cargo; cenário de unidade inteira sem cargo está pendente. | Diretor | Gerente de Projetos | Fiscal de Contrato | Confirmado/Pendente unidade inteira |
| Configurações do Processo | Etapas do Workflow | Pessoa específica | Referência | Não | Quando informada, restringe atuação à pessoa/servidor. | Lucas Santos | Fernanda Iwasaka | João da Silva | Confirmado |
| Configurações do Processo | Etapas do Workflow | Ação | Referência | Sim | Deve ser compatível com o Tipo de Processo. | Aprovar | Recusar | Aprovar | Confirmado |
| Configurações do Processo | Etapas do Workflow | Ativo | Booleano | Sim | Etapa inativa não entra em novos fluxos. | Sim | Sim | Sim | Confirmado |
| Documentos e Templates | Templates | Tipo de Processo | Referência | Sim | Deve referenciar Tipo de Processo cadastrado. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Documentos e Templates | Templates | Nome do Template | Texto | Sim | Não pode ser vazio. | Template de Proposta MTI | Template de Contrato do Parceiro | Template de OS do Cliente | Confirmado |
| Documentos e Templates | Templates | Fundo da Página | Arquivo JPEG/PNG | Não | Formato JPEG ou PNG; aplicado por página do documento. | fundo_proposta_mti.png | fundo_contrato_parceiro.png | fundo_os_cliente.png | Confirmado |
| Documentos e Templates | Templates | Módulo de Texto | Texto/Bloco | Não | Conteúdo parametrizado do acervo de blocos reutilizáveis. | Bloco de objeto da proposta | Bloco de responsabilidades do parceiro | Bloco de demanda do cliente | Confirmado |
| Documentos e Templates | Templates | Módulo de Produtos | Referência | Não | Filtrado por parceria. | Produtos MTI Simplifica | Produtos da parceria EloGroup | Itens contratados pela SEPLAG | Confirmado |
| Documentos e Templates | Templates | Ordem do Bloco | Número | Sim | Número inteiro; define sequência dos blocos no documento. | 1 | 2 | 3 | Confirmado |
| Documentos e Templates | Templates | Blocos do Template | Lista | Pendente | Detalhamento a validar. | Objeto, produto, condições | Responsabilidades, produtos, valores | Demanda, itens, aceite | Pendente de validação |
| Documentos e Templates | Documentos Gerados | Documento Gerado | Arquivo/registro | Sim no processo | Deve estar vinculado ao processo. | Proposta_001.pdf | Contrato_Parceiro_001.pdf | OS_SEPLAG_001.pdf | Confirmado |
| Documentos e Templates | Assinaturas | Status de Assinatura | Lista | Pendente | Estados a validar. | Pendente | Assinado | Recusado | Pendente de validação |
| Documentos e Templates | Assinaturas | Arquivo Assinado | Arquivo | Condicional | Obrigatório no fluxo alternativo de assinatura externa/upload. | Proposta_001_assinada.pdf | Contrato_assinado.pdf | OS_assinada.pdf | Pendente técnico |
| Operação | Processos | Tipo de Processo | Referência | Sim | Deve existir no cadastro. | Proposta | Contrato | Ordem de Serviço | Confirmado |
| Operação | Processos | Versão | Referência | Sim | Associada na criação; não muda automaticamente. | Versão 1 | Versão 1 | Versão 1 | Confirmado |
| Operação | Processos | Status | Lista | Pendente | Estados a validar. | Em análise | Em assinatura | Aguardando ajuste | Pendente de validação |
| Operação | Processos | Documento | Referência/arquivo | Condicional | Obrigatório quando o processo exigir documento. | Proposta_001.pdf | Contrato_001.pdf | OS_001.pdf | Confirmado |
| Operação | Processos | Etapa Atual | Referência | Sim quando houver workflow | Deve refletir workflow. | Análise DIRC | Assinatura Parceiro | Aprovação Cliente | Confirmado |
| Operação | Processos | Responsável Atual | Referência calculada | Sim quando houver etapa | Cargo/unidade/pessoa quando aplicável. | Diretor DIRC | Gerente de Projetos — Fernanda | Fiscal de Contrato — João | Confirmado |
| Operação | Processos | Justificativa | Texto longo | Condicional | Obrigatória quando a ação for Recusar. | Ajustar escopo da proposta | Corrigir cláusula do contrato | Revisar itens da OS | Confirmado para Recusar |
| Operação | Minhas Pendências | Processo | Referência | Sim | Deve referenciar processo pendente para o usuário. | Proposta 001 | Contrato 001 | OS 001 | Confirmado |
| Operação | Minhas Pendências | Documento | Referência/arquivo | Condicional | Obrigatório quando a pendência envolver documento. | Proposta_001.pdf | Contrato_001.pdf | OS_001.pdf | Confirmado |
| Operação | Minhas Pendências | Ação pendente | Referência | Sim | Deve respeitar workflow, cargo, unidade, pessoa específica e condição. | Aprovar | Recusar | Aprovar | Confirmado |
| Operação | Minhas Pendências | Etapa | Referência | Sim | Deve indicar etapa de origem da pendência. | Etapa 1 — DIRC | Etapa 2 — Parceiro | Etapa 3 — Cliente | Confirmado |
| Operação | Minhas Pendências | Prazo | Data ou número | Pendente | Prazo de execução pendente de validação. | 5 dias | 3 dias | 7 dias | Pendente de validação |
| Operação | Minhas Pendências | Origem | Texto/Referência | Sim | Indicar tipo de processo e etapa. | Proposta — Análise | Contrato — Assinatura | OS — Aprovação | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Pessoa que executou | Referência | Sim | Deve ser registrada na ação. | Lucas Santos | Fernanda Iwasaka | João da Silva | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Servidor | Referência | Sim quando aplicável | Deve refletir acesso operacional. | Servidor Lucas | Servidor Fernanda | Servidor João | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Cargo | Referência | Sim | Cargo usado na ação. | Diretor | Gerente de Projetos | Fiscal de Contrato | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Condição no cargo | Lista | Sim quando aplicável | Titular, Substituto ou Suplente. | Titular | Suplente | Substituto | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Organização | Referência | Sim | Contexto organizacional. | MTI | EloGroup | SEPLAG | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Unidade | Referência | Sim quando aplicável | Unidade vigente na ação. | DIRC | Gerência de Projetos | Unidade de Gestão de Contratos | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Ação executada | Referência/texto | Sim | Ação realizada. | Aprovar | Recusar | Aprovar | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Processo | Referência | Sim | Processo relacionado. | Proposta 001 | Contrato 001 | OS 001 | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Documento | Referência/arquivo | Condicional | Obrigatório em assinatura ou ação documental. | Proposta_001.pdf | Contrato_001.pdf | OS_001.pdf | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Data e hora | Data/hora | Sim | Gerado pelo sistema. | 11/06/2026 10:00 | 11/06/2026 11:00 | 11/06/2026 12:00 | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Versão | Referência | Sim | Versão usada no processo. | Versão 1 | Versão 1 | Versão 1 | Confirmado |
| Auditoria | Histórico e Rastreabilidade | Justificativa | Texto longo | Condicional | Obrigatória em Recusar. | Ajustar documento antes de nova submissão | Revisar cláusula contratual | Corrigir item da OS | Confirmado para Recusar |

## 2. Resumo por tela e aba

| Tela | Abas/Seções |
|---|---|
| Organização | Dados da Organização |
| Nível Organizacional | Dados do Nível |
| Unidade Organizacional | Dados da Unidade |
| Pessoa | Acesso, Complementares, Contatos, Dados Pessoais, Documentos, Endereços |
| Servidor | Dados Operacionais |
| Cargo | Dados do Cargo, Ocupantes, Permissões de Visualização |
| Configurações do Processo | Ações, Etapas do Workflow, Tipos de Processo, Versões, Workflow de Assinatura |
| Documentos e Templates | Assinaturas, Documentos Gerados, Templates |
| Operação | Minhas Pendências, Processos |
| Auditoria | Histórico e Rastreabilidade |

## 3. Pontos pendentes refletidos na matriz

| Tela | Aba | Campo | Motivo |
|---|---|---|---|
| Organização | Dados da Organização | CNPJ | Validar formato quando informado. Obrigatoriedade pendente. |
| Organização | Dados da Organização | E-mail | Validar formato quando informado. |
| Organização | Dados da Organização | Dados de contato | Composição a validar; pode incluir telefone e endereço. |
| Nível Organizacional | Dados do Nível | Ativo/Inativo | Confirmar se a classe terá controle de situação. Não consta como campo confirmado. |
| Unidade Organizacional | Dados da Unidade | Dados adicionais | Campos adicionais opcionais conforme classe padrão existente. |
| Pessoa | Complementares | Dados complementares | Conforme classe existente; disponibilidade dos campos deve ser verificada no ambiente compartilhado. |
| Servidor | Dados Operacionais | Unidade de atuação | Obrigatória quando a organização possuir unidade formal aplicável; para parceiro/cliente simples, pode ser não aplicável. |
| Servidor | Dados Operacionais | Situação | Opções a validar. |
| Servidor | Dados Operacionais | Matrícula | Obrigatoriedade a validar; aplicável principalmente à MTI. |
| Cargo | Dados do Cargo | Função | Formato a validar; descreve/classifica a função. |
| Cargo | Dados do Cargo | Unidade relacionada | Vínculo de atuação, não estrutural fixo; obrigatório para MTI quando aplicável, pendente para parceiro/cliente simples. |
| Cargo | Dados do Cargo | Papel na assinatura | Obrigatório se Pode assinar = Sim; opções exatas pendentes. |
| Cargo | Dados do Cargo | Região | Permitir 26 estados + DF e opção Todos. Obrigatoriedade e default pendentes. |
| Cargo | Ocupantes | Unidade de atuação | Unidade dentro da organização quando aplicável. |
| Cargo | Ocupantes | Data de início | Obrigatoriedade a validar. |
| Cargo | Permissões de Visualização | Escopo de Visualização | Opções a validar: sua unidade, sua organização, todos. |
| Cargo | Permissões de Visualização | Unidade/Organização de referência | Obrigatório conforme escopo. |
| Cargo | Permissões de Visualização | Produto/Parceria | Aplicável quando a visualização da MTI for controlada por produto/parceria. |
| Configurações do Processo | Versões | Data de início | Obrigatoriedade a validar. |
| Configurações do Processo | Ações | Exige justificativa | Sim quando Ação = Recusar; mensagem e detalhe técnico a definir. |
| Configurações do Processo | Etapas do Workflow | Unidade Organizacional | Obrigatória quando o fluxo exigir unidade formal; pendente cenário de unidade inteira sem cargo. |
| Configurações do Processo | Etapas do Workflow | Cargo | Obrigatório quando assinatura for por cargo; cenário de unidade inteira sem cargo está pendente. |
| Documentos e Templates | Templates | Blocos do Template | Detalhamento a validar. |
| Documentos e Templates | Assinaturas | Status de Assinatura | Estados a validar. |
| Documentos e Templates | Assinaturas | Arquivo Assinado | Obrigatório no fluxo alternativo de assinatura externa/upload. |
| Operação | Processos | Status | Estados a validar. |
| Operação | Processos | Documento | Obrigatório quando o processo exigir documento. |
| Operação | Processos | Justificativa | Obrigatória quando a ação for Recusar. |
| Operação | Minhas Pendências | Documento | Obrigatório quando a pendência envolver documento. |
| Operação | Minhas Pendências | Prazo | Prazo de execução pendente de validação. |
| Auditoria | Histórico e Rastreabilidade | Documento | Obrigatório em assinatura ou ação documental. |
| Auditoria | Histórico e Rastreabilidade | Justificativa | Obrigatória em Recusar. |