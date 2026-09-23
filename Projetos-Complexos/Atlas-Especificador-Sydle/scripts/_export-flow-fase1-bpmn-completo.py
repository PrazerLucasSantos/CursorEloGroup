"""Gera o BPMN 2.0 completo do cadastro de Organização, Pessoa e Cargo."""
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "exports" / "fase-1-cadastro-organizacao.bpmn"
OUTPUT_COPY = ROOT / "exports" / "fase-1-cadastro-organizacao-completo.bpmn"

# Uma única colaboração: processo Atlas com raias dos perfis e provedor externo.
LANES = {
    "mti": ("lane_mti", "MTI — Analista de cadastro", 40, 250),
    "sistema": ("lane_sistema", "Sistema Atlas", 290, 250),
    "cliente": ("lane_cliente", "Cliente — Responsável da organização", 540, 250),
    "parceiro": ("lane_parceiro", "Parceiro — Responsável da organização", 790, 250),
}

# id, tipo BPMN, nome, raia, x, y, documentação
NODES = [
    ("start", "startEvent", "Solicitação de cadastro", "mti", 180, 120,
     "Início do cadastro de uma organização Cliente ou Parceiro pela MTI."),
    ("criar_org", "userTask", "Criar Organização", "mti", 300, 95,
     "Abrir a classe Organização. A MTI inicia o registro; não completa os dados que pertencem ao responsável externo."),
    ("dados_cadastro", "userTask", "Preencher Dados do Cadastro", "mti", 500, 95,
     "Preencher somente: Nome, Sigla, CNPJ quando conhecido, Tipo de organização (Cliente ou Parceiro), Código cliente/parceiro quando aplicável e Ativo."),
    ("info_adicionais", "userTask", "Preencher Informações Adicionais", "mti", 700, 95,
     "Informar Organização raiz, Tipo, Poder quando Cliente, Parcerias quando Parceiro, Responsável e observações necessárias."),
    ("gw_organizacao_raiz", "exclusiveGateway", "Organização raiz?", "sistema", 900, 355,
     "Decidir a hierarquia pelo campo Organização raiz. Sim cria o nível zero; Não exige uma Organização pai válida."),
    ("selecionar_organizacao_pai", "userTask", "Selecionar Organização pai", "mti", 1080, 95,
     "Obrigatória quando Organização raiz = Não. Selecionar uma organização/unidade ativa da mesma árvore institucional."),
    ("validar_organizacao_pai", "businessRuleTask", "Validar Organização pai", "sistema", 1280, 345,
     "Impedir autorreferência e ciclos; validar pai ativo, pertencimento à árvore e compatibilidade com o Tipo de organização."),
    ("gw_organizacao_pai_valida", "exclusiveGateway", "Organização pai válida?", "sistema", 1490, 355,
     "Se inválida, retornar à MTI. Se válida, calcular Nível e Caminho hierárquico."),
    ("corrigir_organizacao_pai", "userTask", "Corrigir Organização pai", "mti", 1470, 190,
     "Selecionar outro pai quando inativo, incompatível, igual à própria organização ou descendente dela."),
    ("calcular_hierarquia_raiz", "serviceTask", "Definir Nível 0 e Caminho = Sigla", "sistema", 1690, 305,
     "Para Organização raiz = Sim: limpar Organização pai, gravar Nível = 0 e Caminho hierárquico = Sigla."),
    ("calcular_hierarquia_filha", "serviceTask", "Calcular Nível e Caminho da filha", "sistema", 1690, 405,
     "Para Organização raiz = Não: Nível = Nível do pai + 1; Caminho = Caminho do pai / Sigla. Recalcular descendentes se a hierarquia mudar."),
    ("gw_hierarquia_concluida", "exclusiveGateway", "Hierarquia calculada", "sistema", 1900, 355,
     "Convergência dos caminhos raiz e filha antes de incluir as etapas documentais."),
    ("incluir_etapas", "userTask", "Incluir etapas de documentos", "mti", 900, 95,
     "Na seção Documentos, selecionar Etapas a incluir e acionar Adicionar. Grupos e tipos são copiados do catálogo Etapa documentacional."),
    ("salvar_org", "userTask", "Salvar Organização", "mti", 1100, 95,
     "A MTI salva após preencher apenas Dados do Cadastro, Informações Adicionais e Etapas de documentos."),
    ("validar_org_minima", "businessRuleTask", "Validar cadastro mínimo", "sistema", 1300, 345,
     "Validar Nome, Sigla, Tipo Cliente/Parceiro, Organização raiz, Responsável e ao menos uma etapa documental quando exigida."),
    ("gw_org_minima", "exclusiveGateway", "Cadastro mínimo válido?", "sistema", 1510, 355,
     "Se inválido, retornar à MTI com as pendências. Se válido, verificar o responsável."),
    ("mostrar_pendencias_mti", "serviceTask", "Exibir pendências à MTI", "sistema", 1490, 445,
     "Lista campos mínimos ausentes e impede a liberação do onboarding."),
    ("localizar_pessoa", "serviceTask", "Localizar Pessoa responsável", "sistema", 1700, 345,
     "Resolver a referência Responsável e localizar a Pessoa por identificador interno/CPF."),
    ("gw_pessoa_existe", "exclusiveGateway", "Pessoa existe e tem CPF?", "sistema", 1910, 355,
     "A Pessoa deve existir e possuir CPF para autenticação por MT Login ou Gov.br."),
    ("criar_pessoa", "userTask", "Criar/atualizar Pessoa", "mti", 2080, 95,
     "Cadastro mínimo: Nome, CPF em Documentos, Perfil Cliente/Parceiro e e-mail. Não criar senha local."),
    ("validar_perfil", "businessRuleTask", "Validar Perfil × Organização", "sistema", 2290, 345,
     "Perfil da Pessoa deve ser Cliente para organização Cliente ou Parceiro para organização Parceiro."),
    ("gw_perfil_compativel", "exclusiveGateway", "Perfil compatível?", "sistema", 2500, 355,
     "Divergência de perfil exige correção da Pessoa antes da liberação."),
    ("corrigir_pessoa", "userTask", "Corrigir Pessoa/CPF/Perfil", "mti", 2480, 190,
     "Corrigir CPF, Perfil e referência à Organização sem alterar a identidade autenticada."),
    ("verificar_vinculo", "businessRuleTask", "Verificar vínculo ativo", "sistema", 2690, 345,
     "A Pessoa responsável precisa estar vinculada à organização por ocupação ativa em um Cargo da mesma organização."),
    ("gw_vinculo", "exclusiveGateway", "Vínculo com a organização existe?", "sistema", 2900, 355,
     "Vínculo válido = Cargo ativo da organização + Pessoa como ocupante ativo + vigência válida."),
    ("selecionar_cargo", "userTask", "Criar ou selecionar Cargo", "mti", 3070, 55,
     "Informar Nome do Cargo, Sigla, Organização e Ativo. O Cargo deve pertencer à organização criada."),
    ("configurar_cargo", "userTask", "Configurar Cargo e permissões", "mti", 3270, 55,
     "Definir Pode assinar, Papel na assinatura, Administrador ou executor, módulos e escopo conforme o perfil."),
    ("atribuir_ocupante", "userTask", "Vincular Pessoa como ocupante", "mti", 3470, 55,
     "Registrar Pessoa, condição (Titular/Substituto/Suplente), região, início/fim e Ativo na ocupação do Cargo."),
    ("validar_ocupacao", "businessRuleTask", "Validar Cargo e ocupação", "sistema", 3680, 345,
     "Confirmar organização do Cargo, Cargo ativo, ocupante ativo, vigência e compatibilidade de permissões."),
    ("gw_ocupacao_valida", "exclusiveGateway", "Cargo/ocupação válidos?", "sistema", 3890, 355,
     "Se inválido, retornar à configuração do Cargo. Se válido, liberar o cadastro externo."),
    ("liberar_onboarding", "serviceTask", "Liberar onboarding", "sistema", 4070, 345,
     "Gravar Status da habilitação documental = Em apresentação e associar a organização ao CPF responsável."),
    ("notificar_responsavel", "sendTask", "Notificar responsável", "sistema", 4270, 345,
     "Enviar link, identificação da organização e orientações de acesso por MT Login ou Gov.br."),
    ("gw_tipo_org_acesso", "exclusiveGateway", "Tipo da organização", "sistema", 4480, 355,
     "Direcionar a notificação e o portal para Cliente ou Parceiro."),
    ("receber_cliente", "receiveTask", "Receber convite de acesso", "cliente", 4660, 595,
     "O responsável Cliente recebe a notificação da organização à qual está vinculado."),
    ("receber_parceiro", "receiveTask", "Receber convite de acesso", "parceiro", 4660, 845,
     "O responsável Parceiro recebe a notificação da organização à qual está vinculado."),
    ("acessar_cliente", "userTask", "Acessar Portal Cliente", "cliente", 4860, 595,
     "Escolher Entrar com MT Login ou Gov.br. O portal não solicita senha própria do Atlas."),
    ("acessar_parceiro", "userTask", "Acessar Portal Parceiro", "parceiro", 4860, 845,
     "Escolher Entrar com MT Login ou Gov.br. O portal não solicita senha própria do Atlas."),
    ("solicitar_autenticacao", "sendTask", "Solicitar autenticação", "sistema", 5070, 345,
     "Redirecionar ao provedor escolhido com callback seguro. O Atlas não recebe a senha."),
    ("receber_identidade", "receiveTask", "Receber CPF autenticado", "sistema", 5270, 345,
     "Receber do provedor a identidade autenticada, incluindo CPF e resultado da autenticação."),
    ("comparar_cpf", "businessRuleTask", "Comparar CPF e vínculo", "sistema", 5470, 345,
     "CPF retornado deve ser o CPF da Pessoa responsável, vinculada por Cargo ativo à organização."),
    ("gw_acesso_valido", "exclusiveGateway", "CPF e vínculo válidos?", "sistema", 5680, 355,
     "Acesso somente quando CPF, Pessoa, Responsável, Cargo, ocupação e organização são coerentes."),
    ("negar_acesso", "serviceTask", "Negar acesso e registrar tentativa", "sistema", 5660, 445,
     "Não expor dados da organização. Informar que o CPF não está autorizado e registrar auditoria."),
    ("carregar_permissoes", "serviceTask", "Criar sessão e aplicar permissões", "sistema", 5860, 345,
     "Permissão efetiva = perfil + organização + módulos visíveis da organização + Cargo/Administrador."),
    ("gw_perfil_portal", "exclusiveGateway", "Perfil autenticado", "sistema", 6070, 355,
     "Direcionar para a jornada Cliente ou Parceiro da organização vinculada."),
    # Cliente: Pessoa e Organização
    ("cli_pessoa", "userTask", "Completar dados da Pessoa", "cliente", 6250, 545,
     "Confirmar Nome, dados pessoais necessários, CPF somente leitura, e-mail, telefones e endereços."),
    ("cli_org_dados", "userTask", "Completar Dados da Organização", "cliente", 6450, 545,
     "Validar CNPJ e preencher Razão social, Nome fantasia, Natureza jurídica, inscrições e CNAE."),
    ("cli_org_info", "userTask", "Completar dados específicos Cliente", "cliente", 6650, 545,
     "Confirmar Poder da organização e demais informações adicionais disponibilizadas ao Cliente."),
    ("cli_documentos", "userTask", "Anexar documentos por etapa", "cliente", 6850, 545,
     "Preencher os documentos exigidos em cada etapa/grupo; informar arquivo, número e vencimento quando aplicável."),
    ("cli_contato", "userTask", "Preencher Contato e demais dados", "cliente", 7050, 545,
     "Preencher contatos institucionais e demais campos liberados para o perfil Cliente."),
    ("cli_enviar", "userTask", "Revisar e enviar cadastro", "cliente", 7250, 545,
     "Aceitar declarações, revisar Pessoa/Organização/Documentos e enviar à MTI."),
    # Parceiro: Pessoa e Organização
    ("par_pessoa", "userTask", "Completar dados da Pessoa", "parceiro", 6250, 795,
     "Confirmar Nome, dados pessoais necessários, CPF somente leitura, e-mail, telefones e endereços."),
    ("par_org_dados", "userTask", "Completar Dados da Organização", "parceiro", 6450, 795,
     "Validar CNPJ e preencher Razão social, Nome fantasia, Natureza jurídica, inscrições, CNAE e contas bancárias."),
    ("par_org_info", "userTask", "Completar dados específicos Parceiro", "parceiro", 6650, 795,
     "Confirmar Parcerias, informações adicionais e dados de habilitação disponibilizados ao Parceiro."),
    ("par_documentos", "userTask", "Anexar documentos por etapa", "parceiro", 6850, 795,
     "Preencher documentos MIPP por etapa/grupo. Vencimento pode ser OCR, calculado por periodicidade ou manual."),
    ("par_tributos", "userTask", "Preencher Tributos e Encargos", "parceiro", 7050, 795,
     "Informar regime, tributos, alíquotas, isenções e comprovantes quando aplicável."),
    ("par_contato", "userTask", "Preencher Contato", "parceiro", 7250, 795,
     "Preencher e-mails, telefones, endereços e contatos institucionais."),
    ("par_enviar", "userTask", "Revisar e enviar cadastro", "parceiro", 7450, 795,
     "Aceitar declarações, revisar Pessoa/Organização/Documentos/Tributos e enviar à MTI."),
    ("validar_envio", "businessRuleTask", "Validar envio completo", "sistema", 7650, 345,
     "Validar Organização, Pessoa, Cargo/ocupação, campos por perfil, documentos obrigatórios anexados e não vencidos."),
    ("gw_envio_valido", "exclusiveGateway", "Cadastro completo e válido?", "sistema", 7860, 355,
     "Se houver pendência, manter Em apresentação e devolver ao perfil correto. Se válido, protocolar para análise."),
    ("exibir_pendencias_portal", "serviceTask", "Exibir pendências no portal", "sistema", 7840, 445,
     "Apontar campos e documentos faltantes sem enviar o cadastro à MTI."),
    ("status_aguardando", "serviceTask", "Status = Completa – aguardando MTI", "sistema", 8040, 345,
     "Protocolar data/hora, congelar a versão submetida e colocar na fila da MTI."),
    ("notificar_mti", "sendTask", "Notificar MTI", "sistema", 8240, 345,
     "Criar item de análise com organização, responsável, perfil e versão submetida."),
    # Análise MTI de Organização, Pessoa, Cargo e documentos
    ("analisar_org", "userTask", "Analisar Organização", "mti", 8440, 95,
     "Revisar Dados do Cadastro, Dados da Organização, Informações Adicionais, Habilitação, Tributos e Contato."),
    ("analisar_pessoa", "userTask", "Analisar Pessoa responsável", "mti", 8640, 95,
     "Conferir CPF, Perfil, contatos, documentos pessoais e correspondência com a identidade autenticada."),
    ("analisar_cargo", "userTask", "Analisar Cargo e ocupação", "mti", 8840, 95,
     "Conferir organização do Cargo, ocupante, condição, vigência, Ativo, assinatura e permissões."),
    ("analisar_documento", "userTask", "Analisar documento", "mti", 9040, 55,
     "Para cada documento Pendente, conferir conteúdo, tipo e vencimento; decidir Aprovado ou Recusado."),
    ("gw_documento", "exclusiveGateway", "Documento conforme?", "mti", 9250, 65,
     "Aprovar ou recusar individualmente o anexo; isso não substitui o parecer do cadastro."),
    ("aprovar_documento", "userTask", "Marcar documento Aprovado", "mti", 9420, 45,
     "Registrar analista, data e status Aprovado."),
    ("recusar_documento", "userTask", "Marcar documento Recusado", "mti", 9420, 145,
     "Registrar motivo da recusa para compor o parecer de ajuste/reprovação."),
    ("gw_mais_documentos", "exclusiveGateway", "Há mais documentos?", "mti", 9630, 65,
     "Repetir a análise até cobrir todos os documentos submetidos."),
    ("elaborar_parecer", "userTask", "Elaborar e enviar parecer", "mti", 9800, 95,
     "Consolidar análise da Organização, Pessoa, Cargo/ocupação e documentos. Selecionar Aprovar, Solicitar ajuste ou Reprovar e informar motivo."),
    ("gw_parecer", "exclusiveGateway", "Decisão do parecer", "mti", 10010, 105,
     "Aprovar libera o cadastro; ajuste devolve ao responsável; reprovação encerra definitivamente."),
    ("aprovar_cadastro", "userTask", "Aprovar cadastro", "mti", 10180, 45,
     "Confirmar o método Aprovar cadastro."),
    ("solicitar_ajuste", "userTask", "Solicitar ajuste", "mti", 10180, 125,
     "Informar motivo claro, campos/documentos afetados e enviar ao responsável."),
    ("reprovar_cadastro", "userTask", "Reprovar cadastro", "mti", 10180, 205,
     "Usar apenas para rejeição definitiva e registrar justificativa."),
    ("status_aprovada", "serviceTask", "Status = Aprovada pela MTI", "sistema", 10400, 295,
     "Liberar Acesso comercial e manter trilha do parecer."),
    ("status_ajuste", "serviceTask", "Status = Em apresentação", "sistema", 10400, 375,
     "Reabrir a versão editável sem apagar o histórico da submissão analisada."),
    ("status_reprovada", "serviceTask", "Status = Reprovada pela MTI", "sistema", 10400, 455,
     "Manter Acesso comercial = Não e preservar parecer e evidências."),
    ("notificar_aprovacao", "sendTask", "Enviar parecer de aprovação", "sistema", 10620, 295,
     "Notificar o responsável Cliente ou Parceiro e disponibilizar o parecer."),
    ("notificar_ajuste", "sendTask", "Enviar parecer de ajuste", "sistema", 10620, 375,
     "Notificar o responsável com motivo e pendências; retornar à jornada do perfil."),
    ("notificar_reprovacao", "sendTask", "Enviar parecer de reprovação", "sistema", 10620, 455,
     "Notificar o responsável e disponibilizar a justificativa definitiva."),
    ("end_aprovada", "endEvent", "Cadastro aprovado", "sistema", 10860, 312,
     "Organização, Pessoa e Cargo aptos conforme permissões aprovadas."),
    ("end_reprovada", "endEvent", "Cadastro reprovado", "sistema", 10860, 472,
     "Fluxo encerrado com reprovação e trilha de auditoria."),
]

# Abre espaço horizontal para o bloco de hierarquia sem alterar manualmente o restante do diagrama.
HIERARCHY_NODE_IDS = {
    "gw_organizacao_raiz",
    "selecionar_organizacao_pai",
    "validar_organizacao_pai",
    "gw_organizacao_pai_valida",
    "corrigir_organizacao_pai",
    "calcular_hierarquia_raiz",
    "calcular_hierarquia_filha",
    "gw_hierarquia_concluida",
}

# id, origem, destino, rótulo
FLOWS = [
    ("f01", "start", "criar_org", ""),
    ("f02", "criar_org", "dados_cadastro", ""),
    ("f03", "dados_cadastro", "info_adicionais", ""),
    ("f03a", "info_adicionais", "gw_organizacao_raiz", ""),
    ("f03b", "gw_organizacao_raiz", "calcular_hierarquia_raiz", "Sim"),
    ("f03c", "gw_organizacao_raiz", "selecionar_organizacao_pai", "Não"),
    ("f03d", "selecionar_organizacao_pai", "validar_organizacao_pai", ""),
    ("f03e", "validar_organizacao_pai", "gw_organizacao_pai_valida", ""),
    ("f03f", "gw_organizacao_pai_valida", "corrigir_organizacao_pai", "Não"),
    ("f03g", "corrigir_organizacao_pai", "selecionar_organizacao_pai", ""),
    ("f03h", "gw_organizacao_pai_valida", "calcular_hierarquia_filha", "Sim"),
    ("f03i", "calcular_hierarquia_raiz", "gw_hierarquia_concluida", ""),
    ("f03j", "calcular_hierarquia_filha", "gw_hierarquia_concluida", ""),
    ("f04", "gw_hierarquia_concluida", "incluir_etapas", ""),
    ("f05", "incluir_etapas", "salvar_org", ""),
    ("f06", "salvar_org", "validar_org_minima", ""),
    ("f07", "validar_org_minima", "gw_org_minima", ""),
    ("f08", "gw_org_minima", "mostrar_pendencias_mti", "Não"),
    ("f09", "mostrar_pendencias_mti", "dados_cadastro", "Corrigir"),
    ("f10", "gw_org_minima", "localizar_pessoa", "Sim"),
    ("f11", "localizar_pessoa", "gw_pessoa_existe", ""),
    ("f12", "gw_pessoa_existe", "criar_pessoa", "Não"),
    ("f13", "criar_pessoa", "validar_perfil", ""),
    ("f14", "gw_pessoa_existe", "validar_perfil", "Sim"),
    ("f15", "validar_perfil", "gw_perfil_compativel", ""),
    ("f16", "gw_perfil_compativel", "corrigir_pessoa", "Não"),
    ("f17", "corrigir_pessoa", "validar_perfil", ""),
    ("f18", "gw_perfil_compativel", "verificar_vinculo", "Sim"),
    ("f19", "verificar_vinculo", "gw_vinculo", ""),
    ("f20", "gw_vinculo", "selecionar_cargo", "Não"),
    ("f21", "selecionar_cargo", "configurar_cargo", ""),
    ("f22", "configurar_cargo", "atribuir_ocupante", ""),
    ("f23", "atribuir_ocupante", "validar_ocupacao", ""),
    ("f24", "gw_vinculo", "validar_ocupacao", "Sim"),
    ("f25", "validar_ocupacao", "gw_ocupacao_valida", ""),
    ("f26", "gw_ocupacao_valida", "selecionar_cargo", "Não"),
    ("f27", "gw_ocupacao_valida", "liberar_onboarding", "Sim"),
    ("f28", "liberar_onboarding", "notificar_responsavel", ""),
    ("f29", "notificar_responsavel", "gw_tipo_org_acesso", ""),
    ("f30", "gw_tipo_org_acesso", "receber_cliente", "Cliente"),
    ("f31", "gw_tipo_org_acesso", "receber_parceiro", "Parceiro"),
    ("f32", "receber_cliente", "acessar_cliente", ""),
    ("f33", "receber_parceiro", "acessar_parceiro", ""),
    ("f34", "acessar_cliente", "solicitar_autenticacao", "MT Login ou Gov.br"),
    ("f35", "acessar_parceiro", "solicitar_autenticacao", "MT Login ou Gov.br"),
    ("f36", "solicitar_autenticacao", "receber_identidade", "Callback"),
    ("f37", "receber_identidade", "comparar_cpf", ""),
    ("f38", "comparar_cpf", "gw_acesso_valido", ""),
    ("f39", "gw_acesso_valido", "negar_acesso", "Não"),
    ("f40", "negar_acesso", "gw_tipo_org_acesso", "Tentar novamente"),
    ("f41", "gw_acesso_valido", "carregar_permissoes", "Sim"),
    ("f42", "carregar_permissoes", "gw_perfil_portal", ""),
    ("f43", "gw_perfil_portal", "cli_pessoa", "Cliente"),
    ("f44", "gw_perfil_portal", "par_pessoa", "Parceiro"),
    ("f45", "cli_pessoa", "cli_org_dados", ""),
    ("f46", "cli_org_dados", "cli_org_info", ""),
    ("f47", "cli_org_info", "cli_documentos", ""),
    ("f48", "cli_documentos", "cli_contato", ""),
    ("f49", "cli_contato", "cli_enviar", ""),
    ("f50", "cli_enviar", "validar_envio", ""),
    ("f51", "par_pessoa", "par_org_dados", ""),
    ("f52", "par_org_dados", "par_org_info", ""),
    ("f53", "par_org_info", "par_documentos", ""),
    ("f54", "par_documentos", "par_tributos", ""),
    ("f55", "par_tributos", "par_contato", ""),
    ("f56", "par_contato", "par_enviar", ""),
    ("f57", "par_enviar", "validar_envio", ""),
    ("f58", "validar_envio", "gw_envio_valido", ""),
    ("f59", "gw_envio_valido", "exibir_pendencias_portal", "Não"),
    ("f60", "exibir_pendencias_portal", "gw_perfil_portal", "Corrigir"),
    ("f61", "gw_envio_valido", "status_aguardando", "Sim"),
    ("f62", "status_aguardando", "notificar_mti", ""),
    ("f63", "notificar_mti", "analisar_org", ""),
    ("f64", "analisar_org", "analisar_pessoa", ""),
    ("f65", "analisar_pessoa", "analisar_cargo", ""),
    ("f66", "analisar_cargo", "analisar_documento", ""),
    ("f67", "analisar_documento", "gw_documento", ""),
    ("f68", "gw_documento", "aprovar_documento", "Sim"),
    ("f69", "gw_documento", "recusar_documento", "Não"),
    ("f70", "aprovar_documento", "gw_mais_documentos", ""),
    ("f71", "recusar_documento", "gw_mais_documentos", ""),
    ("f72", "gw_mais_documentos", "analisar_documento", "Sim"),
    ("f73", "gw_mais_documentos", "elaborar_parecer", "Não"),
    ("f74", "elaborar_parecer", "gw_parecer", ""),
    ("f75", "gw_parecer", "aprovar_cadastro", "Aprovar"),
    ("f76", "gw_parecer", "solicitar_ajuste", "Solicitar ajuste"),
    ("f77", "gw_parecer", "reprovar_cadastro", "Reprovar"),
    ("f78", "aprovar_cadastro", "status_aprovada", ""),
    ("f79", "solicitar_ajuste", "status_ajuste", ""),
    ("f80", "reprovar_cadastro", "status_reprovada", ""),
    ("f81", "status_aprovada", "notificar_aprovacao", ""),
    ("f82", "status_ajuste", "notificar_ajuste", ""),
    ("f83", "status_reprovada", "notificar_reprovacao", ""),
    ("f84", "notificar_aprovacao", "end_aprovada", ""),
    ("f85", "notificar_ajuste", "gw_perfil_portal", "Corrigir e reenviar"),
    ("f86", "notificar_reprovacao", "end_reprovada", ""),
]

IDP_NODES = [
    ("idp_start", "startEvent", "Solicitação recebida", 5090, 1185),
    ("idp_autenticar", "serviceTask", "Autenticar usuário\nMT Login / Gov.br", 5250, 1168),
    ("idp_emitir", "sendTask", "Retornar identidade e CPF", 5470, 1168),
    ("idp_end", "endEvent", "Resposta enviada", 5700, 1185),
]


def node_bounds(node):
    node_id, kind, _, _, x, y, _ = node
    if x >= 900 and node_id not in HIERARCHY_NODE_IDS:
        x += 1000
    if kind in {"startEvent", "endEvent"}:
        return x, y, 36, 36
    if kind == "exclusiveGateway":
        return x, y, 50, 50
    return x, y, 170, 70


def idp_bounds(node):
    _, kind, _, x, y = node
    x += 1000
    if kind in {"startEvent", "endEvent"}:
        return x, y, 36, 36
    return x, y, 180, 70


def center(bounds):
    x, y, width, height = bounds
    return x + width / 2, y + height / 2


def waypoints(source_bounds, target_bounds):
    sx, sy = center(source_bounds)
    tx, ty = center(target_bounds)
    if abs(sy - ty) < 8:
        return [(sx, sy), (tx, ty)]
    # Retornos longos são roteados abaixo da raia Parceiro para não cobrir tarefas.
    if tx < sx - 500:
        return [(sx, sy), (sx + 40, sy), (sx + 40, 1080), (tx - 40, 1080), (tx - 40, ty), (tx, ty)]
    middle = (sx + tx) / 2
    return [(sx, sy), (middle, sy), (middle, ty), (tx, ty)]


def build_process():
    incoming = {node[0]: [] for node in NODES}
    outgoing = {node[0]: [] for node in NODES}
    for flow_id, source, target, _ in FLOWS:
        outgoing[source].append(flow_id)
        incoming[target].append(flow_id)

    lane_refs = {key: [] for key in LANES}
    for node_id, _, _, lane, _, _, _ in NODES:
        lane_refs[lane].append(node_id)

    result = ['    <bpmn:laneSet id="laneSet_atlas">']
    for key, (lane_id, name, _, _) in LANES.items():
        refs = "".join(f"<bpmn:flowNodeRef>{node_id}</bpmn:flowNodeRef>" for node_id in lane_refs[key])
        result.append(f'      <bpmn:lane id="{lane_id}" name="{escape(name)}">{refs}</bpmn:lane>')
    result.append("    </bpmn:laneSet>")

    for node_id, kind, name, _, _, _, documentation in NODES:
        refs = "".join(f"<bpmn:incoming>{flow}</bpmn:incoming>" for flow in incoming[node_id])
        refs += "".join(f"<bpmn:outgoing>{flow}</bpmn:outgoing>" for flow in outgoing[node_id])
        result.append(
            f'    <bpmn:{kind} id="{node_id}" name="{escape(name)}">'
            f"<bpmn:documentation>{escape(documentation)}</bpmn:documentation>{refs}</bpmn:{kind}>"
        )

    gateway_sources = {node[0] for node in NODES if node[1] == "exclusiveGateway"}
    for flow_id, source, target, name in FLOWS:
        name_attr = f' name="{escape(name)}"' if name else ""
        condition = ""
        if source in gateway_sources and name:
            condition = (
                '<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">'
                f"{escape(name)}</bpmn:conditionExpression>"
            )
        result.append(
            f'    <bpmn:sequenceFlow id="{flow_id}" sourceRef="{source}" targetRef="{target}"{name_attr}>'
            f"{condition}</bpmn:sequenceFlow>"
        )
    return "\n".join(result)


def build_idp_process():
    incoming = {node[0]: [] for node in IDP_NODES}
    outgoing = {node[0]: [] for node in IDP_NODES}
    idp_flows = [
        ("idpf1", "idp_start", "idp_autenticar"),
        ("idpf2", "idp_autenticar", "idp_emitir"),
        ("idpf3", "idp_emitir", "idp_end"),
    ]
    for flow_id, source, target in idp_flows:
        outgoing[source].append(flow_id)
        incoming[target].append(flow_id)
    result = []
    for node_id, kind, name, _, _ in IDP_NODES:
        refs = "".join(f"<bpmn:incoming>{flow}</bpmn:incoming>" for flow in incoming[node_id])
        refs += "".join(f"<bpmn:outgoing>{flow}</bpmn:outgoing>" for flow in outgoing[node_id])
        result.append(f'    <bpmn:{kind} id="{node_id}" name="{escape(name)}">{refs}</bpmn:{kind}>')
    for flow_id, source, target in idp_flows:
        result.append(f'    <bpmn:sequenceFlow id="{flow_id}" sourceRef="{source}" targetRef="{target}" />')
    return "\n".join(result), idp_flows


def build_di(idp_flows):
    by_id = {node[0]: node_bounds(node) for node in NODES}
    idp_by_id = {node[0]: idp_bounds(node) for node in IDP_NODES}
    shapes = [
        '      <bpmndi:BPMNShape id="participant_atlas_di" bpmnElement="participant_atlas" isHorizontal="true">'
        '<dc:Bounds x="80" y="40" width="11920" height="1000"/></bpmndi:BPMNShape>',
        '      <bpmndi:BPMNShape id="participant_idp_di" bpmnElement="participant_idp" isHorizontal="true">'
        '<dc:Bounds x="80" y="1120" width="11920" height="170"/></bpmndi:BPMNShape>',
    ]
    for lane_id, _, y, height in LANES.values():
        shapes.append(
            f'      <bpmndi:BPMNShape id="{lane_id}_di" bpmnElement="{lane_id}" isHorizontal="true">'
            f'<dc:Bounds x="110" y="{y}" width="11890" height="{height}"/></bpmndi:BPMNShape>'
        )
    for node in NODES:
        node_id, kind = node[0], node[1]
        x, y, width, height = by_id[node_id]
        marker = ' isMarkerVisible="true"' if kind == "exclusiveGateway" else ""
        shapes.append(
            f'      <bpmndi:BPMNShape id="{node_id}_di" bpmnElement="{node_id}"{marker}>'
            f'<dc:Bounds x="{x}" y="{y}" width="{width}" height="{height}"/></bpmndi:BPMNShape>'
        )
    for node in IDP_NODES:
        node_id = node[0]
        x, y, width, height = idp_by_id[node_id]
        shapes.append(
            f'      <bpmndi:BPMNShape id="{node_id}_di" bpmnElement="{node_id}">'
            f'<dc:Bounds x="{x}" y="{y}" width="{width}" height="{height}"/></bpmndi:BPMNShape>'
        )

    edges = []
    for flow_id, source, target, _ in FLOWS:
        points = waypoints(by_id[source], by_id[target])
        wp = "".join(f'<di:waypoint x="{x}" y="{y}"/>' for x, y in points)
        edges.append(f'      <bpmndi:BPMNEdge id="{flow_id}_di" bpmnElement="{flow_id}">{wp}</bpmndi:BPMNEdge>')
    for flow_id, source, target in idp_flows:
        points = waypoints(idp_by_id[source], idp_by_id[target])
        wp = "".join(f'<di:waypoint x="{x}" y="{y}"/>' for x, y in points)
        edges.append(f'      <bpmndi:BPMNEdge id="{flow_id}_di" bpmnElement="{flow_id}">{wp}</bpmndi:BPMNEdge>')

    # Mensagens entre Atlas e o provedor externo.
    edges.extend([
        '      <bpmndi:BPMNEdge id="msg_auth_request_di" bpmnElement="msg_auth_request">'
        '<di:waypoint x="6155" y="380"/><di:waypoint x="6108" y="1203"/></bpmndi:BPMNEdge>',
        '      <bpmndi:BPMNEdge id="msg_auth_response_di" bpmnElement="msg_auth_response">'
        '<di:waypoint x="6560" y="1203"/><di:waypoint x="6355" y="380"/></bpmndi:BPMNEdge>',
    ])
    return "\n".join(shapes), "\n".join(edges)


def main():
    atlas_process = build_process()
    idp_process, idp_flows = build_idp_process()
    shapes, edges = build_di(idp_flows)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_Fase1CadastroCompleto"
  targetNamespace="https://atlas.mti.mt.gov.br/bpmn">
  <bpmn:collaboration id="collaboration_cadastro_completo">
    <bpmn:participant id="participant_atlas" name="Atlas — Cadastro de Organização, Pessoa e Cargo" processRef="process_atlas" />
    <bpmn:participant id="participant_idp" name="Provedor de identidade — MT Login / Gov.br" processRef="process_idp" />
    <bpmn:messageFlow id="msg_auth_request" name="Solicitação OAuth/OIDC" sourceRef="solicitar_autenticacao" targetRef="idp_start" />
    <bpmn:messageFlow id="msg_auth_response" name="Identidade autenticada + CPF" sourceRef="idp_emitir" targetRef="receber_identidade" />
  </bpmn:collaboration>
  <bpmn:process id="process_atlas" name="Fase 1 — Cadastro completo" isExecutable="false">
    <bpmn:documentation>
      Classes do protótipo: Organização = form-patlasv4-proto-unidade-organizacional;
      Pessoa = form-patlasv4-proto-pessoa; Cargo = form-patlasv4-proto-cargo;
      Ocupante do Cargo = form-patlasv4-proto-cargo-ocupante.
      Métodos de decisão da Organização: Aprovar cadastro, Solicitar ajuste e Reprovar cadastro.
      Escopo inicial da MTI na Organização: Dados do Cadastro, Informações Adicionais,
      inclusão das Etapas de documentos e Salvar. Os demais dados são completados pelo
      responsável Cliente ou Parceiro após validação de CPF e vínculo.
    </bpmn:documentation>
{atlas_process}
  </bpmn:process>
  <bpmn:process id="process_idp" name="Autenticação MT Login / Gov.br" isExecutable="false">
    <bpmn:documentation>
      Provedor externo autentica o usuário e devolve a identidade/CPF ao Atlas.
      Senhas e credenciais do provedor não são armazenadas pelo Atlas.
    </bpmn:documentation>
{idp_process}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="diagram_cadastro_completo">
    <bpmndi:BPMNPlane id="plane_cadastro_completo" bpmnElement="collaboration_cadastro_completo">
{shapes}
{edges}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
"""
    OUTPUT.write_text(xml, encoding="utf-8")
    OUTPUT_COPY.write_text(xml, encoding="utf-8")
    print(f"Gerado: {OUTPUT}")
    print(f"Cópia: {OUTPUT_COPY}")
    print(f"Atividades/eventos/gateways Atlas: {len(NODES)}")
    print(f"Fluxos Atlas: {len(FLOWS)}")


if __name__ == "__main__":
    main()
