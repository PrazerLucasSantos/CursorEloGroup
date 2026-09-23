#!/usr/bin/env node
/**
 * Demanda Completa + Contrato + OS:
 * - move Contrato (embedded) para Dados da Demanda
 * - reordena campos por aba (edição/visualização)
 * - remove "(CD-xxx)" dos labels e títulos de seção
 * - preenche detalhamento (spec): função/regra OU "não faz sentido"
 *
 * Depois: node scripts/patch-demanda-portal-classes-cliente-parceiro.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')

const NS = 'Não faz sentido nesta fase da Demanda (F3 · consumo/suporte).'

function stripCd(label) {
  if (typeof label !== 'string') return label
  return label
    .replace(/\s*\(CD-[0-9]+(?:[·.][0-9]+)?(?:…[0-9]+)?\)/gi, '')
    .replace(/\s*CD-[0-9]+(?:…[0-9]+)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function specOk(fn, regra, extra = '') {
  return [
    `Função: ${fn.trim()}`,
    `Regra: ${regra.trim()}`,
    extra ? extra.trim() : '',
  ]
    .filter(Boolean)
    .join('\n')
    .trim()
}

function specNo(motivo) {
  return `**${NS}**\n\n${motivo.trim()}`
}

/** Ordem canônica por seção (sufixo após patlasv4proto-demc-). */
const SECTION_ORDER = [
  'sec-demc-andamento',
  'sec-demc-identificacao',
  'sec-demc-fila',
  'sec-demc-parceiro',
  'sec-demc-analise-tipo',
  'sec-demc-atendimento',
  'sec-demc-assinaturas',
  'sec-demc-entregavel',
  'sec-demc-os-orc',
  'sec-demc-historico',
  'sec-demc-vinculos',
  'sec-demc-projeto',
  'sec-demc-indefinidos',
]

const FIELD_ORDER = {
  'sec-demc-andamento': [
    'sla-inicio',
    'sla-exec-inicio',
    'sla-status',
    'sla-exec-status',
    'estagio-timeline',
    'prazo-declarado',
    'sla-fim',
    'tempo-total-sla',
    'sla-assinatura-orcamento',
  ],
  'sec-demc-identificacao': [
    'numero',
    'status',
    'data-evento',
    'origem',
    'solicitante',
    'nivel-solicitante',
    'tipo',
    'cliente',
    'contato',
    'contato-numero',
    'contato-sec',
    'produto',
    'contrato-natureza',
    'ref-contrato',
    'descricao',
    'observacoes',
    'anexos',
  ],
  'sec-demc-fila': [
    'suporte-24x7',
    'fila-regra',
    'resp-gerente',
    'resp-titular',
    'subst-1',
    'subst-2',
    'suporte-grupo',
    'org-usuario',
    'tipo-organizacao',
    'cargo-usuario',
    'gerente-area',
    'indisponibilidade',
    'pos-venda',
  ],
  'sec-demc-parceiro': [
    'parceiro-notificado',
    'parceiro-nome',
    'qualificado',
    'modalidade-parceiro',
    'manifestacao-parceiro',
  ],
  'sec-demc-analise-tipo': [
    'tipo-analise',
    'modalidade-servico',
    'entregavel-forma',
    'prazo-execucao',
    'fabricante',
  ],
  'sec-demc-atendimento': [
    'catalogos',
    'itens',
    'desc-atendimento',
    'via-valores',
    'deliberacao-mti',
    'motivo',
    'motivo-rejeicao',
    'saldo-contabilizar',
  ],
  'sec-demc-assinaturas': [
    'gestor-cliente',
    'fiscal-cliente',
    'assina-gestor',
    'assina-fiscal',
    'assina-solicitante',
    'assina-em',
    'assinantes',
    'status-assinatura-individual',
    'responsavel-assinatura-pendente',
    'conclusao-assinaturas',
  ],
  'sec-demc-entregavel': [
    'termo-homologacao',
    'homolog-status',
    'homolog-assinado',
    'entregavel-desc',
    'itens-os-termo',
    'atividades-executadas',
    'artefatos-entrega',
    'comp-anexos',
    'credencial-acesso',
    'appliance',
    'outro-comprovante',
    'consumo-estimado',
    'consumo-realizado',
    'ateste-execucao',
    'evolucao-projeto',
    'homolog-ajuste',
    'homolog-ajuste-por',
    'raer-documento',
    'raer-status',
    'raer-obs',
  ],
  'sec-demc-os-orc': [
    'orc-numero',
    'detalhamento-orcamento',
    'qtd-solicitada',
    'orc-assinatura-cliente',
    'orc-assinatura-gerente-area',
    'decisao-cliente-orcamento',
    'forma-pagamento',
    'situacao-definir-pagar',
    'proposta-nova-contratacao',
    'ref-oses-operacional',
  ],
  'sec-demc-historico': ['historico-eventos', 'ultimo-evento', 'historico-alteracoes'],
  'sec-demc-vinculos': ['ref-orcamentos', 'ref-oses'],
  'sec-demc-projeto': [
    'projeto',
    'epicos',
    'historias',
    'qtd-historias',
    'sprints',
    'atividades',
    'quantitativos-servicos',
    'status-andamento-exec',
    'pct-execucao-projeto',
    'prazos-previsao',
  ],
  'sec-demc-indefinidos': [
    'nec',
    'status-iccu',
    'satisfacao-usuario',
    'qtd-propostas-contratacao',
    'capacidade-ociosa',
    'atividades-nova-contratacao',
  ],
}

const SPECS = {
  'sla-inicio': specOk(
    'Marca o início da contagem do prazo da demanda (SLA da demanda).',
    'Preenchido no registro da abertura. Inclusive em suporte. Não confundir com o início do SLA de execução (autorização).',
  ),
  'sla-exec-inicio': specOk(
    'Marca o início da contagem do prazo de execução.',
    'Inicia na autorização da execução no Atlas (após via contrato/OS/orçamento conforme o rito). Distinto da Data da Solicitação.',
  ),
  'sla-status': specOk(
    'Situação do SLA da demanda (no prazo, risco, estourado, dilatado).',
    'Derivado da contagem desde a abertura. Regras finas de pausa/calendário ainda em definição (PD15).',
  ),
  'sla-exec-status': specOk(
    'Situação do SLA de execução.',
    'Derivado da contagem desde a autorização da execução. Independente do status do SLA da demanda.',
  ),
  'estagio-timeline': specOk(
    'Indica o estágio atual na linha do tempo compartilhada (cliente, parceiro e MTI).',
    'Deve tornar evidente em que ponto do processo a demanda está. Enumeração ilustrativa; vocabulário final em PD20.',
  ),
  'prazo-declarado': specOk(
    'Prazo declarado associado à demanda.',
    'Apresentado no acompanhamento; relação com dilatação e calendário sujeita a PD15.',
  ),
  'sla-fim': specOk(
    'Marca o fim da contagem do SLA da demanda.',
    'Preenchido quando a contagem é encerrada (conclusão ou desfecho). Critérios finos em PD15.',
  ),
  'tempo-total-sla': specOk(
    'Tempo total apurado da contagem da demanda.',
    'Calculado a partir do início e do fim do SLA; fórmula de pausas pendente.',
  ),
  'sla-assinatura-orcamento': specOk(
    'Prazo/SLA específico do ciclo de assinatura do orçamento.',
    'Aplicável no caminho de orçamento. Não substitui o SLA da demanda nem o de execução.',
  ),

  numero: specOk(
    'Identificador da demanda exibido na listagem e na consulta.',
    'Gerado pelo sistema na abertura. Forma de geração não detalhada na fonte; somente leitura após criar.',
  ),
  status: specOk(
    'Situação operacional atual da demanda no rito F3.',
    'Controlado pelo fluxo (ações de cliente, parceiro e MTI). Vocabulário de estados em evolução (PD20). Direciona métodos e abas visíveis.',
  ),
  'data-evento': specOk(
    'Referência temporal apresentada no bloco de identificação na abertura.',
    'Exibida bloqueada junto aos dados do solicitante. Origem temporal a confirmar (PD04).',
  ),
  origem: specOk(
    'Canal/perfil que abriu a demanda: Cliente, Parceiro ou MTI.',
    'Contextual. Influencia permissões e preenchimento inicial do solicitante/organização.',
  ),
  solicitante: specOk(
    'Usuário que solicita a demanda.',
    'No portal do cliente: preenchido com o usuário logado e bloqueado. Para parceiro/MTI a fonte ainda não fecha a regra de determinação (PD03/PD04).',
  ),
  'nivel-solicitante': specOk(
    'Classificação do cenário do solicitante (ex.: nível 2 → aprovação gestor/fiscal).',
    'Condicional. Dispara ou não a trilha de aprovação interna do cliente. Definição completa em PD02.',
  ),
  tipo: specOk(
    'Tipo da demanda: Consumo ou Suporte.',
    'Primeira seleção do processo. Define encaminhamento e regime. Licenciamento/serviço não substituem este campo; projeto não é terceiro valor confirmado.',
  ),
  cliente: specOk(
    'Organização cliente solicitante vinculada à demanda.',
    'Obrigatório no registro. Base para hierarquia, contratos e papéis (gestor/fiscal).',
  ),
  contato: specOk(
    'Contato principal da solicitação.',
    'Preenchido automaticamente e bloqueado na abertura (canal cliente).',
  ),
  'contato-numero': specOk(
    'Número/telefone do contato principal.',
    'Automático e bloqueado na abertura. Formato não definido (PD04).',
  ),
  'contato-sec': specOk(
    'Contato adicional informado na abertura.',
    'Único campo tipicamente editável do bloco de identificação. Opcional (provisório).',
  ),
  produto: specOk(
    'Solução/produto ao qual a necessidade se refere.',
    'Sua seleção dispara o contexto contratual (número, vigência, saldos etc.). Escolha entre múltiplos contratos compatíveis ainda não detalhada (PD05).',
  ),
  'contrato-natureza': specOk(
    'Natureza da cobertura do atendimento: próprio do cliente, patrocinado ou sem contrato.',
    'Define o caminho comercial/contratual. “Sem contrato” segue trilha distinta (orçamento/viabilização). Patrocinado exige dados do patrocinador.',
  ),
  'ref-contrato': specOk(
    'Contrato(s) vinculados à demanda (classe satélite Contrato da Demanda).',
    'Exibido após a solução/natureza quando há cobertura contratual. Campos do grid (número, nome, natureza, vigência, partes, status) são do contrato, não duplicar soltos na Demanda. Linha adicionável conforme o vínculo identificado.',
  ),
  descricao: specOk(
    'Descrição da necessidade do solicitante.',
    'Obrigatória. Sem descrição o preenchimento mínimo da abertura não é atendido.',
  ),
  observacoes: specOk(
    'Complemento opcional à descrição.',
    'Pode permanecer vazia. Não substitui a descrição obrigatória.',
  ),
  anexos: specOk(
    'Arquivos que complementam a solicitação na abertura.',
    'Sempre exibido. Limites de formato/tamanho/quantidade ainda não definidos (PD03).',
  ),

  'suporte-24x7': specOk(
    'Indica se o suporte exige regime 24×7 / sobreaviso.',
    'Influencia a regra de fila/grupo de suporte. Aplicável sobretudo a Tipo = Suporte.',
  ),
  'fila-regra': specOk(
    'Regra automática de roteamento da fila (consumo × suporte).',
    'Derivada do tipo e metadados (parceria, 24×7 etc.). Consumo tende a gerente/titular; suporte a grupo/squad.',
  ),
  'resp-gerente': specOk(
    'Gerente da parceria responsável pelo acompanhamento.',
    'Papel da fila de consumo/parceria. Usado em roteamento e escalonamento.',
  ),
  'resp-titular': specOk(
    'Responsável titular do atendimento/OS.',
    'Titular operacional da demanda na fila. Substitutos cobrem indisponibilidade.',
  ),
  'subst-1': specOk(
    'Primeiro substituto do titular.',
    'Entra na cadeia de cobertura quando o titular está indisponível.',
  ),
  'subst-2': specOk(
    'Segundo substituto; na prática tende a ser o gerente.',
    'Último nível da cadeia de substituição descrita para a fila.',
  ),
  'suporte-grupo': specOk(
    'Grupo/squad de suporte destinatário da demanda.',
    'Usado quando Tipo = Suporte (em vez da fila de parceria de consumo).',
  ),
  'org-usuario': specOk(
    'Organização do usuário no contexto de papéis.',
    'Suporta regras de aprovação e visibilidade ligadas à organização cliente/parceiro/MTI.',
  ),
  'tipo-organizacao': specOk(
    'Tipo da organização (ex.: cliente) para regras de aprovação.',
    'Condicional às regras de papel. Ajuda a reconhecer a organização na aprovação.',
  ),
  'cargo-usuario': specOk(
    'Cargo/papel do usuário (gestor, fiscal, gerente etc.).',
    'Condicional. Determina ações disponíveis na hierarquia e nas assinaturas.',
  ),
  'gerente-area': specOk(
    'Gerente da área/operação envolvido em OS e autorizações.',
    'Atua em ritos de orçamento/OS (ex.: assinatura do gerente de operação).',
  ),
  indisponibilidade: specOk(
    'Indica indisponibilidade/férias que afeta a fila.',
    'Dispara uso de substitutos na cadeia de responsáveis.',
  ),
  'pos-venda': specOk(
    'Responsável de pós-venda quando aplicável.',
    'Papel citado na fonte; uso operacional conforme o rito de suporte/consumo.',
  ),

  'parceiro-notificado': specOk(
    'Indica se o parceiro já foi notificado da demanda.',
    'Marca o avanço para a etapa em que o parceiro pode iniciar/efetivar.',
  ),
  'parceiro-nome': specOk(
    'Parceiro(s) vinculados ao atendimento.',
    'Identifica quem pode efetivar/iniciar no portal do parceiro.',
  ),
  qualificado: specOk(
    'Indica se a MTI já qualificoui/liberou o enquadramento.',
    'Após qualificação, liberam-se caminhos (parceiro efetivar, via contrato, orçamento).',
  ),
  'modalidade-parceiro': specOk(
    'Modalidade de atuação dos parceiros no atendimento.',
    'Condicional à parceria. Afeta como o parceiro participa do rito.',
  ),
  'manifestacao-parceiro': specOk(
    'Registro da manifestação do parceiro (concordância, início, efetivação).',
    'No portal do parceiro a “análise” corresponde a efetivar/iniciar (“bater ponto”), não a parecer substitutivo da MTI.',
  ),

  'tipo-analise': specOk(
    'Natureza da análise: licenciamento ou serviço (automação/derivação).',
    'Condicional. Altera campos exigidos (comprovação de disponibilização × prazo/OS de serviço).',
  ),
  'modalidade-servico': specOk(
    'Modalidade do serviço (com ou sem projeto).',
    'Condicional a serviço. Quando há projeto, habilita acompanhamento de execução/projeto.',
  ),
  'entregavel-forma': specOk(
    'Forma do entregável no licenciamento (como se comprova a disponibilização).',
    'Condicional a licenciamento. Relaciona credencial, appliance ou outro comprovante.',
  ),
  'prazo-execucao': specOk(
    'Prazo de execução associado ao serviço/OS.',
    'Condicional a serviço. Alimenta acompanhamento e dilatação.',
  ),
  fabricante: specOk(
    'Fabricante envolvido quando o objeto exige.',
    'Condicional. Usado em cenários de licenciamento/produto com fabricante.',
  ),

  catalogos: specOk(
    'Catálogos pertinentes ao atendimento.',
    'Condicional ao contrato/solução. Base para seleção de itens.',
  ),
  itens: specOk(
    'Itens de catálogo consumidos ou executados.',
    'Detalha o que será atendido; base para valores, OS e termo.',
  ),
  'desc-atendimento': specOk(
    'Descreve como o atendimento será realizado.',
    'Preenchido na análise/qualificação. Visível a MTI e parceiro.',
  ),
  'via-valores': specOk(
    'Valores/contabilidade associados à via contratual.',
    'Usado quando o caminho é via contrato (contabilização de execução).',
  ),
  'deliberacao-mti': specOk(
    'Decisão final da MTI na análise.',
    'Registra a deliberação definitiva (diferente da manifestação do parceiro).',
  ),
  motivo: specOk(
    'Motivo da devolução para correção.',
    'Obrigatório ao devolver. Explica o que o solicitante/operação deve corrigir.',
  ),
  'motivo-rejeicao': specOk(
    'Justificativa da rejeição da demanda.',
    'Condicional ao recusar. Abrangência da obrigatoriedade a validar na fonte.',
  ),
  'saldo-contabilizar': specOk(
    'Saldo/consumo a contabilizar no atendimento.',
    'Condicional. Fórmula pendente; ligado aos indicadores contratuais.',
  ),

  'gestor-cliente': specOk(
    'Gestor do cliente na cadeia de aprovação/assinatura.',
    'Papel da organização cliente (nível 2 / via contrato).',
  ),
  'fiscal-cliente': specOk(
    'Fiscal do cliente na cadeia de aprovação/assinatura.',
    'Papel da organização cliente. Sequência com o gestor ainda em PD07.',
  ),
  'assina-gestor': specOk(
    'Indica se o gestor do cliente assinou o atendimento via contrato.',
    'Obrigatório no rito de assinaturas antes de contabilizar execução na via contrato.',
  ),
  'assina-fiscal': specOk(
    'Indica se o fiscal do cliente assinou o atendimento via contrato.',
    'Integra o conjunto gestor + fiscal + solicitante.',
  ),
  'assina-solicitante': specOk(
    'Indica se o solicitante assinou o atendimento via contrato.',
    'Fecha o trio de assinaturas do atendimento via contrato.',
  ),
  'assina-em': specOk(
    'Data/marco em que as assinaturas do atendimento foram concluídas.',
    'Registrado ao concluir o conjunto de assinaturas.',
  ),
  assinantes: specOk(
    'Lista dos assinantes envolvidos no ciclo atual.',
    'Apoia acompanhamento de pendências individuais.',
  ),
  'status-assinatura-individual': specOk(
    'Status de cada assinatura (pendente, assinada, etc.).',
    'Permite ver com quem está a pendência.',
  ),
  'responsavel-assinatura-pendente': specOk(
    'Quem detém a próxima assinatura pendente.',
    'Derivado do status individual; guia cobrança/acompanhamento.',
  ),
  'conclusao-assinaturas': specOk(
    'Flag de conclusão do conjunto de assinaturas.',
    'Quando verdadeiro, libera o avanço do rito (execução/OS conforme o caminho).',
  ),

  'termo-homologacao': specOk(
    'Referência/identificação do termo de homologação.',
    'Composto na conclusão técnica para aceite do cliente.',
  ),
  'homolog-status': specOk(
    'Status do termo (não iniciado, aguardando, recusado, formalizado).',
    'Acompanha o ciclo de assinatura do termo.',
  ),
  'homolog-assinado': specOk(
    'Indica se a homologação foi assinada.',
    'Condição de desfecho “efetivado/entregue”.',
  ),
  'entregavel-desc': specOk(
    'Declaração do que foi entregue.',
    'Conteúdo do termo/comprovação da entrega.',
  ),
  'itens-os-termo': specOk(
    'Itens da OS refletidos no termo.',
    'Garante rastreio entre OS e homologação.',
  ),
  'atividades-executadas': specOk(
    'Atividades executadas reportadas na entrega.',
    'Evidência descritiva da execução.',
  ),
  'artefatos-entrega': specOk(
    'Arquivos/artefatos que comprovam a entrega.',
    'Anexos de entrega distintos dos anexos da abertura.',
  ),
  'comp-anexos': specOk(
    'Anexos de comprovação da disponibilização/entrega.',
    'Condicional (licenciamento/comprovação). Limites em PD19.',
  ),
  'credencial-acesso': specOk(
    'Credencial de acesso quando a forma do entregável exige.',
    'Condicional a licenciamento/disponibilização.',
  ),
  appliance: specOk(
    'Appliance disponibilizado, quando aplicável.',
    'Condicional à forma do entregável.',
  ),
  'outro-comprovante': specOk(
    'Outro comprovante de disponibilização.',
    'Condicional quando credencial/appliance não cobrem o caso.',
  ),
  'consumo-estimado': specOk(
    'Consumo estimado associado à entrega.',
    'Indicador de acompanhamento; fórmula a confirmar.',
  ),
  'consumo-realizado': specOk(
    'Consumo realizado apurado na entrega.',
    'Pode divergir do estimado; base para ateste.',
  ),
  'ateste-execucao': specOk(
    'Ateste da execução pelo responsável competente.',
    'Formaliza o aceite técnico da execução.',
  ),
  'evolucao-projeto': specOk(
    'Texto/resumo da evolução do projeto na entrega.',
    'Condicional a serviço com projeto.',
  ),
  'homolog-ajuste': specOk(
    'Indica solicitação de ajuste do termo.',
    'Cliente ou MTI podem pedir ajuste; tratamento de versão/assinaturas em PD21.',
  ),
  'homolog-ajuste-por': specOk(
    'Quem solicitou o ajuste do termo.',
    'Complementa a flag de ajuste.',
  ),
  'raer-documento': specOk(
    'Documento RAE/RAER associado.',
    'Citado junto ao termo; definição fina do artefato ainda parcial.',
  ),
  'raer-status': specOk(
    'Status do RAER no ciclo de encerramento.',
    'Acompanha pendência/conclusão do RAER com o termo.',
  ),
  'raer-obs': specOk(
    'Observação ou vínculo textual do RAER.',
    'Complemento livre ao documento/status do RAER.',
  ),

  'orc-numero': specOk(
    'Identificador do orçamento relacionado à demanda.',
    'Usado no caminho sem cobertura direta / sob demanda.',
  ),
  'detalhamento-orcamento': specOk(
    'Detalhamento da proposta orçamentária.',
    'Base para decisão do cliente e geração de OS.',
  ),
  'qtd-solicitada': specOk(
    'Quantidade solicitada no orçamento/itens.',
    'Pode divergir na execução; divergência devolve a demanda para correção.',
  ),
  'orc-assinatura-cliente': specOk(
    'Assinatura do cliente no orçamento.',
    'Condição para avançar no caminho de orçamento.',
  ),
  'orc-assinatura-gerente-area': specOk(
    'Assinatura do gerente de área no orçamento.',
    'Parte da cadeia de formalização orçamentária.',
  ),
  'decisao-cliente-orcamento': specOk(
    'Decisão do cliente sobre o orçamento (aceitar, recusar, etc.).',
    'Direciona autorização de OS ou encerramento/não autorização.',
  ),
  'forma-pagamento': specOk(
    'Forma de pagamento/viabilização quando não há contrato próprio.',
    'Caminho comercial; pode ligar a “definir como pagar”.',
  ),
  'situacao-definir-pagar': specOk(
    'Situação do stub “definir como pagar” (indenização × contratar).',
    'Provisório/futuro CRM. Usar com cautela no protótipo F3.',
  ),
  'proposta-nova-contratacao': specOk(
    'Proposta de nova contratação quando a viabilização exige.',
    'Caminho alternativo sem contrato vigente adequado.',
  ),
  'ref-oses-operacional': specOk(
    'OS vinculada(s) operacionalmente à demanda (classe satélite).',
    'Preferir este vínculo em vez de espelhar todos os campos de OS na Demanda.',
  ),

  'historico-eventos': specOk(
    'Histórico de movimentos e ações da demanda.',
    'Sempre disponível na consulta. Registra efetivadas, devoluções e alterações.',
  ),
  'ultimo-evento': specOk(
    'Resumo/destaque do movimento mais recente.',
    'Exibido quando existe histórico anterior.',
  ),
  'historico-alteracoes': specOk(
    'Histórico de alterações de dados (auditoria).',
    'Complementa o histórico de eventos de processo.',
  ),

  'ref-orcamentos': specOk(
    'Orçamentos vinculados (embedded).',
    'Atalho de navegação/consulta aos orçamentos da demanda.',
  ),
  'ref-oses': specOk(
    'Ordens de serviço vinculadas (embedded).',
    'Atalho de navegação/consulta às OS da demanda.',
  ),

  projeto: specOk(
    'Projeto relacionado quando o serviço tem estrutura de projeto.',
    'Condicional. Dados de andamento podem vir de sistema integrado (PD18/PD24).',
  ),
  epicos: specOk(
    'Épicos do projeto relacionado.',
    'Condicional a serviço com projeto. Detalhamento fino de integração pendente.',
  ),
  historias: specOk(
    'Histórias do projeto relacionado.',
    'Condicional a serviço com projeto.',
  ),
  'qtd-historias': specOk(
    'Quantidade de histórias.',
    'Indicador derivado/informativo do projeto.',
  ),
  sprints: specOk(
    'Sprints do projeto.',
    'Condicional a serviço com projeto.',
  ),
  atividades: specOk(
    'Atividades de projeto/execução.',
    'Condicional. Pode sobrepor-se a atividades da entrega — manter coerência com o termo/OS.',
  ),
  'quantitativos-servicos': specOk(
    'Quantitativos de serviços do projeto.',
    'Condicional. Apoia medição de execução.',
  ),
  'status-andamento-exec': specOk(
    'Status do andamento da execução/projeto.',
    'Condicional à execução; pode ser alimentado por integração.',
  ),
  'pct-execucao-projeto': specOk(
    'Percentual de execução do projeto.',
    'Condicional. Fórmula/fonte a confirmar.',
  ),
  'prazos-previsao': specOk(
    'Prazos e previsão de conclusão do projeto.',
    'Condicional. Apoia acompanhamento e dilatação.',
  ),

  nec: specNo(
    'Termo ouvido na enumeração de campos da fonte; possível erro de transcrição. Sem definição de entidade, rótulo ou regra. Não usar como requisito de produto até esclarecimento.',
  ),
  'status-iccu': specNo(
    'Entidade/rótulo “ICCU ou issue” não esclarecidos na consolidação. Não há regra de processo F3 associada.',
  ),
  'satisfacao-usuario': specNo(
    'Indicador citado sem método de coleta, momento ou vínculo ao rito de demanda. Fora do escopo operacional F3 atual.',
  ),
  'qtd-propostas-contratacao': specNo(
    'Métrica de propostas em contratação sem definição de cálculo nem tela responsável. Não faz parte do preenchimento da Demanda nesta fase.',
  ),
  'capacidade-ociosa': specNo(
    'Capacidade ociosa do profissional não é atributo da Demanda no rito F3. Pertence, se existir, a outro domínio (capacidade/CRM).',
  ),
  'atividades-nova-contratacao': specNo(
    'Registro de atividades de nova contratação extrapola o objeto Demanda consumo/suporte desta fase. Tratar em processo comercial/contratação, não aqui.',
  ),
}

const SECTION_TITLES = {
  'sec-demc-andamento': 'SLA e andamento',
  'sec-demc-identificacao': 'Dados da Demanda',
  'sec-demc-fila': 'Fila e responsáveis',
  'sec-demc-parceiro': 'Parceiro',
  'sec-demc-analise-tipo': 'Análise · tipo',
  'sec-demc-atendimento': 'Atendimento',
  'sec-demc-assinaturas': 'Assinaturas via contrato',
  'sec-demc-entregavel': 'Entregável / homologação / RAER',
  'sec-demc-os-orc': 'OS / Orçamento',
  'sec-demc-historico': 'Histórico e eventos',
  'sec-demc-vinculos': 'Vínculos (Contrato · Orçamento · OS)',
  'sec-demc-projeto': 'Projeto / serviço',
  'sec-demc-indefinidos': 'Informações sem definição completa',
}

const CONTRATO_ORDER = [
  'numero',
  'nome',
  'natureza',
  'demanda',
  'status',
  'contratante',
  'contratada',
  'vig-ini',
  'vig-fim',
  'descricao',
  'valor-global',
  'saldo-global',
  'os-abertas',
  'provisionado',
  'consumo',
  'pct-execucao',
  'execucao-acumulada',
  'contrato-patrocinador',
  'org-patrocinadora',
  'autorizacao-patrocinador',
  'parceria',
  'cat-versao',
  'objeto-n2',
  'oses',
  'eventos',
]

const CONTRATO_SPECS = {
  numero: specOk(
    'Identificador do contrato vinculado à solução/demanda.',
    'Somente leitura no contexto da demanda após o vínculo. Obrigatório no registro contratual.',
  ),
  nome: specOk(
    'Nome descritivo do contrato.',
    'Somente leitura no contexto da demanda após o vínculo.',
  ),
  natureza: specOk(
    'Natureza do contrato (próprio, patrocinado etc.).',
    'Alinha com a natureza da cobertura da demanda. Filtra indicadores e obrigações.',
  ),
  demanda: specOk(
    'Demanda à qual este contrato está vinculado.',
    'Referência de volta à Demanda. Evita contrato órfão no protótipo.',
  ),
  status: specOk(
    'Status do contrato (ex.: vigente).',
    'Somente contratos adequados (vigentes) devem sustentar atendimento/OS.',
  ),
  contratante: specOk(
    'Organização contratante.',
    'Somente leitura no contexto da demanda após o vínculo.',
  ),
  contratada: specOk(
    'Organização contratada.',
    'Somente leitura no contexto da demanda após o vínculo.',
  ),
  'vig-ini': specOk(
    'Início da vigência contratual.',
    'Limita a vida do contrato e a vigência máxima da OS.',
  ),
  'vig-fim': specOk(
    'Fim da vigência contratual.',
    'OS não pode ultrapassar a vigência do contrato.',
  ),
  descricao: specOk(
    'Descrição do objeto contratado.',
    'Somente leitura no contexto da demanda.',
  ),
  'valor-global': specOk(
    'Valor global do contrato.',
    'Indicador; unidade/fórmula a confirmar quando monetário.',
  ),
  'saldo-global': specOk(
    'Saldo global disponível.',
    'Somente leitura. Fórmula/unidade pendentes (PD16).',
  ),
  'os-abertas': specOk(
    'Indicador de OS abertas / “S aberto”.',
    'Rótulo incompleto na fonte (PD01). Não criar campos adicionais antes da confirmação.',
  ),
  provisionado: specOk(
    'Total provisionado no contrato.',
    'Somente leitura. Conceito/cálculo pendentes (PD16).',
  ),
  consumo: specOk(
    'Consumo até o momento.',
    'Somente leitura. Origem/cálculo pendentes (PD16).',
  ),
  'pct-execucao': specOk(
    'Percentual de execução contratual.',
    'Somente leitura. Fórmula pendente.',
  ),
  'execucao-acumulada': specOk(
    'Execução acumulada/continuada.',
    'Indicador com divergência de reconhecimento na fonte (PD01).',
  ),
  'contrato-patrocinador': specOk(
    'Contrato patrocinador quando a cobertura é patrocinada.',
    'Condicional ao patrocínio.',
  ),
  'org-patrocinadora': specOk(
    'Organização que financia o atendimento patrocinado.',
    'Condicional ao patrocínio.',
  ),
  'autorizacao-patrocinador': specOk(
    'Registro de autorização do patrocinador.',
    'Condicional. Formaliza pagamento por outro órgão.',
  ),
  parceria: specOk(
    'Parceria associada ao contrato/objeto.',
    'Condicional. Apoia fila e parceiro da demanda.',
  ),
  'cat-versao': specOk(
    'Versão do catálogo associada à origem do contrato.',
    'Condicional. Mantém coerência dos itens consumidos.',
  ),
  'objeto-n2': specOk(
    'Objeto de catálogo referido como N2.',
    'Classificação a confirmar (PD02).',
  ),
  oses: specOk(
    'Ordens de serviço do contrato.',
    'Embedded para navegar OS ligadas ao contrato.',
  ),
  eventos: specOk(
    'Eventos do contrato (aditivos, supressão etc.).',
    'Condicional a alterações contratuais.',
  ),
}

function suffixAfter(prefix, id) {
  return id.startsWith(prefix) ? id.slice(prefix.length) : id
}

function applyDemanda(form) {
  const prefix = 'patlasv4proto-demc-'
  const bySuffix = new Map()
  for (const field of form.fields) {
    bySuffix.set(suffixAfter(prefix, field.id), field)
  }

  // move contrato + drop empty necessidade section
  const ref = bySuffix.get('ref-contrato')
  if (ref) ref.sectionId = 'sec-demc-identificacao'

  form.sections = SECTION_ORDER.map((id) => {
    const prev = (form.sections || []).find((s) => s.id === id) || { id }
    return { ...prev, id, title: SECTION_TITLES[id] || stripCd(prev.title || id) }
  })

  const ordered = []
  const used = new Set()
  for (const secId of SECTION_ORDER) {
    const list = FIELD_ORDER[secId] || []
    for (const suf of list) {
      const field = bySuffix.get(suf)
      if (!field) {
        console.warn('  missing field', suf)
        continue
      }
      field.sectionId = secId
      field.label = stripCd(field.label)
      if (SPECS[suf]) field.spec = SPECS[suf]
      else if (!field.spec) field.spec = specNo('Sem regra consolidada associada a este campo na Demanda F3.')
      ordered.push(field)
      used.add(suf)
    }
  }

  // any leftover fields (should be rare)
  for (const [suf, field] of bySuffix) {
    if (used.has(suf)) continue
    if (field.sectionId === 'sec-demc-necessidade') field.sectionId = 'sec-demc-identificacao'
    field.label = stripCd(field.label)
    if (!field.spec) field.spec = specNo('Campo residual sem posicionamento canônico.')
    ordered.push(field)
    console.warn('  leftover', field.id, '→', field.sectionId)
  }

  form.fields = ordered
  return form
}

function applyContrato(form) {
  const prefix = 'patlasv4proto-demc-ctr-'
  const bySuffix = new Map(form.fields.map((f) => [suffixAfter(prefix, f.id), f]))
  const ordered = []
  for (const suf of CONTRATO_ORDER) {
    const field = bySuffix.get(suf)
    if (!field) {
      console.warn('  contrato missing', suf)
      continue
    }
    field.label = stripCd(field.label)
    if (CONTRATO_SPECS[suf]) field.spec = CONTRATO_SPECS[suf]
    ordered.push(field)
    bySuffix.delete(suf)
  }
  for (const field of bySuffix.values()) {
    field.label = stripCd(field.label)
    ordered.push(field)
  }
  form.fields = ordered
  return form
}

function applyOs(form) {
  for (const field of form.fields) {
    field.label = stripCd(field.label)
    if (!field.spec || /\(CD-/.test(field.spec)) {
      // keep existing rich specs if any; only ensure label clean
    }
    if (!field.spec) {
      field.spec = specOk(
        `Campo da OS da Demanda: ${field.label}.`,
        'Pertence à classe satélite OS. Preferir edição no vínculo OS, não duplicar regra na Demanda.',
      )
    }
  }
  return form
}

const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
const dem = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')
const ctr = forms.find((f) => f.id === 'form-patlasv4-proto-demc-contrato')
const os = forms.find((f) => f.id === 'form-patlasv4-proto-demc-os')
if (!dem || !ctr || !os) throw new Error('forms not found')

console.log('patch Demanda Completa…')
applyDemanda(dem)
console.log('patch Contrato…')
applyContrato(ctr)
console.log('patch OS…')
applyOs(os)

fs.writeFileSync(FORMS, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

const cdLeft = dem.fields.filter((f) => /\(CD-/.test(f.label || '')).length
const secs = dem.sections.map((s) => s.title).join(' | ')
console.log('OK Demanda fields', dem.fields.length, 'CD left in labels', cdLeft)
console.log('sections:', secs)
console.log(
  'Dados da Demanda:',
  dem.fields.filter((f) => f.sectionId === 'sec-demc-identificacao').map((f) => f.label).join(' · '),
)
