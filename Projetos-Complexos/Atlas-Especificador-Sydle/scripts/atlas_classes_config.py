# -*- coding: utf-8 -*-
"""Narrativa/config das classes Atlas para geradores de documentacao (docx/pptx)."""

CONFIG = {
    "tipo-documento": {
        "form_id": "form-patlasv4-proto-tipo-documento",
        "out": "docs/entregaveis/docx/Atlas_TipoDocumento_Requisitos_Completo.docx",
        "titulo": "Classe Tipo de Documento — Fase 1",
        "historia": (
            "Como gestor de cadastro, quero definir os tipos de documento exigidos (CNPJ, "
            "certidões, habilitação) com regras de vencimento e alerta, para controlar a "
            "conformidade documental das organizações e pessoas."
        ),
        "contexto": (
            "Os tipos de documento formam o catálogo MIPP que alimenta a grade de documentos da "
            "Organização (habilitação do parceiro) e da Pessoa. Cada tipo define a que se aplica "
            "(Pessoa ou Organização), se é obrigatório para parceiro e como vence (automático pelo "
            "backend ou manual/recorrente). É um cadastro de apoio: não tem fluxo próprio, mas "
            "governa o que pode ser anexado e quando alertar sobre vencimento."
        ),
        "requisitos": [
            "Cadastrar tipos de documento com grupo (MIPP), nome e aplicação (Pessoa/Organização).",
            "Definir obrigatoriedade para parceiro e o modo de vencimento padrão.",
            "Configurar a antecedência do alerta de vencimento (ex.: 30, 15, 5, 0 dias).",
            "Controlar ativo/inativo do tipo.",
        ],
        "regras": [
            "Tipos inativos não aparecem em novos cadastros.",
            "O alerta de vencimento é disparado pelo backend (verificação diária) conforme a antecedência configurada.",
            "Modo automático: o backend lê a data no arquivo; manual/recorrente: o operador define.",
            "Todos os tipos MIPP são obrigatórios para o parceiro habilitado.",
        ],
        "embed_titles": {},
        "canonical": ["patlasv4proto-p-tdoc-mipp-01", "patlasv4proto-p-tdoc-mipp-02", "patlasv4proto-p-tdoc-mipp-03"],
        "metodos_nota": (
            "Não possui métodos próprios. É um cadastro de apoio consumido pela grade de documentos "
            "de habilitação da Organização e da Pessoa."
        ),
        "fluxo": (
            "Fluxo típico: cadastrar o tipo (grupo MIPP, nome, aplicação) → marcar se é obrigatório "
            "para parceiro → definir o modo de vencimento e a antecedência do alerta → manter ativo. "
            "A partir daí, o tipo fica disponível na grade de documentos da Organização/Pessoa e o "
            "backend passa a alertar conforme o vencimento."
        ),
    },
    "versoes-processo": {
        "form_id": "form-patlasv4-proto-config-processo",
        "out": "docs/entregaveis/docx/Atlas_VersoesProcesso_Requisitos_Completo.docx",
        "titulo": "Classe Versões de Processo — Fase 1",
        "historia": (
            "Como analista de processos, quero versionar a configuração dos tipos de processo, "
            "para evoluir os fluxos sem quebrar instâncias em andamento."
        ),
        "contexto": (
            "A Versão de Processo controla a vigência das configurações (tipos de processo e ações "
            "habilitadas). Apenas uma versão fica vigente por vez e só ela inicia novos processos. "
            "Instâncias iniciadas em uma versão permanecem nela até concluírem, garantindo que "
            "mudanças futuras não afetem o que já está em andamento."
        ),
        "requisitos": [
            "Manter versões com vigência (datas), situação vigente/ativa e tipo de processo.",
            "Indicar os tipos de processo cobertos pela versão (Demanda, Proposta, OS, Projetos).",
            "Controlar qual versão é a vigente.",
        ],
        "regras": [
            "Apenas uma versão vigente por vez; só a vigente inicia novos processos.",
            "Versão inativa não é usada em novos processos, mas permanece no histórico.",
            "A data de fim deve ser posterior à data de início.",
            "Instâncias mantêm a versão com que foram abertas.",
        ],
        "embed_titles": {},
        "canonical": [
            "patlasv4proto-p-configuracoes-do-processo-mti",
            "patlasv4proto-p-configuracoes-do-processo-parceiro",
            "patlasv4proto-p-configuracoes-do-processo-cliente",
        ],
        "metodos_nota": "Não possui métodos próprios — é um cadastro de configuração/versionamento.",
        "fluxo": (
            "Fluxo típico: criar a versão com nome e tipo(s) de processo → definir vigência e marcar "
            "como Vigente → a partir daí, novos processos abrem nessa versão; ao publicar uma nova "
            "versão, a anterior deixa de iniciar processos, mas continua válida para as instâncias "
            "já abertas."
        ),
    },
    "template": {
        "form_id": "form-patlasv4-proto-template",
        "out": "docs/entregaveis/docx/Atlas_Template_Requisitos_Completo.docx",
        "titulo": "Classe Template documental — Fase 1",
        "historia": (
            "Como gestor documental, quero montar modelos de documento por blocos parametrizáveis "
            "com plano de fundo, para gerar propostas e contratos padronizados."
        ),
        "contexto": (
            "O Template organiza o documento em blocos ordenados (texto, tabela de produtos, imagem, "
            "separador, dados do sistema), com plano de fundo institucional. O conteúdo usa "
            "variáveis substituídas pelos dados reais na geração. O template tem versão e status: "
            "nasce em Rascunho e só gera documentos depois de Publicado/Homologado. A aplicação da "
            "alteração define se uma mudança afeta documentos em andamento ou apenas novas versões."
        ),
        "requisitos": [
            "Montar o documento por blocos ordenados, com blocos editáveis ou fixos na geração.",
            "Versionar o template e publicar versões.",
            "Definir se uma alteração afeta documentos em andamento ou apenas novas versões.",
            "Associar tipo de processo, parceria, plano de fundo e workflow de homologação.",
        ],
        "regras": [
            "Só versões Homologadas/Publicadas geram documentos.",
            "O template nasce em Rascunho; o número da versão é automático.",
            "A 'Aplicação da alteração' define se a mudança atinge processos em andamento ou só novos.",
            "Os blocos de produtos usam tabela de texto na Fase 1; itens vêm do catálogo homologado (Fase 1).",
        ],
        "embed_titles": {},
        "canonical": ["patlasv4proto-p-template-mti", "patlasv4proto-p-template-parceiro", "patlasv4proto-p-template-cliente"],
        "fluxo": (
            "Fluxo típico: criar o template (nome, tipo de processo, parceria) → montar os blocos "
            "ordenados e o plano de fundo → definir a aplicação da alteração → usar Publicar versão "
            "para sair do Rascunho (vira Homologado), liberando a geração de documentos."
        ),
    },
    "modelo-contrato": {
        "form_id": "form-patlasv4-proto-modelo-contrato",
        "out": "docs/entregaveis/docx/Atlas_ModeloContrato_Requisitos_Completo.docx",
        "titulo": "Classe Modelo de Contrato — Fase 1",
        "historia": (
            "Como gestor de contratos, quero modelos por parceria vinculados a template e workflow "
            "de assinatura, para formalizar propostas aprovadas de forma padronizada."
        ),
        "contexto": (
            "O Modelo de Contrato associa um template documental e um workflow de assinatura padrão "
            "a uma parceria/organização. Quando um contrato é gerado a partir de uma proposta "
            "aprovada, o modelo define o documento e o fluxo de assinatura aplicados por padrão."
        ),
        "requisitos": [
            "Cadastrar modelos por parceria com template e workflow padrão.",
            "Controlar ativo/inativo do modelo.",
        ],
        "regras": [
            "O contrato é gerado a partir de proposta aprovada/assinada.",
            "O modelo define o template e o workflow de assinatura aplicados por padrão.",
        ],
        "embed_titles": {},
        "canonical": ["patlasv4proto-p-mct-padrao-mti", "patlasv4proto-p-mct-parceiro", "patlasv4proto-p-mct-cliente"],
        "metodos_nota": "Não possui métodos próprios — é um cadastro de configuração usado na geração do contrato.",
        "fluxo": (
            "Fluxo típico: cadastrar o modelo (nome, parceria) → vincular o template documental e o "
            "workflow de assinatura padrão → manter ativo. Ao gerar um contrato dessa parceria, o "
            "modelo é aplicado automaticamente."
        ),
    },
    "dossie": {
        "form_id": "form-patlasv4-proto-dossie-entrega-valor",
        "out": "docs/entregaveis/docx/Atlas_DossieEntregaValor_Requisitos_Completo.docx",
        "titulo": "Classe Dossiê da Entrega de Valor — Fase 1",
        "historia": (
            "Como UGEPV, quero registrar a entrega de valor ao cliente/cidadão, acompanhando "
            "homologação, divulgação e monitoramento, em paralelo à execução técnica."
        ),
        "contexto": (
            "O Dossiê acompanha o resultado de negócio (outcome), não o output técnico. É uma tela "
            "única com cabeçalho fixo (Nome, Cliente, Status e TTFV) e cinco abas que avançam por "
            "status com travas: Em Entrega → Entregue → Para Divulgação → Divulgado → Em "
            "Monitoramento. Os dados de contrato/OS são consultados em modo leitura. Cada etapa só "
            "libera a próxima após ser preenchida; a reprovação na UGEPV devolve para 'Em Entrega' "
            "com justificativa registrada na timeline."
        ),
        "requisitos": [
            "Registrar dados técnicos (DTIC) e KPIs de resultado da entrega.",
            "Registrar a auditoria de pós-venda (UGEPV) e a divulgação institucional (ASCOM).",
            "Monitorar mensalmente com aferições e planos de ação.",
            "Manter timeline de marcos e trilha de transições de status.",
        ],
        "regras": [
            "Cada etapa só libera a próxima após ser preenchida (travas por status).",
            "A reprovação na UGEPV devolve para 'Em Entrega' com justificativa na timeline.",
            "O status avança por ações (somente leitura no campo de status).",
            "Contrato e OS são consultados em modo leitura (a fonte é o fluxo comercial).",
        ],
        "embed_titles": {},
        "canonical": [
            "patlasv4proto-p-ev-em-entrega",
            "patlasv4proto-p-ev-entregue",
            "patlasv4proto-p-ev-monitoramento",
        ],
        "fluxo": (
            "Fluxo típico: a DTIC preenche os dados técnicos e os KPIs e usa Registrar entrega "
            "(Em Entrega → Entregue) → a UGEPV faz a auditoria de pós-venda e Enviar para divulgação "
            "→ a ASCOM registra a divulgação (Registrar divulgação) → Iniciar monitoramento abre o "
            "ciclo mensal de aferições e planos de ação. Em caso de gap, Devolver para Em Entrega "
            "retorna o dossiê com justificativa."
        ),
    },
    "notificacao": {
        "form_id": "form-patlasv4-proto-notificacao",
        "out": "docs/entregaveis/docx/Atlas_Notificacao_Requisitos_Completo.docx",
        "titulo": "Classe Notificação — Fase 1",
        "historia": (
            "Como administrador, quero configurar regras de notificação — quando um evento "
            "ocorre numa entidade, avisar determinados destinatários por um canal — para manter "
            "parceiros e equipe informados de vencimentos, assinaturas, etapas e prazos."
        ),
        "contexto": (
            "A Notificação é uma regra configurável (não um envio único). Cada regra define a "
            "entidade (Organização, Pessoa, Documento, Proposta, Assinatura, Dossiê...), o gatilho "
            "(evento ou data), os canais (Interna, E-mail, Painel) e os destinatários, montados em "
            "cascata. A cascata muda conforme o tipo de destinatário (Organização, Pessoa ou Cargo) "
            "e sempre termina no e-mail de destino. Gatilhos por data usam a antecedência "
            "configurada e a verificação diária do backend (ex.: avisar 30, 15, 5 e 0 dias antes "
            "do vencimento de um documento)."
        ),
        "requisitos": [
            "Cadastrar regras com nome, entidade, gatilho, antecedência (para datas) e canais.",
            "Definir título e corpo da mensagem, com variáveis do registro de origem, e anexo opcional.",
            "Montar a lista de destinatários em cascata, permitindo mais de um por regra.",
            "Ativar/desativar regras sem excluí-las.",
            "Disparar pelos canais escolhidos (central interna, painel e/ou e-mail).",
        ],
        "regras": [
            "Regras inativas não disparam.",
            "Para gatilhos por data, o disparo segue a antecedência configurada (ex.: 30,15,5,0).",
            "A cascata de destinatário sempre termina no e-mail de destino.",
            "Com destinatário do tipo Organização: aparecem Perfil, Organização, Unidade e o e-mail do responsável.",
            "Com destinatário do tipo Pessoa: aparecem Perfil e a Pessoa (filtrada pelo perfil).",
            "Com destinatário do tipo Cargo: aparecem Organização, Unidade, Cargo, Perfil, Condição e Região.",
            "Os canais Interna e Painel usam a central de notificações; E-mail é envio externo.",
            "O título e o corpo aceitam variáveis (ex.: {{documento.tipo}}, {{dias}}).",
        ],
        "embed_titles": {
            "patlasv4proto-notif-destinatarios": "Destinatários (cascata até o e-mail)",
        },
        "canonical": [
            "patlasv4proto-p-notif-doc-vencendo",
            "patlasv4proto-p-notif-convite-aprovado",
            "patlasv4proto-p-notif-enviado-assinatura",
        ],
        "metodos_nota": (
            "A Notificação não tem métodos de tela: é uma regra. O disparo é automático — eventos "
            "de negócio (ex.: aprovar convite, enviar para assinatura) e a verificação diária de "
            "datas (vencimentos/prazos) acionam as regras ativas e enviam pelos canais configurados."
        ),
        "fluxo": (
            "Fluxo típico: criar a regra com nome e Ativo = Sim → escolher a Entidade e o Gatilho "
            "→ se for por data, informar a antecedência (ex.: 30,15,5,0) → escolher os canais "
            "(Interna, E-mail, Painel) → escrever título e corpo com variáveis → adicionar um ou "
            "mais Destinatários em cascata até chegar no e-mail. A partir daí, o sistema dispara "
            "automaticamente quando o gatilho ocorre."
        ),
    },
    "organizacao": {
        "form_id": "form-patlasv4-proto-unidade-organizacional",
        "out": "docs/entregaveis/docx/Atlas_Organizacao_Requisitos_Completo.docx",
        "titulo": "Classe Organização (Unidade Organizacional) — Fase 1",
        "historia": (
            "Como gestor de cadastro da MTI, quero cadastrar e manter organizações e unidades "
            "(MTI, Parceiro e Cliente) com seus dados cadastrais, documentos de habilitação, "
            "tributos e contatos, para habilitar os fluxos comerciais e de assinatura e controlar "
            "a conformidade documental de cada parceiro."
        ),
        "contexto": (
            "O Cadastro Organizacional é a tela central da hierarquia do Atlas. A mesma tela atende "
            "MTI, Parceiro e Cliente — o tipo é apenas um qualificador. A estrutura é recursiva: uma "
            "unidade aponta para a unidade pai, e o caminho e o nível são calculados automaticamente. "
            "A organização raiz (campo Empresa = Sim) concentra dados fiscais, contas bancárias, "
            "documentos de habilitação (MIPP), tributos e o limite de usuários. Um parceiro só acessa "
            "propostas e catálogos depois de ter a habilitação documental completa e aprovada pela MTI. "
            "Não existe a classe \"Nível Organizacional\": a hierarquia usa unidade pai + caminho + nível "
            "calculado. O Cargo é ancorado ao nó raiz da organização e sobrevive a reestruturações."
        ),
        "requisitos": [
            "Cadastrar unidades dos três tipos (MTI, Parceiro, Cliente) com hierarquia por unidade pai e caminho único.",
            "Controlar ativo/inativo e substituição de unidades (reestruturação), com migração de cargos da unidade extinta.",
            "Manter, na organização raiz, dados de cadastro (razão social, inscrições, CNAE, natureza jurídica), contas bancárias, documentos de habilitação, tributos e contatos.",
            "Controlar a conformidade documental (grupos MIPP) com progresso por grupo e bloqueio de acesso comercial enquanto incompleta.",
            "Permitir selecionar grupos de documento e adicionar, de uma vez, todos os tipos exigidos à grade de habilitação.",
            "Gerar convites de autocadastro e cadastrar cargos a partir da própria organização.",
            "Exibir, em modo leitura, os cargos e as pessoas vinculados à organização.",
            "Configurar os módulos visíveis da unidade, que definem (junto com o cargo) a permissão efetiva.",
        ],
        "regras": [
            "Empresa = Sim indica organização raiz e oculta a Unidade pai, o Caminho e o Nível.",
            "O caminho é gerado automaticamente pela cadeia de siglas (ex.: MTI, MTI/DIRC); o nível começa em 0 na raiz.",
            "O campo Poder é obrigatório quando o tipo é Cliente.",
            "Dados fiscais, contas bancárias, documentos MIPP, tributos, logo e documentos de execução só aparecem na organização raiz (Empresa = Sim).",
            "O acompanhamento da habilitação (status, progressos por grupo e bloqueio comercial) só aparece para organizações do tipo Parceiro.",
            "Parceiro com habilitação documental incompleta fica com acesso comercial bloqueado (sem proposta/catálogo).",
            "A data de vencimento de documentos pode ser preenchida automaticamente pelo backend (leitura do arquivo) ou manualmente (recorrência) e dispara notificação de vencimento.",
            "A seleção de módulos visíveis é livre por unidade — a unidade-filha não herda automaticamente os módulos da unidade-mãe.",
            "A permissão efetiva de uma pessoa é o cruzamento entre os módulos visíveis da unidade e os módulos do cargo (ou acesso total se o cargo for Administrador).",
            "Quando a unidade é desativada e tem uma unidade substituta indicada, usa-se o método Migrar cargos para transferir os cargos para a unidade nova.",
        ],
        "embed_titles": {
            "patlasv4proto-uo-contas-bancarias": "Contas bancárias",
            "patlasv4proto-uo-documentos": "Documentos de habilitação (MIPP)",
            "patlasv4proto-uo-docs-execucao": "Documentos de execução da parceria",
            "mqmdvi11ofo8m3": "Tributos e Encargos",
            "patlasv4proto-uo-contato-emails": "E-mails",
            "patlasv4proto-uo-contato-telefones": "Telefones",
            "patlasv4proto-uo-contato-enderecos": "Endereços",
            "patlasv4proto-uo-contato-redes-sociais": "Redes sociais",
            "patlasv4proto-uo-cargos-atribuidos": "Cargos atribuídos (somente leitura)",
            "patlasv4proto-uo-pessoas-nos-cargos": "Pessoas nos cargos (somente leitura)",
            "patlasv4proto-uo-convites": "Convites de cadastro",
        },
        "canonical": [
            "patlasv4proto-p-unidade-organizacional-mti",
            "patlasv4proto-p-unidade-organizacional-parceiro",
            "patlasv4proto-p-unidade-organizacional-cliente",
        ],
        "fluxo": (
            "Fluxo típico: cadastrar a organização raiz (Empresa = Sim) → preencher dados de "
            "cadastro, contas e tributos → no caso de Parceiro, selecionar os grupos de documento "
            "e usar a ação \"Adicionar à grade MIPP\" → anexar e validar os documentos → "
            "acompanhar o status até \"Aprovada pela MTI\" → cadastrar cargos e gerar convites "
            "para os colaboradores."
        ),
    },
    "convite": {
        "form_id": "form-patlasv4-proto-convite-cadastro",
        "out": "docs/entregaveis/docx/Atlas_CadastroBase_Convite_Vinculo_Requisitos_Completo.docx",
        "titulo": "Cadastro Base — Convite, Portal e Vínculo (processo de autocadastro) — Fase 1",
        "historia": (
            "Como gestor de uma organização (parceiro/cliente), quero pré-cadastrar o CPF do "
            "colaborador e que ele acesse o Atlas pelo MT Login ou Gov.br, aprovando o vínculo, "
            "para que novos colaboradores entrem de forma controlada e com identidade verificada."
        ),
        "contexto": (
            "Há duas formas de cadastro de pessoas externas. FORMA PRIMÁRIA (implementada na F1): a "
            "MTI usa a ação Pré-cadastrar acesso (CPF) na Organização, informando o CPF da pessoa "
            "vinculado àquela organização; a pessoa acessa o Portal do Parceiro e entra pelo MT "
            "Login ou Gov.br — o CPF retornado é verificado contra o pré-cadastro e o sistema mostra "
            "a organização à qual ela está vinculada. Os dados pessoais vêm do provedor (somente "
            "leitura); não há senha no Atlas. Ao confirmar, gera-se uma Solicitação de vínculo "
            "(Pendente) para o gestor Confirmar ou Recusar. FORMA SECUNDÁRIA (BACKLOG): convite por "
            "código/link gerado na Organização, com quantidade de usos e validade — não faz parte "
            "da entrega atual."
        ),
        "requisitos": [
            "Gerar convite com código e link, definindo quantidade de usos e data de expiração, com o CPF do colaborador cadastrado pela MTI.",
            "Exibir, na organização, o histórico de convites e o convite ativo, com usos realizados e validade.",
            "Validar o código no Portal (válido, expirado ou já utilizado).",
            "Autenticar o colaborador via MT Login ou Gov.br com o CPF cadastrado pela MTI (dados do provedor são somente leitura).",
            "Concluir o autocadastro (sem senha no Atlas) ou cancelar sem consumir o convite.",
            "Registrar a solicitação de vínculo e permitir ao gestor confirmar ou recusar.",
            "Consumir um uso do convite a cada cadastro confirmado e desativar o convite anterior quando um novo é gerado.",
        ],
        "regras": [
            "A data de expiração do convite deve ser futura; convite inativo ou expirado não aceita cadastros.",
            "Ao gerar um novo convite, o convite anterior da organização é desativado.",
            "A quantidade de usos é validada contra o limite de usuários da organização; cada cadastro confirmado incrementa os usos realizados.",
            "Autenticação delegada ao MT Login ou Gov.br — nenhum dado é digitado no Atlas além do código de convite; o CPF já foi cadastrado pela MTI.",
            "Os dados retornados pelo provedor (Nome, CPF, nascimento, estado civil, nome social, filiação, celular, e-mail, endereço, foto) são somente leitura; não há senha no Atlas.",
            "Cancelar o autocadastro não consome o convite.",
            "A Solicitação de vínculo nasce com status Pendente e guarda o código de convite usado (rastreabilidade).",
            "Confirmar o vínculo cria a Pessoa vinculada à organização do convite; Recusar exige motivo.",
            "Os convites não são objetos pesquisáveis — são consultados pela organização que os gerou.",
        ],
        "embed_titles": {
            "patlasv4proto-mgc-convites-org": "Convites da organização (histórico)",
        },
        "canonical": ["patlasv4proto-p-convite-elogroup"],
        "metodos_nota": (
            "Este processo combina ações de três telas: na Organização, «Gerar Código de Convite» "
            "cria o link; no Portal do Parceiro, «Validar convite», «Confirmar cadastro» e "
            "«Cancelar» conduzem o autocadastro; na Solicitação de vínculo, «Confirmar Vínculo» e "
            "«Recusar» fecham a aprovação do gestor. As telas e ações estão detalhadas na seção "
            "\"Telas relacionadas\"."
        ),
        "anexos_forms": [
            {
                "form_id": "form-patlasv4-proto-metodo-precadastro-acesso",
                "titulo": "Ação: Pré-cadastrar acesso (CPF) — fluxo primário",
                "intro": (
                    "Acionada na Organização. A MTI informa o CPF da pessoa e a organização de "
                    "vínculo; a pessoa depois acessa o Portal pelo MT Login/Gov.br com esse CPF."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-portal-parceiro",
                "titulo": "Portal do Parceiro (acesso do colaborador)",
                "intro": (
                    "Tela pública de acesso: a pessoa entra pelo MT Login / Gov.br; o CPF é "
                    "verificado contra o pré-cadastro da MTI e o sistema mostra a organização "
                    "vinculada. Dados do provedor somente leitura, sem senha no Atlas."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-solicitacao-vinculo",
                "titulo": "Solicitação de vínculo (aprovação do gestor)",
                "intro": (
                    "Inbox do gestor: cada acesso concluído gera uma solicitação pendente para "
                    "Confirmar ou Recusar o vínculo do colaborador com a organização."
                ),
            },
        ],
        "fluxo": (
            "Fluxo primário (ponta a ponta): na Organização, o gestor aciona Pré-cadastrar acesso "
            "(CPF) informando o CPF e a organização → a pessoa abre o Portal do Parceiro e Entra "
            "com MT Login ou Gov.br → o CPF retornado é verificado contra o pré-cadastro e o sistema "
            "mostra a organização vinculada (dados do provedor preenchidos, sem senha) → Confirma → "
            "é criada uma Solicitação de vínculo pendente → o gestor Confirma (ou Recusa com motivo) "
            "→ a Pessoa passa a existir vinculada à organização. O convite por código/link é backlog."
        ),
    },
    "assinatura": {
        "form_id": "mqebasqyphbwea",
        "out": "docs/entregaveis/docx/Atlas_Assinatura_Requisitos_Completo.docx",
        "titulo": "Assinatura — Workflow, Envelope e Painel — Fase 1",
        "historia": (
            "Como gestor, quero configurar fluxos de assinatura por cargo/unidade e enviar "
            "documentos para assinatura digital, e como signatário quero receber e dar parecer "
            "(aprovar/recusar) nos documentos pendentes, para formalizar propostas, contratos, "
            "ordens de serviço e termos com validade jurídica."
        ),
        "contexto": (
            "O Workflow de Assinatura define quem assina (por cargo/unidade) e por qual método. "
            "Ao enviar para assinatura, monta-se um Envelope que agrupa os documentos e vai para "
            "todos os signatários ao mesmo tempo (assinatura paralela). Casos como \"o presidente "
            "assina por último\" são operacionais — o presidente aguarda os demais; o sistema não "
            "ordena isso automaticamente. A recusa de qualquer signatário cancela o envelope "
            "inteiro (não existe assinatura parcial). Os métodos disponíveis são Certificado digital "
            "(token), Gov.br, Senha+MFA e MT Login/Sigadoc. O signatário "
            "acompanha e dá parecer no Painel de Assinaturas Pendentes."
        ),
        "requisitos": [
            "Configurar o fluxo por tipo de processo e versão, com etapas e signatários.",
            "Habilitar nas etapas apenas cargos ativos com \"Pode assinar\" = Sim.",
            "Montar o envelope com documentos do ambiente ou upload, definindo método, prazo e política de envio.",
            "Enviar para assinatura, recusar (com motivo) e selecionar o método ao assinar.",
            "Acompanhar as pendências do signatário no Painel, com prazo e status.",
            "Registrar o histórico de envelopes (número, código de integridade, status).",
        ],
        "regras": [
            "Apenas workflows ativos aparecem na ação Enviar para assinatura.",
            "A Versão é uma referência à Versão de Processo ativa (não um número livre).",
            "Signatários com a mesma Ordem são notificados simultaneamente (paralelo); ordens diferentes criam sequência entre grupos.",
            "Padrão da Fase 1: enviar para todos simultaneamente.",
            "A recusa de qualquer signatário cancela o envelope inteiro; reabrir exige novo PDF e novo envelope.",
            "Só cargos ativos com \"Pode assinar\" = Sim podem ser signatários.",
            "Métodos de assinatura: Certificado digital (token), Gov.br, Senha+MFA e MT Login/Sigadoc — senha sempre com MFA.",
            "Enquanto houver envelope ativo, o PDF do documento fica travado.",
            "Processos em andamento preservam a configuração de workflow original.",
            "No Painel, o signatário só pode Aprovar ou Recusar (recusa exige motivo).",
        ],
        "embed_titles": {
            "patlasv4proto-wf-etapas": "Etapas do Workflow (signatários)",
        },
        "canonical": ["patlasv4proto-p-wf-proposta-mti"],
        "metodos_nota": (
            "As ações de assinatura são acionadas a partir das telas de processo (Proposta, "
            "Contrato, OS, Projeto) e do Painel: «Enviar para assinatura» cria o envelope e "
            "notifica todos os signatários ao mesmo tempo; «Recusar assinatura» cancela o "
            "envelope inteiro mediante motivo; «Selecionar método» habilita a assinatura por "
            "Certificado digital, Gov.br, Senha+MFA ou MT Login/Sigadoc após o Aprovar no Painel."
        ),
        "anexos_forms": [
            {
                "form_id": "form-patlasv4-proto-assinatura-documentos",
                "titulo": "Envelope de documentos (configuração da assinatura)",
                "intro": (
                    "O envelope agrupa os documentos enviados para assinatura. Organizado em abas: "
                    "Dados do envelope, Signatários, Política e prazos, Configuração da assinatura e Avançado."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-painel-assinaturas-pendentes",
                "titulo": "Painel de Assinaturas Pendentes (operação do signatário)",
                "intro": (
                    "Caixa de entrada pessoal do signatário: lista os documentos que aguardam a "
                    "sua assinatura, com prazo e status, e permite Abrir, Aprovar ou Recusar."
                ),
            },
        ],
        "fluxo": (
            "Fluxo típico: configurar o Workflow de Assinatura (tipo de processo, versão e etapas "
            "com os cargos signatários) → na tela do processo, acionar «Enviar para assinatura», "
            "que monta o Envelope e notifica todos ao mesmo tempo → cada signatário abre o "
            "documento no Painel e dá o parecer: ao Aprovar, escolhe o método (Certificado, Gov.br "
            "ou MT Login) e assina; ao Recusar, informa o motivo e o envelope é cancelado → "
            "concluídas todas as assinaturas, o documento fica assinado e imutável."
        ),
    },
    "cargo": {
        "form_id": "form-patlasv4-proto-cargo",
        "out": "docs/entregaveis/docx/Atlas_Cargo_Requisitos_Completo.docx",
        "titulo": "Classe Cargo — Fase 1",
        "historia": (
            "Como gestor, quero definir cargos por organização e unidade, com ocupantes, "
            "permissões e capacidade de assinar, para direcionar os fluxos de trabalho e as "
            "assinaturas por função (e não por pessoa fixa)."
        ),
        "contexto": (
            "O Cargo substitui a classe nativa \"Atribuição\" do SYDLE ONE (não exposta ao usuário) "
            "e fica ancorado ao nó raiz da organização, sobrevivendo a reestruturações. As pessoas "
            "são vinculadas ao cargo como ocupantes (titular, substituto ou suplente) e o ocupante "
            "herda a unidade do próprio cargo — não se escolhe unidade ao atribuir. A permissão "
            "efetiva resulta da combinação dos módulos do cargo com os módulos visíveis da unidade, "
            "ou é total quando o cargo é Administrador. O campo \"Pode assinar\" habilita o cargo nas "
            "etapas do Workflow de Assinatura, mas não autoriza assinatura automática."
        ),
        "requisitos": [
            "Cadastrar cargos com organização, unidade (caminho), perfil e situação ativa.",
            "Definir se o cargo pode assinar e qual o seu papel na assinatura.",
            "Definir permissões: Administrador (acesso total) ou Executor (módulos limitados).",
            "Gerir os ocupantes do cargo com condição, região de atuação e vigência.",
            "Preservar ocupações e histórico quando o cargo é inativado.",
        ],
        "regras": [
            "O ocupante referencia sempre um servidor ativo — nunca uma pessoa diretamente.",
            "Administrador = Sim dá acesso total e ignora o filtro hierárquico da unidade.",
            "Para executor, a permissão é a interseção entre os módulos do cargo e os módulos visíveis da unidade do cargo.",
            "O ocupante herda a unidade organizacional do cargo (não escolhe unidade no Atribuir cargo).",
            "Ocupante inativo não entra em roteamento nem em fluxos de trabalho.",
            "\"Pode assinar\" = Sim disponibiliza o cargo nas etapas de assinatura, mas não assina automaticamente.",
            "O papel na assinatura só aparece quando \"Pode assinar\" = Sim.",
            "Os módulos do executor só aparecem quando Administrador = Não.",
            "Cargo inativo some dos seletores, mas ocupações e histórico são preservados.",
            "Aprovar/Recusar são ações do fluxo, não permissões fixas do cargo.",
        ],
        "embed_titles": {
            "patlasv4proto-cargo-ocupantes-lista": "Ocupantes",
        },
        "canonical": [
            "patlasv4proto-p-cargo-mti",
            "patlasv4proto-p-cargo-parceiro",
            "patlasv4proto-p-cargo-cliente",
        ],
        "metodos_nota": (
            "A classe Cargo não tem métodos próprios na tela. O cargo é criado pela ação "
            "\"Cadastrar cargo\" da Organização (que já preenche organização, caminho da unidade e "
            "perfil) ou diretamente nesta tela. As pessoas são vinculadas pela ação \"Atribuir "
            "cargo\" da classe Pessoa."
        ),
        "fluxo": (
            "Fluxo típico: criar o cargo (pela Organização ou por esta tela) → definir organização, "
            "unidade, perfil e se Pode assinar → na aba Permissões, marcar Administrador ou escolher "
            "os Módulos do executor → na aba Ocupantes, vincular os servidores com condição "
            "(Titular/Substituto/Suplente), região de atuação e vigência."
        ),
    },
    "pessoa": {
        "form_id": "form-patlasv4-proto-pessoa",
        "out": "docs/entregaveis/docx/Atlas_Pessoa_Requisitos_Completo.docx",
        "titulo": "Classe Pessoa — Fase 1",
        "historia": (
            "Como RH/gestor, quero manter um cadastro único de pessoas (MTI, parceiro, cliente e "
            "interno) e alocá-las em cargos, para controlar credenciais, permissões e assinaturas, "
            "garantindo que cada indivíduo só acesse o sistema após receber um vínculo de cargo."
        ),
        "contexto": (
            "A Pessoa é o cadastro único de indivíduos do Atlas. Não existe cadastro separado de "
            "\"Cliente\": cliente é uma organização do tipo Cliente; a Pessoa representa o indivíduo. "
            "O acesso ao sistema só é habilitado após uma atribuição de cargo, que cria, nos "
            "bastidores, o Servidor e o Ocupante (a tela de Servidor não é exposta ao usuário). A "
            "profundidade do cadastro varia por perfil: a MTI usa o cadastro completo (inclusive "
            "currículo); parceiro e cliente preenchem principalmente dados de contato e cadastrais. "
            "A mesma tela exibe todas as abas para todos os perfis — não há versão simplificada."
        ),
        "requisitos": [
            "Cadastrar a pessoa com dados pessoais, documentos, filiação, informações demográficas e contatos.",
            "Habilitar acesso e credenciais (login, senha e token de certificado digital) após atribuição de cargo.",
            "Atribuir cargo definindo perfil, organização, matrícula (quando MTI), cargo, condição e região — a unidade vem do cargo.",
            "Registrar dados complementares (matrícula, MT-ID, preferências de notificação, dados de fornecedor e bancários).",
            "Manter o currículo (habilidades, experiências acadêmicas e profissionais).",
            "Permitir operações de desligamento e inativação de acesso pela ação Opções.",
        ],
        "regras": [
            "Não existe classe \"Cliente\" — cliente é uma organização do tipo Cliente; a Pessoa é o indivíduo.",
            "A pessoa só acessa fluxos de trabalho após ter ao menos um cargo atribuído ativo.",
            "Login e senha só aparecem quando \"Ativo para acesso\" = Sim.",
            "Os campos de fornecedor só aparecem quando \"É um fornecedor?\" = Sim.",
            "A matrícula é obrigatória para perfil MTI na atribuição de cargo.",
            "A unidade do vínculo é derivada do cargo (não é escolhida na atribuição).",
            "A senha é armazenada de forma protegida; a assinatura não usa senha simples (apenas certificado, Gov.br ou MT Login).",
            "A data de nascimento não pode ser futura; o Nome não pode ser vazio.",
        ],
        "embed_titles": {},
        "canonical": [
            "patlasv4proto-p-pessoa-bernardo",
            "patlasv4proto-p-pessoa-lucas",
            "patlasv4proto-p-pessoa-mti",
            "patlasv4proto-p-pessoa-parceiro",
        ],
        "fluxo": (
            "Fluxo típico: usar a ação Criar para cadastrar a pessoa com os dados mínimos "
            "(Nome, CPF, Carteira) → completar dados pessoais, documentos e contato → usar a ação "
            "Atribuir cargo (perfil → organização → cargo → condição → região), o que libera "
            "\"Ativo para acesso\" e cria o acesso nos bastidores → preencher login e senha. "
            "Para encerrar o vínculo, usar Opções (desligamento ou inativar acesso)."
        ),
    },
}
