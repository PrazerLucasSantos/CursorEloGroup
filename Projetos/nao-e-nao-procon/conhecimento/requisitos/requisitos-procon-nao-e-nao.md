título: Selo Não é Não – Mulheres Seguras (PROCON-MT)
fonte: PDF fluxo 04/09/2026; reuniões Granola 03/09, 10/09 e 18/09/2026; FigJam Fluxo Completo LR https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR; alinhamento protótipo Atlas (épico projeto-nao-e-nao-seplag-v1)
escopo: Um serviço digital — solicitação, análise/decisão, concessão, renovação, cancelamento a pedido e revogação administrativa do selo “Não é Não – Mulheres Seguras”. Integrações desta entrega: MT Login, JUCEMAT e Validador MT. Fora do escopo: módulo de denúncia/fiscalização/apuração; integração Sigadoc; integração Procon Digital; API de publicação da lista pública em outros sites; arte visual final do selo (SECOM / Gabinete da Mulher).

classe 1: Visão geral do serviço
necessidade: Disponibilizar na plataforma digital do Estado o ciclo completo do selo “Não é Não – Mulheres Seguras”, permitindo que estabelecimentos elegíveis solicitem a certificação com evidências do Protocolo Não é Não, que o PROCON-MT analise e decida, e que o selo emitido seja consultável por autenticidade (QR / Validador MT) e acompanhado em lista/relatório no MVP, com renovação, cancelamento voluntário e revogação administrativa operacional.
como é usado / contexto:
- Solicitante (estabelecimento autenticado): solicita, salva rascunho, protocola, responde diligência, apresenta recurso, renova e cancela a pedido.
- Analista PROCON: analisa requisitos item a item / por bloco, abre diligência única e encaminha para decisão.
- Autoridade PROCON: defere (emite selo) ou indefere; julga recurso; registra revogação administrativa.
- Cidadão: consulta autenticidade do selo via QR no Validador MT; no MVP, a lista de vigentes é consultada/exportada via analytics/relatório (API pública em fase futura).
- Escola de Governo: fora do sistema — oferece o curso e emite o certificado individual do capacitado; o sistema do selo apenas recebe o upload como evidência.
- Curso ≠ Selo: certificado do curso é da pessoa; o selo é do estabelecimento e só nasce no deferimento.
- FigJam (6 seções): (1) Acesso e empresa → (2) Solicitação/protocolo → (3) Pré-análise/ajustes → (4) Decisão/recurso → (5) Emissão/Validador/lista/notificações → (6) Pós (aviso vencimento, renovar, cancelar, revogar).
- Denúncia e fiscalização tramitam nos canais atuais / procedimento interno (ex.: Sigadoc); no sistema do selo só se operacionaliza a revogação (anexo + status REVOGADO + saída da lista).
requisitos:
RQ.001: Autenticar solicitantes via MT Login e vincular o requerimento a estabelecimento retornado/verificado pela JUCEMAT.
RQ.002: Tramitar o pedido pelos status RASCUNHO → PROTOCOLADO → AGUARDANDO ATENDIMENTO → EM ANÁLISE → EM DILIGÊNCIA → DILIGÊNCIA RESPONDIDA | DILIGÊNCIA NÃO RESPONDIDA → DEFERIDO | INDEFERIDO → EM RECURSO → FINALIZADO (quando aplicável).
RQ.003: Manter o status do selo em VIGENTE → EXPIRADO | CANCELADO A PEDIDO | REVOGADO, atualizando lista/relatório e autenticidade no Validador MT.
RQ.004: Não implementar nesta entrega módulo de denúncia, fiscalização/apuração, integração Sigadoc, integração Procon Digital, API de lista pública nem arte SECOM.
RQ.005: Entregar MVP prioritário (~30 dias após abertura da OS), sujeito ao comportamento real das integrações (especialmente JUCEMAT).
regras:
RN.001: Integrações obrigatórias desta entrega: MT Login, JUCEMAT e Validador MT.
RN.002: Validade do selo = data de concessão + 24 meses (minuta do decreto / PDF / ata 03/09). FigJam registra 12 meses — divergência documentada; protótipo e requisitos permanecem em 24 meses até o decreto fechar.
RN.003: CANCELADO no FigJam corresponde a CANCELADO A PEDIDO no modelo (cancelamento voluntário do estabelecimento).
RN.004: Regra de quem pode solicitar (sócio-administrador, representante com procuração, matriz vs filial) e existência de MT Login para CNPJ: a confirmar.
regras de negócio gerais:
RNG.001: Um único serviço de selo cobre solicitação, concessão, renovação, cancelamento a pedido e revogação administrativa.
RNG.002: Prazo de análise/decisão: até 30 dias (minuta do decreto), suspenso durante diligência.
RNG.003: Prazo de resposta à diligência: 5 dias (Lei 7.692/2002); diligência é única (todas as pendências de uma vez).
RNG.004: Ausência de resposta à diligência não gera indeferimento automático; o pedido segue para decisão com os elementos dos autos.
RNG.005: Não deferir enquanto houver requisito obrigatório marcado como “não conforme”.
RNG.006: Percentuais mínimos de capacitados (≥ 2; eventos com público > 300 → mínimo 10%): confirmar redação final do decreto.
RNG.007: Arte visual do certificado/selo é pendência externa (SECOM / Gabinete da Mulher); o sistema emite o documento eletrônico com número, dados e QR.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nome do serviço | text | — | Identificação documental | Documentação | Selo Não é Não – Mulheres Seguras
Escopo da entrega | text | — | Um serviço; sem denúncia | Documentação | Solicitação/concessão/renovação/cancelamento/revogação
FigJam fluxo LR | link | — | Referência visual das 6 seções | Documentação | board txWrswjvhQUdxYb1Ojmdtl
Validade do selo (meses) | number | — | 24 (decreto/PDF); FigJam 12 | Documentação | 24
Status do pedido | textOptions | — | Máquina de estados do processo | Sistema | PROTOCOLADO
Status do selo | textOptions | — | VIGENTE / EXPIRADO / CANCELADO A PEDIDO / REVOGADO | Sistema | VIGENTE

classe 2: Acesso (MT Login + JUCEMAT)
necessidade: Autenticar o solicitante com MT Login, listar os estabelecimentos vinculados via JUCEMAT e permitir a seleção da unidade que será objeto do requerimento, exigindo documento de representação quando o solicitante não for o responsável cadastral definido.
como é usado / contexto:
- Corresponde à seção 1 do FigJam: Início → MT Login → JUCEMAT → Seleciona estabelecimento.
- Após autenticação, o sistema apresenta apenas empresas retornadas pela JUCEMAT vinculadas ao usuário.
- Se o solicitante não for o responsável cadastral, exige upload de documento de poderes de representação (procuração ou equivalente).
- Perfis e regra fina de vínculo CPF↔CNPJ / matriz-filial: a confirmar com negócio e comportamento da JUCEMAT.
requisitos:
RQ.010: Realizar autenticação do solicitante exclusivamente via MT Login.
RQ.011: Consultar e listar estabelecimentos vinculados ao usuário autenticado por meio da integração JUCEMAT.
RQ.012: Vincular o requerimento à unidade (estabelecimento) selecionada.
RQ.013: Exigir documento de representação quando o solicitante não for o responsável cadastral da unidade.
regras:
RN.010: Somente empresas retornadas pela JUCEMAT e vinculadas ao usuário podem ser selecionadas.
RN.011: Sem autenticação MT Login válida, o acesso à solicitação é bloqueado.
RN.012: Quem pode solicitar (sócio/representante/filial) e MT Login para CNPJ: pendências de negócio — marcar como a confirmar.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nome | text | Sim | Identificação do registro de acesso / perfil | Sistema | Acesso solicitante
Ativo para acesso | boolean | Sim | Indica se o perfil pode iniciar solicitação | Sistema | Sim
Orientação de acesso | alert | Não | Texto de ajuda: MT Login + seleção JUCEMAT | Sistema | Instruções
Login | text | Não | Identificador do usuário autenticado | MT Login | usuario.mt
E-mail principal | text | Não | Contato do autenticado | MT Login | email@dominio.gov.br
MT-ID | text | Não | Identificador MT Login | MT Login | mt-123
CPF | text | Não | CPF do autenticado | MT Login | 000.000.000-00
Estabelecimentos vinculados (JUCEMAT) | textOptions | Sim | Lista somente empresas JUCEMAT do usuário | JUCEMAT / usuário | Empresa LTDA — unidade X
Documento de representação | file | Condicional | Obrigatório se solicitante ≠ responsável cadastral (classe Acesso) | Upload | Procuração.pdf
Integração | alert | Não | Lembrete: MT Login + JUCEMAT nesta entrega | Documentação | —
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Entrar (MT Login) | Destaque | Tela inicial | Autentica o solicitante via MT Login | Obrigatório para seguir
Continuar para solicitação | Destaque | Após seleção de estabelecimento | Abre o Formulário de Solicitação vinculado à unidade | Exige estabelecimento selecionado

classe 3: Capacitado
necessidade: Registrar cada pessoa capacitada no Protocolo Não é Não que integra a equipe do estabelecimento, com dados do curso, certificado individual e comprovante de vínculo com a unidade.
como é usado / contexto:
- Classe embutida (embedded) no Formulário de Solicitação: um registro repetível por capacitado.
- O certificado do curso é emitido pela Escola de Governo (fora do sistema); aqui só se anexa evidência.
- Comprovante de vínculo pode ser CTPS, contrato de prestação, documento de terceirizado, sócio ou outro admitido.
- Serve de base para o cálculo do percentual de capacitados e para a análise de conformidade da equipe.
requisitos:
RQ.020: Permitir inclusão de N capacitados por solicitação, cada um com nome, função, tipo de vínculo, curso, data de conclusão, certificado e comprovante de vínculo.
RQ.021: Exibir e armazenar os capacitados como registros vinculados ao pedido/estabelecimento para análise do PROCON.
regras:
RN.020: Cada capacitado deve ter certificado e comprovante de vínculo anexados ao respectivo registro (não há upload geral único de certificados).
RN.021: Tipo de vínculo admite ao menos: empregatício, prestação de serviço, terceirizado, sócio, outro.
RN.022: Curso padrão esperado: Protocolo Não é Não (Escola de Governo) — a confirmar se outros cursos serão aceitos.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nome | text | Sim | Nome completo do capacitado | Usuário | João da Silva
Função | text | Sim | Função no estabelecimento | Usuário | Segurança
Tipo de vínculo | textOptions | Sim | Empregatício / prestação / terceirizado / sócio / outro | Usuário | Empregatício
Curso realizado | text | Sim | Protocolo Não é Não | Usuário | Protocolo Não é Não
Data de conclusão | date | Sim | Data do certificado | Usuário | 01/08/2026
Certificado | file | Sim | Certificado individual da Escola de Governo | Upload | certificado.pdf
Comprovante de vínculo | file | Sim | CTPS, contrato, etc. | Upload | ctps.pdf
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Adicionar capacitado | Padrão | Bloco equipe da solicitação | Cria novo registro Capacitado | —
Remover capacitado | Padrão | Lista de capacitados | Remove o registro | —

classe 4: Formulário de Solicitação
necessidade: Coletar todos os dados e evidências necessários à concessão do selo — cadastro da unidade (incl. foto da fachada), enquadramento, equipe/capacitados, sinalização (2 locais + fotos), procedimentos do protocolo, câmeras (condicionais) e declarações finais — permitindo rascunho, revisão e protocolização. Redação das perguntas conforme PDF fluxo 04/09/2026; estrutura da solicitação conforme reunião 18/09/2026.
como é usado / contexto:
- Seção 2 do FigJam: Form → Revisa → Protocolar.
- Dados cadastrais preferencialmente pré-preenchidos pela JUCEMAT; responsável e evidências preenchidos pelo solicitante.
- Capacitados: certificado e comprovante de vínculo por pessoa na tabela (sem arquivo geral).
- Sinalização na solicitação: apenas banheiro feminino e local de ampla visualização, cada um com foto. Conteúdo do cartaz (acionar, 190, 180, A3) é checklist do analista.
- Seção “Sinal / código” removida da solicitação (reunião 18/09); conteúdo verificado no cartaz pelo PROCON.
- Câmeras não são requisito de concessão; se Sim, abrem-se perguntas condicionais (sem upload).
- Protocolar exige checkbox de conferência após revisão.
requisitos:
RQ.030: Disponibilizar formulário com blocos: dados/fachada, enquadramento, equipe/capacitados, sinalização (2 locais), procedimentos, câmeras condicionais e declarações — textos literais do PDF.
RQ.031: Calcular automaticamente o percentual de capacitados; bloquear avanço se abaixo do mínimo (2; ou 10% se equipe > 300 — confirmar decreto/público).
RQ.032: Permitir salvar rascunho; Revisar → checkbox de conferência → Protocolar.
RQ.033: Conteúdo legal do cartaz (forma de acionar, 190, 180, A3/texto oficial) é validado no painel do analista, não como Sim/Não na solicitação.
regras:
RN.030: Percentual = qtd. capacitados ÷ qtd. funcionários, exibido automaticamente.
RN.031: Ao menos 2 capacitados; se funcionários > 300, mínimo 10% (PDF: eventos com público estimado > 300 — alinhar redação).
RN.032: Ausência de câmera não reprova. Possuir câmera e negar preservação ≥ 30 dias ou acesso legal → não conformidade.
RN.033: Sinalização na solicitação = 2 perguntas + 2 fotos (banheiro e local de ampla visualização). Analista confere conteúdo do cartaz item a item.
RN.034: Bloquear protocolização se obrigatórios faltarem ou se capacitados < mínimo ou se checkbox de revisão não marcado.
RN.035: Declarações finais: implementação e veracidade (textos do PDF) + pergunta sobre sanção administrativa nos 12 meses anteriores.
RN.036: Sem seção “Qual sinal ou código” na solicitação (reunião 18/09).
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nº protocolo | text | Não | Gerado na protocolização | Sistema | 2026/0001
Status do pedido | textOptions | Não | RASCUNHO até protocolar | Sistema | RASCUNHO
Responsável pelo requerimento | text | Sim | | Usuário | Maria Silva
Contato do responsável | text | Sim | | Usuário | (65) 99999-0000
CPF do responsável | text | Sim | | Usuário | 000.000.000-00
Documento de representação (quando necessário) | file | Condicional | Se ≠ responsável cadastral | Upload | procuracao.pdf
Estabelecimento | textOptions | Sim | Unidade JUCEMAT | JUCEMAT / usuário | Unidade Centro
CNPJ | text | Sim | Pré-preenchido JUCEMAT | JUCEMAT | 00.000.000/0001-00
Razão social | text | Sim | Pré-preenchido | JUCEMAT | Empresa LTDA
Nome fantasia | text | Sim | Pré-preenchido | JUCEMAT / usuário | Nome fantasia
Fotografia da fachada do estabelecimento | file | Sim | Reunião 18/09; confirmar JUCEMAT | Upload | fachada.jpg
CNAE / atividade | text | Sim | Pré-preenchido | JUCEMAT / usuário | CNAE
Endereço (CEP, logradouro, número, bairro, cidade, UF) | text | Sim | | JUCEMAT / usuário | —
O estabelecimento é casa noturna ou boate? | textOptions | Sim | PDF §2 | Usuário | Sim
Realiza espetáculo musical em local fechado, shows ou eventos musicais? | textOptions | Sim | PDF §2 | Usuário | Não
Há venda de bebida alcoólica? | textOptions | Sim | PDF §2 | Usuário | Sim
Trata-se de competição ou evento esportivo? | textOptions | Sim | PDF §2 | Usuário | Não
Quantos funcionários/pessoas integrantes da equipe atuam no estabelecimento? | number | Sim | PDF §3 | Usuário | 20
Quantos possuem capacitação para aplicação do Protocolo "Não é Não"? | number | Sim | PDF §3; gate de mínimo | Usuário | 4
Percentual de funcionários capacitados | text | Não | Calculado | Sistema | 20%
Identificação dos capacitados | embeddedReference | Sim | PDF §4; cert + vínculo por pessoa | Usuário | Tabela
O estabelecimento mantém, nos banheiros femininos, informação sobre a disponibilidade do estabelecimento para o auxílio às mulheres que se sintam em situação de risco? | textOptions | Sim | PDF §5 + reunião (item separado) | Usuário | Sim
Fotografia da sinalização afixada no banheiro feminino | file | Sim | Ao lado da pergunta | Upload | foto-banheiro.jpg
O estabelecimento mantém, em local de ampla visualização, informação sobre a disponibilidade do estabelecimento para o auxílio às mulheres que se sintam em situação de risco? | textOptions | Sim | PDF §5 + reunião (item separado) | Usuário | Sim
Fotografia da sinalização afixada em local de ampla visualização | file | Sim | Ao lado da pergunta | Upload | foto-local.jpg
Procedimentos p1–p11 | textOptions | Sim | Textos literais do PDF §7 | Usuário | Sim
O estabelecimento dispõe de sistema de câmeras de segurança? | textOptions | Sim | PDF §8; se Não, pula | Usuário | Não
Em caso de ocorrência, o estabelecimento preservará por pelo menos 30 dias as imagens relacionadas ao fato? | textOptions | Condicional | PDF §8 | Usuário | Sim
O estabelecimento garantirá acesso às imagens, nos termos da legislação, à Polícia Civil, perícia oficial e aos diretamente envolvidos? | textOptions | Condicional | PDF §8 | Usuário | Sim
Declaro que o estabelecimento implementou o Protocolo "Não é Não" e manterá os requisitos necessários durante a vigência do selo. | boolean | Sim | PDF §9 | Usuário | Marcado
Declaro que as informações e os documentos apresentados são verdadeiros, sob as penas da Lei. | boolean | Sim | PDF §9 | Usuário | Marcado
Houve sanção administrativa definitiva relacionada ao descumprimento do protocolo nos 12 meses anteriores? | textOptions | Sim | PDF §9 | Usuário | Não
Declaro que revisei todas as informações e documentos deste formulário e que estão corretos para envio. | boolean | Sim | Reunião 18/09; habilita Protocolar | Usuário | Marcado
Sanção administrativa definitiva nos 12 meses anteriores | textOptions | Sim | Conforme decreto | Usuário | Não
Comprovante de protocolização | file | Não | Gerado após protocolar | Sistema | comprovante.pdf
Regras do pedido | alert | Não | Resumo das RN de conformidade | Sistema | —
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Salvar rascunho | Padrão | Preenchimento | Grava pedido em RASCUNHO | Solicitante autenticado
Avançar / Revisar | Destaque | Formulário | Vai para tela de revisão | Valida obrigatórios do bloco quando aplicável
Protocolar solicitação | Destaque | Revisão sem pendências | Gera protocolo, data/hora, comprovante e status PROTOCOLADO; notifica servidor PROCON | Bloqueia se houver pendências obrigatórias

classe 5: Revisão e protocolização
necessidade: Apresentar ao solicitante o resumo consolidado das respostas e anexos, listar pendências obrigatórias e, na ausência destas, protocolar a solicitação gerando número, comprovante e notificação ao PROCON.
como é usado / contexto:
- Etapa imediata após o preenchimento do Formulário de Solicitação (FigJam §2).
- O solicitante pode voltar para editar antes de protocolar.
- Após protocolar, o pedido entra na fila do PROCON (EM ANÁLISE).
requisitos:
RQ.040: Exibir resumo de todos os blocos e lista de anexos antes do envio.
RQ.041: Listar pendências obrigatórias e impedir protocolização enquanto houver pendência.
RQ.042: Ao protocolar: gerar número de protocolo, registrar data/hora, emitir comprovante, definir status PROTOCOLADO e notificar servidor PROCON.
regras:
RN.040: Protocolização só ocorre sem pendências obrigatórias.
RN.041: Após PROTOCOLADO, o solicitante não edita livremente o formulário original — alterações passam por diligência quando aberta pelo analista.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Resumo das respostas | text | Não | Leitura de todos os blocos | Sistema | Resumo consolidado
Lista de anexos | text | Não | Nomes/tipos dos arquivos enviados | Sistema | certificados, fotos…
Pendências obrigatórias | alert | Não | Bloqueia envio se houver | Sistema | Falta foto A3
Nº protocolo gerado | text | Não | Após envio | Sistema | 2026/0001
Data/hora da protocolização | date | Não | Após envio | Sistema | 18/09/2026 10:00
Comprovante | file | Não | Download após protocolar | Sistema | comprovante.pdf
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Voltar para editar | Padrão | Revisão | Retorna ao Formulário de Solicitação | Antes de protocolar
Protocolar solicitação | Destaque | Revisão sem pendências | Gera protocolo + PROTOCOLADO + notifica PROCON | Obrigatórios ok

classe 6: Análise e Decisão
necessidade: Concentrar no PROCON a análise dos requisitos do pedido (conforme / não conforme / necessita complementação), a abertura de diligência única, o encaminhamento à decisão e o deferimento ou indeferimento pela autoridade, com emissão do selo no deferimento e encaminhamento a recurso no indeferimento — em uma única classe de trabalho alinhada às seções 3 e 4 do FigJam e à reunião 18/09/2026.
como é usado / contexto:
- Após PROTOCOLADO, o pedido entra na fila da classe Análise e Decisão com status **AGUARDANDO ATENDIMENTO**.
- O formulário de **Solicitação** fica embutido (referência embutida, somente leitura) na aba Análise › Pedido.
- O analista usa o método **Atender**: se AGUARDANDO ATENDIMENTO → EM ANÁLISE; abre **modal** com abas do status (Contexto, Checklist, Cartaz, Diligência, Decisão, Recurso).
- Campos de complementação só aparecem quando o checklist está «Necessita complementação». Em PRONTO PARA DECISÃO o checklist fica somente leitura.
- Analista avalia por blocos/checklist: dados e fachada; enquadramento; equipe; sinalização (fotos) + itens do cartaz (acionar, 190, 180, A3); Sinal Vermelho; procedimentos; câmeras; declarações — podendo registrar complementação por bloco.
- Itens detalhados do cartaz (190/180/A3/acionar) e Sinal Vermelho são checklist do analista (não Sim/Não na solicitação — reunião 18/09).
- Se houver necessidade de ajuste: Abrir diligência (todas as pendências de uma vez) → EM DILIGÊNCIA → notifica solicitante → prazo 5 dias → DILIGÊNCIA RESPONDIDA ou NÃO RESPONDIDA → Retomar análise → Encaminhar para decisão.
- Se pronto para decisão: autoridade Deferir (emite certificado + QR Validador MT + inclui em Estabelecimentos com Selo + notifica solicitante e servidor + status VIGENTE) ou Indeferir (fundamenta e informa possibilidade de recurso).
- Overlay FigJam: primeira análise → ajustar | tudo certo | necessidade de ajuste → análise final → aprovar/reprovar → «solicitante entrou com recurso?».
- Julgamento do recurso (Provido / Não provido + fundamentação) ocorre na **Análise e Decisão**; a peça Recurso concentra razões e anexos do solicitante.
- Prazo de análise/decisão: até 30 dias (minuta), suspenso na diligência.
requisitos:
RQ.050: Disponibilizar cabeçalho do processo (protocolo, status, CNPJ/estabelecimento/município, analista, datas e prazo restante) e o formulário de solicitação como referência embutida (somente leitura) no topo da aba Análise, com os campos de análise abaixo.
RQ.050a: Disponibilizar método Atender que, a partir da fila (AGUARDANDO ATENDIMENTO), inicia EM ANÁLISE e abre modal com os campos do status atual (Análise / Diligência / Decisão / Recurso). A Solicitação permanece embutida na classe.
RQ.051: Permitir conclusão por bloco/checklist: Conforme / Não conforme / Necessita complementação (e N/A em câmeras quando aplicável), com texto de complementação quando aplicável.
RQ.051a: Incluir no checklist do analista os itens do cartaz (forma de acionar, 190, 180, A3/texto oficial) e a verificação do Sinal Vermelho a partir das fotos.
RQ.051b: Incluir checklist de Dados e fachada (cadastro da unidade + foto da fachada).
RQ.052: Impedir deferimento enquanto houver requisito obrigatório “não conforme”.
RQ.053: Permitir abrir diligência única com lista consolidada de pendências, prazo de 5 dias e notificação ao solicitante.
RQ.054: Registrar diligência respondida ou não respondida e retomar análise.
RQ.055: Permitir à autoridade deferir (emitir selo/certificado/QR, incluir na classe de estabelecimentos, notificar) ou indeferir (fundamentação + informação de recurso).
RQ.056: Após indeferimento, permitir registrar recurso e julgar (provido emite selo; não provido finaliza).
regras:
RN.050: Não deferir com item obrigatório “não conforme” (N/A em câmeras não bloqueia).
RN.051: Diligência é única: o analista lista todas as pendências de uma vez.
RN.052: Ausência de resposta à diligência não indeferir automaticamente.
RN.053: Deferimento gera número do selo, certificado eletrônico, QR Validador MT, datas de concessão e validade (concessão + 24 meses), status VIGENTE, inclusão na classe Estabelecimentos com Selo e notificações ao solicitante e ao servidor.
RN.054: Indeferimento exige parecer/fundamentação e informa o direito/recurso aplicável.
RN.055: Análise e Decisão permanecem na mesma classe de tela (protótipo SYDLE); Ajustes e Recurso são peças/formulários satélite.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nº protocolo | text | Não | Cabeçalho | Sistema | 2026/0001
Status | textOptions | Sim | AGUARDANDO ATENDIMENTO / EM ANÁLISE / EM DILIGÊNCIA / … / DEFERIDO / INDEFERIDO / EM RECURSO / FINALIZADO | Sistema / usuário | AGUARDANDO ATENDIMENTO
CNPJ / estabelecimento / município | text | Não | Leitura do pedido | Sistema | Dados da unidade
Analista responsável | text | Sim | Quem conduz a análise | Analista | Ana Analista
Data de abertura da análise | date | Não | Preenchida no Atender | Sistema | 12/09/2026
Prazo de análise / restante | text | Não | Até 30 dias; suspende em diligência | Sistema | 12 dias
Fluxo | alert | Não | Orientação FigJam §3–4 | Sistema | —
Atendimento | alert | Não | Visível na fila; oriente o método Atender | Sistema | —
Formulário de solicitação | embeddedReference | Sim | Embutido (form), somente leitura; acima dos campos de análise | Sistema | form-nen-solicitacao
Checklist — Dados e fachada | textOptions | Sim | Conforme / Não conforme / Necessita complementação | Analista | Conforme
Checklist — Enquadramento | textOptions | Sim | Idem | Analista | Conforme
Checklist — Equipe e capacitação | textOptions | Sim | Idem | Analista | Conforme
Checklist — Sinalização | textOptions | Sim | Idem (fotos banheiro + local) | Analista | Necessita complementação
Forma de acionar o Protocolo (cartaz) | textOptions | Sim | Idem; checklist analista (PDF; fora da solicitação) | Analista | Conforme
Telefone 190 no cartaz | textOptions | Sim | Idem | Analista | Conforme
Telefone 180 no cartaz | textOptions | Sim | Idem | Analista | Conforme
Formato A3 + texto oficial | textOptions | Sim | Idem | Analista | Necessita complementação
Checklist — Sinal Vermelho | textOptions | Sim | Idem; lei no cartaz (reunião 18/09) | Analista | Conforme
Checklist — Procedimentos | textOptions | Sim | Idem | Analista | Conforme
Checklist — Câmeras | textOptions | Sim | Conforme / Não conforme / Necessita complementação / N/A | Analista | N/A
Checklist — Declarações | textOptions | Sim | Idem (3 opções) | Analista | Conforme
Complementação — Dados e fachada | text | Condicional | Obrigatório se checklist = Necessita complementação | Analista | Reenviar fachada
Complementação — Enquadramento | text | Condicional | Idem | Analista | Esclarecer CNAE
Complementação — Equipe e capacitação | text | Condicional | Idem | Analista | Falta CTPS do capacitado X
Complementação — Sinalização | text | Condicional | Idem; também se item do cartaz = Necessita complementação | Analista | Foto A3 ilegível
Complementação — Sinal Vermelho | text | Condicional | Idem | Analista | —
Complementação — Procedimentos | text | Condicional | Idem | Analista | —
Complementação — Câmeras | text | Condicional | Idem | Analista | —
Complementação — Declarações | text | Condicional | Idem | Analista | —
Observações da análise | text | Não | Notas livres do analista | Analista | Texto
Documentos da análise | file | Não | Peças internas | Analista | parecer.pdf
Regra de conformidade | alert | Não | Lembrete: não deferir com não conforme | Sistema | —
Pendências da diligência (todas de uma vez) | text | Não | Lista consolidada ao abrir diligência | Analista | Lista
Prazo da diligência | text | Não | 5 dias | Sistema | 5 dias
Diligência | alert | Não | Orienta diligência única + notificação | Sistema | —
Notificação ao solicitante (diligência) | alert | Não | Disparada na abertura | Sistema | —
Formulário de Ajustes (diligência) | reference | Não | Peça do solicitante | Sistema | form-nen-ajustes
Parecer / fundamentação | text | Condicional | Obrigatório na decisão (Deferir/Indeferir) | Autoridade | Texto do parecer
Requisitos não atendidos | text | Condicional | Se indeferir | Autoridade | Lista
Fundamentos legais | text | Condicional | Sim se indeferir | Autoridade | Base legal
Data da decisão | date | Não | | Sistema / autoridade | 20/09/2026
Atenção | alert | Não | Gates de decisão; N/A câmeras não bloqueia | Sistema | —
Deferido | alert | Não | Efeitos do deferimento | Sistema | —
Selo / certificado | reference | Não | Registro gerado no deferimento | Sistema | Estabelecimentos com Selo
Indeferido | alert | Não | Efeitos do indeferimento | Sistema | —
Finalizado | alert | Não | Após não provido / encerramento | Sistema | —
Recurso | alert | Não | Orienta peça de recurso | Sistema | —
Peça / formulário de recurso | reference | Não | | Sistema | form-nen-recurso
Decisão do recurso | textOptions | Sim | Provido / Não provido (quando em julgamento) | Autoridade | Provido
Fundamentação do julgamento | text | Sim | No julgamento do recurso | Autoridade | Texto
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Atender | Destaque | Fila e status de trabalho | Se AGUARDANDO → EM ANÁLISE; abre modal com campos do status (form-nen-atender) | Início / retomada do atendimento
Salvar | Padrão | Análise | Grava progresso parcial | Analista
Abrir diligência | Destaque | Análise com pendências | Lista todas as pendências, status EM DILIGÊNCIA, notifica solicitante, suspende prazo | Diligência única; prazo 5 dias
Registrar diligência respondida | Padrão | Retorno do solicitante | Marca DILIGÊNCIA RESPONDIDA | —
Registrar diligência não respondida | Padrão | Fim do prazo sem resposta | Marca DILIGÊNCIA NÃO RESPONDIDA; segue para decisão com autos | Sem indeferimento automático
Retomar análise | Padrão | Após diligência | Volta ao checklist com novos elementos | —
Enviar para decisão | Destaque | Análise concluída | Encaminha à autoridade | Sem item obrigatório “não conforme” pendente de tratamento
Deferir | Destaque | Decisão | Emite certificado + QR + inclui na classe + VIGENTE + notifica solicitante e servidor | Gate de conformidade
Indeferir | Destaque | Decisão | Fundamenta e informa recurso | Parecer obrigatório
Baixar certificado | Destaque | Após deferimento | Download do certificado eletrônico | Solicitante / PROCON
Registrar recurso | Padrão | Após indeferimento | Abre EM RECURSO e peça de recurso | Solicitante no prazo
Julgar recurso | Destaque | Em recurso | Provido → emite selo; Não provido → FINALIZADO | Autoridade

classe 7: Formulário de Ajustes (diligência)
necessidade: Permitir que o estabelecimento complemente, em uma única rodada, todas as pendências indicadas pelo analista PROCON, no prazo de 5 dias, com texto de esclarecimento e anexos.
como é usado / contexto:
- Peça satélite da Análise e Decisão; status do pedido: EM DILIGÊNCIA.
- Abertura notifica o solicitante; resposta notifica o servidor PROCON.
- Sem resposta no prazo → DILIGÊNCIA NÃO RESPONDIDA (sem indeferimento automático).
requisitos:
RQ.060: Exibir a lista completa de pendências abertas pelo analista.
RQ.061: Permitir resposta textual e anexos complementares dentro do prazo de 5 dias.
RQ.062: Ao enviar complementação, marcar DILIGÊNCIA RESPONDIDA e notificar o servidor PROCON.
regras:
RN.060: Diligência única — todas as pendências na mesma peça.
RN.061: Prazo de 5 dias (Lei 7.692/2002); suspende a contagem do prazo de análise.
RN.062: Ausência de resposta não gera indeferimento automático.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Pendências listadas pelo analista | text | Não | Leitura; todas de uma vez | Analista / sistema | Lista consolidada
Prazo | text | Não | 5 dias a partir da abertura | Sistema | Até 17/09/2026
Resposta / esclarecimento | text | Sim | Esclarecimentos do solicitante | Solicitante | Texto
Anexos complementares | file | Condicional | Conforme pendência | Upload | foto-a3.jpg
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Enviar complementação | Destaque | EM DILIGÊNCIA dentro do prazo | Grava DILIGÊNCIA RESPONDIDA e notifica servidor | Solicitante

classe 8: Formulário de Recurso
necessidade: Permitir ao estabelecimento recorrer do indeferimento apresentando razões e anexos, e à autoridade PROCON julgar o recurso como provido (emite selo) ou não provido (finaliza o pedido).
como é usado / contexto:
- Peça satélite após indeferimento (FigJam §4: INDEFERIDO → Recurso?).
- Prazo do recurso: regra especial do decreto ou, na ausência, Lei 7.692/2002 — a confirmar na redação final.
- Julgamento provido produz os mesmos efeitos de deferimento (certificado, QR, lista, VIGENTE).
requisitos:
RQ.070: Permitir ao solicitante apresentar razões do recurso e anexos opcionais, mudando o status para EM RECURSO.
RQ.071: Permitir à autoridade registrar decisão Provido / Não provido com fundamentação.
RQ.072: Se provido, emitir selo com os mesmos efeitos do deferimento; se não provido, finalizar o pedido (FINALIZADO).
regras:
RN.070: Provido emite selo; não provido finaliza.
RN.071: Prazo e cabimento do recurso: confirmar no decreto (ou subsidiariamente Lei 7.692/2002).
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Razões do recurso | text | Sim | Fundamentação do solicitante | Solicitante | Texto
Anexos | file | Não | Documentos de suporte | Upload | prova.pdf
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Apresentar recurso | Destaque | Após indeferimento | Abre EM RECURSO | Solicitante no prazo

(Nota: Decisão do recurso e fundamentação do julgamento ficam na Análise e Decisão — método Julgar recurso.)

classe 9: Estabelecimentos com Selo
necessidade: Manter o cadastro dos estabelecimentos certificados (“Local Seguro para Mulheres”), incluindo os dados do certificado eletrônico (número, validade, QR Validador MT) e refletir automaticamente deferimento, expiração, cancelamento a pedido e revogação; no MVP, servir de base para consulta, filtro, exportação e download do certificado.
como é usado / contexto:
- Seção 5 do FigJam (emissão): Validador MT · Classe Estabelecimentos · Notifica servidor · Notifica solicitante · VIGENTE.
- O certificado do estabelecimento (não do funcionário) é gerado no deferimento / recurso provido e vive nesta classe (não há classe separada de template).
- Validade = concessão + 24 meses (divergência FigJam 12 meses documentada na visão geral).
- Arte visual final: pendência SECOM / Gabinete da Mulher.
- Lista pública via API em outros sites: fase futura; no MVP usa analytics/relatório/exportação.
- Atalhos para cancelar a pedido, revogar e iniciar renovação conforme perfil.
requisitos:
RQ.080: Ao deferir (ou julgar recurso provido), criar/atualizar registro com número do selo, dados da unidade, datas, QR Validador MT e status VIGENTE.
RQ.081: Atualizar o registro em expiração (EXPIRADO), cancelamento a pedido (CANCELADO A PEDIDO) e revogação (REVOGADO), removendo da lista pública/relatório de vigentes.
RQ.082: Permitir filtrar, exportar e baixar o certificado eletrônico.
RQ.083: Integrar o QR ao Validador MT para consulta de autenticidade pelo cidadão.
regras:
RN.080: Status inicial do selo: VIGENTE.
RN.081: Validade = data de concessão + 24 meses até o decreto definir em contrário.
RN.082: QR/consulta não deve indicar vigência após EXPIRADO, CANCELADO A PEDIDO ou REVOGADO.
RN.083: Arte do selo fora do escopo de desenvolvimento (pendência externa).
RN.084: API de lista pública fora do MVP.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Nome fantasia | text | Não | Público se vigente | Sistema | Nome fantasia
CNPJ | text | Não | | Sistema | 00.000.000/0001-00
Endereço | text | Não | | Sistema | Rua X, 100
Município | text | Não | | Sistema | Cuiabá
Número do selo | text | Não | Único; gerado no deferimento | Sistema | SELO-2026-0001
Data de concessão | date | Não | | Sistema | 10/09/2026
Validade | date | Não | Concessão + 24 meses | Sistema | 10/09/2028
QR Code (Validador MT) | text | Não | Link/código Validador MT | Sistema / Validador MT | URL/QR
Status | textOptions | Não | VIGENTE / EXPIRADO / CANCELADO A PEDIDO / REVOGADO | Sistema | VIGENTE
Escopo pós-concessão | alert | Não | Renovar / cancelar / revogar | Documentação | —
Notificações na emissão (FigJam §5) | alert | Não | Notifica servidor e solicitante | Sistema | —
Lista pública | alert | Não | MVP = relatório/exportação; API depois | Documentação | —
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Filtrar | Padrão | Lista | Filtra por status, município, validade etc. | Perfis PROCON
Exportar | Destaque | Lista/analytics | Exporta planilha | —
Baixar certificado | Destaque | Selo emitido | Download do documento eletrônico | Solicitante / PROCON
Cancelar a pedido | Padrão | Selo VIGENTE | Atalho para Cancelamento | Solicitante
Revogar | Padrão | Selo VIGENTE | Atalho para Revogação | Perfil PROCON autorizado
Iniciar renovação | Padrão | Próximo ao vencimento / vigente | Atalho para Renovação | Solicitante

classe 10: Formulário de Renovação
necessidade: Permitir a renovação do selo vigente (validade 24 meses) com formulário pré-preenchido a partir dos dados cadastrais e do último pedido, notificação prévia de vencimento e o mesmo fluxo de análise → diligência → decisão → recurso no que couber.
como é usado / contexto:
- Seção 6 do FigJam: aviso de vencimento → Renovar.
- Dados cadastrais vêm pré-preenchidos; demais blocos revalidam condições e exigem fotos/evidências atualizadas quando aplicável.
- Efeito jurídico se a renovação for tempestiva e o selo vencer antes da decisão: a confirmar na reunião/decreto.
requisitos:
RQ.090: Notificar o estabelecimento próximo ao vencimento do selo.
RQ.091: Abrir renovação com dados cadastrais pré-preenchidos e revalidação dos blocos de conformidade.
RQ.092: Protocolar a renovação e tramitar pelo mesmo fluxo de Análise e Decisão (diligência, deferimento/indeferimento, recurso) no que couber.
RQ.093: Em caso de deferimento da renovação, emitir novo período de validade (nova concessão + 24 meses) e manter/atualizar o registro em Estabelecimentos com Selo.
regras:
RN.090: Mesmo fluxo de análise da solicitação inicial, no que couber.
RN.091: Efeito da renovação tempestiva com selo vencido antes da decisão: pendência de negócio.
RN.092: Validade permanece 24 meses até o decreto fechar (FigJam 12 meses = divergência).
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Número do selo vigente | text | Não | Leitura do selo atual | Sistema | SELO-2026-0001
Validade atual | date | Não | | Sistema | 10/09/2028
Aviso | alert | Não | Orienta revalidação e fotos atualizadas | Sistema | —
Alterações a declarar | text | Não | Mudanças desde a concessão | Solicitante | Novo endereço
Status da renovação | textOptions | Não | Espelha status do pedido de renovação | Sistema | PROTOCOLADO
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Iniciar renovação | Destaque | Próximo ao vencimento / vigente | Abre formulário pré-preenchido | Notificação prévia
Protocolar renovação | Destaque | Revisão | Protocola como renovação | Mesmo fluxo de análise

classe 11: Cancelamento de Selo
necessidade: Permitir que o estabelecimento solicite voluntariamente o cancelamento do selo vigente, com confirmação, motivo opcional, mudança de status para CANCELADO A PEDIDO e retirada da lista pública/relatório de vigentes.
como é usado / contexto:
- Seção 6 do FigJam: Cancelar (voluntário).
- Distinto da revogação administrativa (que é ato do PROCON).
- Após cancelar, o QR/consulta não deve indicar vigência.
requisitos:
RQ.100: Permitir ao solicitante confirmar o cancelamento do selo vigente.
RQ.101: Ao confirmar, alterar status para CANCELADO A PEDIDO, remover da lista de vigentes e invalidar indicação de vigência no Validador MT.
regras:
RN.100: Cancelamento é voluntário; não se confunde com revogação.
RN.101: Motivo é opcional.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Selo | text | Não | Identificação do selo a cancelar | Sistema | SELO-2026-0001
Confirmação de cancelamento | boolean | Sim | Deve estar marcado | Solicitante | Sim
Motivo (opcional) | text | Não | | Solicitante | Encerramento da atividade
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Cancelar selo | Destaque | Selo VIGENTE | Marca CANCELADO A PEDIDO e remove da lista | Solicitante

classe 12: Revogação de Selo
necessidade: Permitir que o PROCON, a qualquer momento, marque um selo concedido como REVOGADO, anexando a decisão ou cópia do procedimento interno (ex.: Sigadoc), atualizando status, retirando da lista pública e fazendo o QR deixar de indicar vigência, sem notificação automática no sistema do selo e sem módulo de denúncia nesta entrega.
como é usado / contexto:
- Decisão de escopo 10/09: apuração da irregularidade não ocorre neste sistema; empresa já foi cientificada no procedimento externo.
- Sistema só operacionaliza: anexo + status REVOGADO + saída da lista.
- Sem integração Sigadoc / Procon Digital nesta entrega (upload manual da cópia).
- Gatilho automático por condenação consumerista: ideia de decreto, não decidido.
- Perfil PROCON autorizado a revogar: a confirmar.
requisitos:
RQ.110: Permitir ao perfil PROCON autorizado selecionar estabelecimento/selo VIGENTE e anexar documento da decisão/processo.
RQ.111: Ao revogar: status REVOGADO; sai da lista pública; QR/consulta não vigente; sem notificação automática no sistema do selo.
RQ.112: Não implementar módulo de denúncia/fiscalização/apuração nesta entrega.
regras:
RN.110: Revogação administrativa operacional (anexo + status), sem tramitar apuração neste sistema.
RN.111: Sem notificação automática no sistema do selo (ciência ocorre no procedimento externo).
RN.112: Gatilho automático por condenação consumerista: não decidido.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Estabelecimento / selo | text | Sim | Selo VIGENTE | Sistema / PROCON | SELO-2026-0001
Documento da decisão / processo | file | Sim | Cópia Sigadoc ou equivalente | Upload PROCON | decisao.pdf
Justificativa / referência do processo | text | Sim | Nº processo / fundamento resumido | PROCON | Proc. 123/2026
Data da revogação | date | Sim | | Sistema / usuário | 11/09/2026
Atenção | alert | Não | Sem denúncia no sistema; sem notificação automática | Sistema | —
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Revogar selo | Destaque | Selo VIGENTE | Marca REVOGADO; sai da lista; QR não vigente | Sem notificação automática; perfil autorizado

classe 13: Analytics / relatórios
necessidade: Disponibilizar indicadores e exportação do processo de solicitação e da classe de estabelecimentos com selo, com filtros por período e dimensões (município, atividade, status), substituindo no MVP a API de lista pública.
como é usado / contexto:
- Indicadores de denúncia/apuração do PDF original §§16–19: fora do escopo (decisão 10/09).
- Serve à gestão PROCON e à consulta/exportação da lista de vigentes no MVP.
requisitos:
RQ.120: Exibir indicadores do processo: protocolados, em análise, em diligência, deferidos, indeferidos, tempo médio.
RQ.121: Exibir indicadores da classe de selo: vigentes, próximos do vencimento, renovados, expirados, cancelados a pedido, revogados; distribuição por município/atividade.
RQ.122: Permitir filtrar por período e exportar planilha.
RQ.123: Não incluir indicadores de denúncia/apuração nesta entrega.
regras:
RN.120: Sem indicadores de denúncia/apuração nesta entrega.
RN.121: Exportação atende o uso de lista pública no MVP até existir API.
campos:
Campo | Tipo | Obrigatório | Regras do campo | Modo de uso | Exemplo
Protocolados | number | Não | Contagem do processo | Sistema | 120
Em análise | number | Não | Contagem do processo | Sistema | 15
Em diligência | number | Não | Contagem do processo | Sistema | 4
Deferidos | number | Não | Contagem do processo | Sistema | 80
Indeferidos | number | Não | Contagem do processo | Sistema | 10
Tempo médio | number | Não | Dias até decisão | Sistema | 12
Vigentes | number | Não | Classe selo | Sistema | 75
Próximos do vencimento | number | Não | Classe selo | Sistema | 8
Renovados | number | Não | Classe selo | Sistema | 20
Expirados | number | Não | Classe selo | Sistema | 5
Cancelados a pedido | number | Não | Classe selo | Sistema | 2
Revogados | number | Não | Classe selo | Sistema | 1
Distribuição por município/atividade | text | Não | Tabela/gráfico | Sistema | Cuiabá: 40
métodos:
Método | Tipo | Quando aparece/usa | Funcionalidade | Regra
Filtrar por período | Padrão | Analytics | Aplica filtros | —
Exportar planilha | Destaque | Analytics | Download | —
