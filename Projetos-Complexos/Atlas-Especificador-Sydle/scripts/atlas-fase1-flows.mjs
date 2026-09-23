/**
 * Fluxos de apresentação da Fase 1 do Atlas.
 *  - flow-atlas-fase1-proposta-contrato: 18 nós principais no caminho feliz + retornos condicionais.
 *  - flow-atlas-fase1-configurador-workflow: cadastro do motor de workflow.
 *
 * Retornos condicionais (não são nós lineares adicionais): voltam para nós já existentes
 * (ex.: Revisão MTI e parceiro, Selecionar itens, Compor documento/template).
 */

/** Nós principais do caminho feliz (18). Retornos de ajuste/reprovação não aumentam esta contagem. */
export const FLOW_FASE1_MAIN_NODE_TITLES = [
  'Início / Workspace Fase 1',
  'Registrar demanda',
  'Selecionar itens de catálogo',
  'Compor documento/template',
  'Gerar prévia da proposta',
  'Revisão MTI e parceiro',
  'Assinatura DIRC/parceiro',
  'Assinatura DTIC',
  'Assinatura Presidência',
  'Enviar proposta ao cliente',
  'Apoio à contratação / Aguardar retorno do contrato',
  'Finalizar processo contratual',
  'Revisar itens contratados',
  'Abrir contrato em rascunho',
  'Validar checklist contratual',
  'Finalizar cadastro do contrato',
  'Notificar cliente e pós-vendas',
  'Fim Fase 1',
]

const HTML_INICIO_FASE1 =
  "<div style='font-family:Arial,sans-serif;padding:24px;max-width:800px'>" +
  "<h1 style='color:#0c1ba8;margin:0 0 8px'>Início / Workspace Fase 1</h1>" +
  "<p style='color:#64748b;font-size:14px;margin:0 0 16px'><em>Container visual (nó 1 de 18) — não é atividade de negócio.</em></p>" +
  "<p><strong>Modelagem:</strong> 18 nós principais no caminho feliz + <strong>retornos condicionais</strong> " +
  "(ajuste/reprovação) que apontam de volta para nós já existentes — não são etapas lineares extras.</p>" +
  "<p style='font-size:13px;color:#475569'>Retornos típicos: assinaturas → Revisão MTI e parceiro; " +
  "revisão → Selecionar itens ou Compor documento/template.</p>" +
  "<p style='margin-top:12px'>Workspace: <strong>Atlas Fase 1 — Workflow e documentos</strong>. " +
  "Negócio inicia em: <strong>Registrar demanda</strong>.</p></div>"

const HTML_PREVIEW_PROPOSTA =
  "<style>.doc{font-family:Arial,sans-serif;padding:24px}.h{color:#0c1ba8}" +
  ".box{border:1px solid #ddd;padding:12px;margin:12px 0;border-radius:6px}</style>" +
  "<div class='doc'><h1 class='h'>Proposta Atlas — Prévia</h1>" +
  "<div class='box'><strong>Cliente:</strong> {{atlas-prp-cliente-org}}<br/>" +
  "<strong>Origem:</strong> {{atlas-prp-origem-demanda}}<br/>" +
  "<strong>Status:</strong> {{atlas-prp-status-fase1}}</div>" +
  "<h2>Escopo</h2><p>{{atlas-prp-escopo-resumido}}</p>" +
  "<h2>Workflow</h2><p>Modelo: {{atlas-prp-workflow-modelo}} — Versão: {{atlas-prp-workflow-versao}}</p></div>"

const HTML_APOIO_CONTRATACAO =
  "<div style='font-family:Arial,sans-serif;padding:28px;max-width:720px;border:2px dashed #94a3b8;" +
  "background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);border-radius:10px'>" +
  "<p style='margin:0 0 8px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em'>" +
  "Etapa externa · aguardando</p>" +
  "<h2 style='color:#475569;margin:0 0 12px'>Apoio à contratação / Aguardar retorno do contrato</h2>" +
  "<p>O cliente conduz a contratação <strong>fora do Atlas</strong>. O sistema não controla todo o processo " +
  "de contratação externa, mas registra quando o contrato retorna à MTI.</p>" +
  "<ul style='line-height:1.6'><li>Proposta já enviada e aprovada internamente</li>" +
  "<li>Aguardar contrato assinado/publicado pelo cliente</li>" +
  "<li>Ao receber o retorno, avançar para <strong>Finalizar processo contratual</strong></li></ul>" +
  "<p style='margin:16px 0 0;padding:12px;background:#fff7ed;border-left:4px solid #f59e0b;color:#92400e'>" +
  "<strong>Processo externo</strong> — etapa de espera; sem automação da contratação do cliente na Fase 1.</p></div>"

const HTML_FIM_FASE1 =
  "<div style='font-family:Arial,sans-serif;padding:24px'><h1 style='color:#059669'>Fim Fase 1</h1>" +
  "<p>Proposta, assinaturas interdepartamentais e cadastro contratual concluídos. " +
  "Integrações simuladas (Protheus/ServiceNow) e notificações registradas.</p>" +
  "<p style='color:#64748b;font-size:14px'>Próximas fases: painel do cliente, OS, homologação, faturamento, NF e RAER operacional.</p></div>"

/** Caminho feliz (avanço linear). */
const PATH_ASSINADO_AVANCA = (nextStepId) => [{ key: 'Assinado', value: nextStepId }]
/** Retorno condicional — reutiliza nó existente, não cria etapa linear nova. */
const PATH_AJUSTE_REVISAO = [
  { key: 'Ajuste / Reprovado → Revisão', value: 'step-atlas-fase1-revisao-mti-parceiro' },
]

export const flowFase1PropostaContrato = {
  id: 'flow-atlas-fase1-proposta-contrato',
  name: 'Atlas Fase 1 — Proposta até contrato (18 nós + retornos condicionais)',
  steps: [
    /* —— Container visual (não é atividade de negócio) —— */
    {
      id: 'step-atlas-fase1-inicio',
      title: 'Início / Workspace Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Atlas Fase 1',
      htmlContent: HTML_INICIO_FASE1,
      bpmnDescription:
        'Tela inicial e referência ao workspace operacional. Não conta como etapa de negócio — o processo inicia em Registrar demanda.',
    },

    /* —— Proposta e documento —— */
    {
      id: 'step-atlas-fase1-registrar-demanda',
      title: 'Registrar demanda',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: 'form-atlas-proposta',
      bpmnActivityKey: 'Registrar demanda/cotação',
      bpmnDescription:
        'A demanda pode chegar por cliente, MTI, parceiro, e-mail ou portal. Registra proposta com cliente, parceiros e escopo resumido.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Confirma entrada do portal ou registra demanda manualmente.',
      bpmnInputs: 'Cliente (organização), origem da demanda, escopo resumido, parceiros quando houver.',
      bpmnOutputs: 'Proposta em rascunho — status Em composição.',
      bpmnRuleList: [
        'Cliente é obrigatório',
        'Origem da demanda é obrigatória',
        'Se houver produto de parceria, informar ao menos um parceiro',
      ],
      bpmnPossiblePaths: [{ key: 'Continuar', value: 'step-atlas-fase1-selecionar-itens' }],
      bpmnSla: '1 dia útil',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnStartEvent: 'Criar número temporário da proposta',
      bpmnOnCompleteEvent: 'Registrar evento de criação no workflow',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-selecionar-itens',
    },
    {
      id: 'step-atlas-fase1-selecionar-itens',
      title: 'Selecionar itens de catálogo',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-proposta',
      bpmnActivityKey: 'Selecionar produtos, licenças e serviços',
      bpmnDescription:
        'Compor proposta com produtos vigentes, catálogo de licenças, serviços ou itens universais. MTI e parceiro podem colaborar.',
      assigneeRole: 'Analista DIRC/UGVEN ou parceiro gestor',
      assigneeRoleDetail: 'Parceiro atua apenas no escopo da sua solução.',
      bpmnInputs: 'Catálogos vigentes, métricas, valores previstos e recorrências.',
      bpmnOutputs: 'Itens da proposta com origem de catálogo e valor previsto.',
      bpmnRuleList: [
        'Todo item precisa ter origem de catálogo',
        'Itens manuais devem ser justificados',
        'Valor previsto alimenta forecast da proposta',
      ],
      bpmnPossiblePaths: [{ key: 'Itens selecionados', value: 'step-atlas-fase1-compor-documento' }],
      bpmnSla: '3 dias úteis',
      bpmnSlaIfExceeded: 'Notificar focal de vendas',
      bpmnOnCompleteEvent: 'Atualizar valor previsto da proposta',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-compor-documento',
    },
    {
      id: 'step-atlas-fase1-compor-documento',
      title: 'Compor documento/template',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-documento-template',
      bpmnActivityKey: 'Aplicar template de proposta',
      bpmnDescription:
        'Template parametrizado gera proposta com sumário, objeto, itens comerciais e placeholders preenchidos.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Revisa texto e anexos antes da aprovação interna.',
      bpmnInputs: 'Template publicado, proposta, cliente, itens.',
      bpmnOutputs: 'Documento de proposta gerado e versionado.',
      bpmnRuleList: [
        'Template deve estar publicado',
        'Template publicado não é editado diretamente; alterações geram nova versão',
        'Parâmetros obrigatórios preenchidos',
        'Documento gerado deve ser versionado',
      ],
      bpmnPossiblePaths: [{ key: 'Documento gerado', value: 'step-atlas-fase1-preview-proposta' }],
      bpmnSla: '2 dias úteis',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Criar documento gerado com status Gerado',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-preview-proposta',
    },
    {
      id: 'step-atlas-fase1-preview-proposta',
      title: 'Gerar prévia da proposta',
      type: 'html',
      linkedFormId: 'form-atlas-proposta',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Prévia da proposta',
      htmlContent: HTML_PREVIEW_PROPOSTA,
      bpmnDescription: 'Visualização do documento aplicado aos dados da proposta antes da revisão formal.',
      bpmnPossiblePaths: [{ key: 'Prévia conferida', value: 'step-atlas-fase1-revisao-mti-parceiro' }],
    },
    {
      id: 'step-atlas-fase1-revisao-mti-parceiro',
      title: 'Revisão MTI e parceiro',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-proposta',
      bpmnActivityKey: 'Revisar proposta antes de assinatura',
      bpmnDescription:
        'DIRC e parceiro validam escopo, itens, valores e textos. Ajuste gera nova versão; aprovação libera assinaturas.',
      assigneeRole: 'DIRC e parceiro gestor',
      assigneeRoleDetail: 'Cada parceiro valida apenas o escopo da sua solução.',
      bpmnInputs: 'Documento gerado, itens, comentários e anexos.',
      bpmnOutputs: 'Proposta aprovada para assinatura ou devolvida para ajuste.',
      bpmnRuleList: [
        'Aprovado → segue para assinatura DIRC/parceiro',
        'Ajuste → retorna para itens de catálogo ou composição do documento',
        'Reprovação exige comentário obrigatório',
        'Ajuste gera nova versão da proposta',
        'Quando não houver parceiro envolvido, a revisão e assinatura do parceiro não são exigidas',
      ],
      bpmnPossiblePaths: [
        { key: 'Aprovado', value: 'step-atlas-fase1-assinatura-dirc-parceiro' },
        { key: 'Ajuste → itens (retorno)', value: 'step-atlas-fase1-selecionar-itens' },
        { key: 'Ajuste → documento (retorno)', value: 'step-atlas-fase1-compor-documento' },
      ],
      bpmnSla: '3 dias úteis',
      bpmnSlaIfExceeded: 'Notificar focal da parceria e gestor DIRC',
      bpmnOnCompleteEvent: 'Registrar decisão de revisão',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-assinatura-dirc-parceiro',
    },

    /* —— Assinaturas interdepartamentais —— */
    {
      id: 'step-atlas-fase1-assinatura-dirc-parceiro',
      title: 'Assinatura DIRC/parceiro',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-tramite-assinatura',
      bpmnActivityKey: 'Assinatura composta DIRC e parceiro(s)',
      bpmnDescription:
        'Assinatura composta: DIRC/MTI e um ou mais parceiros (por escopo). Só avança quando todos os assinantes obrigatórios concluírem. ' +
        'Cada trâmite registra responsável, área, status, datas, dias pendentes e se bloqueia o fluxo.',
      assigneeRole: 'DIRC e parceiro(s)',
      assigneeRoleDetail:
        'Pode envolver DIRC, parceiro único, múltiplos parceiros ou aprovação por escopo de parceiro. Status de pendência por assinante.',
      bpmnInputs: 'Documento gerado, trâmites por assinante, SLA por trâmite.',
      bpmnOutputs: 'Todos os trâmites obrigatórios assinados ou retorno para revisão.',
      bpmnRuleList: [
        'Assinado → segue para Assinatura DTIC',
        'Ajuste/Reprovado → retorna para Revisão MTI e parceiro',
        'A assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos',
        'Quando não houver parceiro envolvido, a revisão e assinatura do parceiro não são exigidas',
        'Pendência parada gera notificação e destaque na visão operacional',
        'Registrar mecanismo de assinatura (MT Login, Gov.br, certificado, etc.)',
      ],
      bpmnPossiblePaths: [
        ...PATH_ASSINADO_AVANCA('step-atlas-fase1-assinatura-dtic'),
        ...PATH_AJUSTE_REVISAO,
      ],
      bpmnSla: '2 dias úteis',
      bpmnSlaIfExceeded: 'Reenviar notificação; identificar assinante pendente na visão Fase 1',
      bpmnOnStartEvent: 'Criar trâmites por assinante (DIRC + parceiros do escopo)',
      bpmnOnCompleteEvent: 'Consolidar status de assinaturas da proposta',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-assinatura-dtic',
    },
    {
      id: 'step-atlas-fase1-assinatura-dtic',
      title: 'Assinatura DTIC',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-tramite-assinatura',
      bpmnActivityKey: 'Concordância técnica DTIC',
      bpmnDescription: 'DTIC valida impacto técnico. Trâmite com responsável, SLA, dias pendentes e bloqueio de fluxo.',
      assigneeRole: 'Aprovador DTIC',
      assigneeRoleDetail: 'Usuário ou grupo da etapa do workflow.',
      bpmnInputs: 'Proposta com assinaturas DIRC/parceiro concluídas.',
      bpmnOutputs: 'Assinatura técnica ou retorno para revisão.',
      bpmnRuleList: [
        'Assinado → segue para Assinatura Presidência',
        'Ajuste/Reprovado → retorna para Revisão MTI e parceiro',
        'Comentário obrigatório em ajuste/reprovação',
        'A assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos',
      ],
      bpmnPossiblePaths: [
        ...PATH_ASSINADO_AVANCA('step-atlas-fase1-assinatura-presidencia'),
        ...PATH_AJUSTE_REVISAO,
      ],
      bpmnSla: '2 dias úteis',
      bpmnSlaIfExceeded: 'Escalonar ao gestor DTIC',
      bpmnOnStartEvent: 'Notificar DTIC por e-mail e portal',
      bpmnOnCompleteEvent: 'Registrar assinatura técnica',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-assinatura-presidencia',
    },
    {
      id: 'step-atlas-fase1-assinatura-presidencia',
      title: 'Assinatura Presidência',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-tramite-assinatura',
      bpmnActivityKey: 'Assinatura superior',
      bpmnDescription: 'Presidência ou autoridade superior quando exigido pelo workflow.',
      assigneeRole: 'Presidência',
      assigneeRoleDetail: 'Assinante superior configurado na versão do fluxo.',
      bpmnInputs: 'Proposta com aprovações anteriores concluídas.',
      bpmnOutputs: 'Pacote de aprovação interna completo ou retorno para revisão.',
      bpmnRuleList: [
        'Assinado → segue para Enviar proposta ao cliente',
        'Ajuste/Reprovado → retorna para Revisão MTI e parceiro',
        'Documento aprovado não deve ser alterado sem nova versão',
        'A assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos',
      ],
      bpmnPossiblePaths: [
        ...PATH_ASSINADO_AVANCA('step-atlas-fase1-enviar-cliente'),
        ...PATH_AJUSTE_REVISAO,
      ],
      bpmnSla: '2 dias úteis',
      bpmnSlaIfExceeded: 'Escalonar ao gestor DIRC',
      bpmnOnCompleteEvent: 'Marcar proposta como Aprovada',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-enviar-cliente',
    },

    /* —— Cliente e retorno contratual —— */
    {
      id: 'step-atlas-fase1-enviar-cliente',
      title: 'Enviar proposta ao cliente',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-proposta',
      bpmnActivityKey: 'Disponibilizar proposta aprovada',
      bpmnDescription:
        'Envia ao cliente a versão aprovada e assinada internamente. Registra data de envio e status Enviada ao cliente.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Responsável pelo envio e registro no Atlas.',
      bpmnInputs: 'Proposta aprovada, documento assinado, versão final.',
      bpmnOutputs: 'Proposta enviada — aguarda processo externo de contratação.',
      bpmnRuleList: [
        'Documento enviado deve ser a versão aprovada',
        'Data de envio registrada',
        'Apoio à contratação ocorre fora do sistema',
      ],
      bpmnPossiblePaths: [{ key: 'Proposta enviada', value: 'step-atlas-fase1-apoio-contratacao' }],
      bpmnSla: '1 dia útil',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Atualizar status para Enviada ao cliente',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-apoio-contratacao',
    },
    {
      id: 'step-atlas-fase1-apoio-contratacao',
      title: 'Apoio à contratação / Aguardar retorno do contrato',
      type: 'html',
      linkedFormId: 'form-atlas-proposta',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Aguardando contrato (externo)',
      htmlContent: HTML_APOIO_CONTRATACAO,
      bpmnDescription:
        'Processo externo: o cliente conduz a contratação fora do Atlas. O sistema aguarda e registra o retorno do contrato à MTI.',
      assigneeRole: 'Processo externo (cliente)',
      assigneeRoleDetail: 'Não é tarefa de usuário MTI — etapa de espera até o contrato retornar.',
      bpmnRuleList: [
        'Contrato retornou à MTI → segue para Finalizar processo contratual',
        'Registrar data de retorno quando disponível',
      ],
      bpmnPossiblePaths: [{ key: 'Contrato retornou à MTI', value: 'step-atlas-fase1-finalizar-contrato' }],
    },

    /* —— Fechamento contratual —— */
    {
      id: 'step-atlas-fase1-finalizar-contrato',
      title: 'Finalizar processo contratual',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: 'form-atlas-processo-contratual',
      bpmnActivityKey: 'Receber contrato do cliente',
      bpmnDescription:
        'Registra o recebimento do contrato devolvido pelo cliente após o apoio externo à contratação. ' +
        'Vincula à proposta aprovada e enviada, anexa o arquivo do contrato recebido e informa a data de retorno à MTI.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail:
        'Representa o momento em que o contrato assinado/publicado pelo cliente chega à MTI — não é o cadastro final no Atlas.',
      bpmnInputs:
        'Proposta aprovada (origem), anexo do contrato recebido, data de retorno, referência de workflow.',
      bpmnOutputs: 'Recebimento registrado — processo pronto para revisão de itens contratados.',
      bpmnRuleList: [
        'Proposta aprovada vinculada (a mesma enviada ao cliente)',
        'Anexo do contrato recebido obrigatório',
        'Data de retorno do contrato à MTI obrigatória',
        'Cliente/organização conferidos',
      ],
      bpmnPossiblePaths: [{ key: 'Vínculo registrado', value: 'step-atlas-fase1-revisar-itens' }],
      bpmnSla: '3 dias úteis',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Vincular processo contratual à proposta aprovada',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-revisar-itens',
    },
    {
      id: 'step-atlas-fase1-revisar-itens',
      title: 'Revisar itens contratados',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-processo-contratual',
      bpmnActivityKey: 'Conferir itens proposta x contrato',
      bpmnDescription:
        'O contrato recebido pode divergir da proposta enviada. Revisar itens contratados, marcar alterações e justificar divergências ' +
        '(redução de escopo, quantidade, item removido/substituído, erro do cliente, adequação contratual).',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Compara itens da proposta com itens do contrato recebido.',
      bpmnInputs: 'Itens da proposta, itens do contrato, anexos do contrato recebido.',
      bpmnOutputs: 'Itens revisados; divergências justificadas quando houver.',
      bpmnRuleList: [
        'Itens revisados → segue para Abrir contrato em rascunho',
        'Se houver divergência, justificativa é obrigatória',
        'Alterações devem refletir nos itens de contrato (catálogo)',
      ],
      bpmnPossiblePaths: [{ key: 'Itens revisados', value: 'step-atlas-fase1-abrir-rascunho' }],
      bpmnSla: '3 dias úteis',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Marcar itens contratados como revisados no processo contratual',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-abrir-rascunho',
    },
    {
      id: 'step-atlas-fase1-abrir-rascunho',
      title: 'Abrir contrato em rascunho',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-contrato-gestao',
      bpmnActivityKey: 'Criar contrato em rascunho',
      bpmnDescription:
        'Abre o cadastro do contrato em status Rascunho antes do checklist. Vincula processo contratual, proposta e cliente. ' +
        'O checklist referencia o processo contratual e este rascunho — não exige contrato finalizado.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Método Abrir em rascunho — status cadastro = Rascunho.',
      bpmnInputs: 'Processo contratual com itens revisados, proposta origem, cliente.',
      bpmnOutputs: 'Contrato em rascunho vinculado ao processo — pronto para checklist.',
      bpmnRuleList: [
        'Status cadastro = Rascunho',
        'Vincular processo contratual e proposta origem',
        'Cliente/organização obrigatórios',
        'Rascunho deve existir antes de Validar checklist contratual',
      ],
      bpmnPossiblePaths: [{ key: 'Rascunho aberto', value: 'step-atlas-fase1-validar-checklist' }],
      bpmnSla: '1 dia útil',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Atualizar referência atlas-pctr-contrato-rascunho no processo',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-validar-checklist',
    },
    {
      id: 'step-atlas-fase1-validar-checklist',
      title: 'Validar checklist contratual',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-checklist-contratual',
      bpmnActivityKey: 'Validar checklist obrigatório',
      bpmnDescription:
        'Valida checklist do processo contratual antes de finalizar o cadastro. Referencia processo contratual e contrato em rascunho. ' +
        'Integração: status conhecido; negativo ou pendente exige justificativa (conclusão não obrigatória).',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Método Validar checklist — só libera Finalizar cadastro do contrato após validação.',
      bpmnInputs: 'Processo contratual, contrato rascunho, checklist preenchido; eventos de integração com status definido.',
      bpmnOutputs: 'Checklist validado — único caminho para Finalizar cadastro do contrato.',
      bpmnRuleList: [
        'Processo contratual vinculado à proposta',
        'Contrato em rascunho já aberto na etapa anterior',
        'Cliente cadastrado',
        'Proposta vinculada',
        'Itens contratados revisados',
        'Extrato de publicação anexado',
        'Data de publicação informada',
        'Status de integração conhecido; negativo ou pendente exige justificativa',
        'Evento Protheus com status conhecido (conclusão não exigida)',
        'Evento ServiceNow com status conhecido (conclusão não exigida)',
        'Checklist válido → único caminho para Finalizar cadastro do contrato',
      ],
      bpmnPossiblePaths: [{ key: 'Checklist válido', value: 'step-atlas-fase1-cadastrar-contrato' }],
      bpmnSla: '2 dias úteis',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Marcar checklist como validado',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-cadastrar-contrato',
    },
    {
      id: 'step-atlas-fase1-cadastrar-contrato',
      title: 'Finalizar cadastro do contrato',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      linkedFormId: 'form-atlas-contrato-gestao',
      bpmnActivityKey: 'Finalizar cadastro do contrato',
      bpmnDescription:
        'Finaliza o cadastro do contrato já aberto em rascunho — somente após checklist validado. ' +
        'Não cria contrato do zero; complementa dados e ativa o registro.',
      assigneeRole: 'Analista DIRC/UGVEN',
      assigneeRoleDetail: 'Contrato rascunho existente; bloqueado se checklist não estiver validado. Método Finalizar cadastro.',
      bpmnInputs: 'Contrato, cliente, itens revisados, extrato, checklist com flag validado.',
      bpmnOutputs: 'Contrato Ativo ou Em validação; eventos de integração rastreáveis.',
      bpmnRuleList: [
        'Pré-requisito obrigatório: checklist contratual validado',
        'Sem checklist validado, cadastro não deve prosseguir',
        'Extrato de publicação obrigatório',
        'Cliente com organização cadastrada',
        'Cadastro finalizado → notificar cliente e pós-vendas',
      ],
      bpmnPossiblePaths: [{ key: 'Cadastro finalizado', value: 'step-atlas-fase1-notificar-pos-vendas' }],
      bpmnSla: '3 dias úteis',
      bpmnSlaIfExceeded: 'Notificar gestor DIRC',
      bpmnOnCompleteEvent: 'Gerar eventos Protheus e ServiceNow (simulado)',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-notificar-pos-vendas',
    },
    {
      id: 'step-atlas-fase1-notificar-pos-vendas',
      title: 'Notificar cliente e pós-vendas',
      type: 'method',
      methodFormType: 'output',
      linkedFormId: 'form-atlas-notificacao-processo',
      bpmnActivityKey: 'Notificação pós-cadastro',
      bpmnDescription:
        'Cliente notificado sobre contrato; UGEPV acionada para kickoff. Rastreabilidade da notificação no processo.',
      assigneeRole: 'Sistema / Analista DIRC',
      assigneeRoleDetail: 'Protótipo simula reenvio e registro de notificação.',
      bpmnInputs: 'Contrato cadastrado, checklist validado, e-mails da organização.',
      bpmnOutputs: 'Notificações registradas; Fase 1 encerrada para o contrato.',
      bpmnRuleList: [
        'Cliente deve ter e-mail de notificação',
        'UGEPV recebe demanda de kickoff',
        'Contrato com status Ativo ou Em validação',
      ],
      bpmnPossiblePaths: [{ key: 'Concluído', value: 'step-atlas-fase1-fim' }],
      bpmnSla: '1 dia útil',
      bpmnOnCompleteEvent: 'Marcar Fase 1 como concluída',
      bpmnFormConfirmNavigateStepId: 'step-atlas-fase1-fim',
    },
    {
      id: 'step-atlas-fase1-fim',
      title: 'Fim Fase 1',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Fase 1 concluída',
      htmlContent: HTML_FIM_FASE1,
    },
  ],
}

export const flowFase1ConfiguradorWorkflow = {
  id: 'flow-atlas-fase1-configurador-workflow',
  name: 'Atlas Fase 1 — Configurador de workflow',
  steps: [
    {
      id: 'step-atlas-fase1-configurar-workflow',
      title: 'Criar modelo de workflow',
      type: 'class',
      linkedFormId: 'form-atlas-workflow-modelo',
      classPresentationTitle: 'Modelo de workflow',
      classPresentationDescription:
        'Configuração do fluxo principal de proposta, assinatura e contrato, com versões congeladas.',
      classMethodNavigateStepIds: {
        'atlas-wfm-meth-criar-versao': 'step-atlas-fase1-configurar-versao',
      },
    },
    {
      id: 'step-atlas-fase1-configurar-versao',
      title: 'Configurar versão',
      type: 'class',
      linkedFormId: 'form-atlas-workflow-versao',
      classPresentationTitle: 'Versão do workflow',
      classPresentationDescription: 'Versão 1.0 com etapas padrão da Fase 1.',
      classMethodNavigateStepIds: {
        'atlas-wfv-meth-clonar': 'step-atlas-fase1-configurar-workflow',
      },
    },
    {
      id: 'step-atlas-fase1-configurar-etapas',
      title: 'Configurar etapas',
      type: 'class',
      linkedFormId: 'form-atlas-workflow-etapa',
      classPresentationTitle: 'Etapas',
      classPresentationDescription:
        'Etapas configuráveis com área, tipo, assinatura, SLA e transições.',
    },
  ],
}

export const fase1Flows = [flowFase1PropostaContrato, flowFase1ConfiguradorWorkflow]
