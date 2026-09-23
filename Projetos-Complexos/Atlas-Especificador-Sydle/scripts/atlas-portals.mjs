/**
 * Portais de serviço do épico Atlas.
 */

export const atlasPortals = [
  {
    id: 'portal-atlas-cotacao',
    name: 'ATLAS — Portal de cotação',
    servicePortalHomeHeroTitle: 'Cotação comercial MTI',
    servicePortalHomeHeroSubtitle: 'Monte sua cotação a partir dos catálogos de produtos, licenças e serviços',
    servicePortalHomeSearchPlaceholder: 'Buscar solução, produto ou serviço…',
    servicePortalHeaderMenuOptions: ['Início', 'Nova cotação', 'Minhas cotações', 'Ajuda'],
    servicePortalHeaderNotificationCount: 0,
    servicePortalHeaderUserInitials: 'LC',
    servicePortalHomeColorPrimary: '#1565c0',
    servicePortalHomeColorSecondary: '#0d47a1',
    servicePortalHomeColorText: '#212121',
    servicePortalHomeColorBackground: '#fafafa',
    servicePortalHomeSections: [
      {
        id: 'sec-portal-cotacao-servicos',
        type: 'catalog',
        name: 'Serviços do portal',
        title: 'Serviços',
        catalogs: [
          {
            id: 'cat-portal-cotacao',
            name: 'Cotação e acesso',
            services: [
              {
                id: 'svc-cot-login',
                name: 'Entrar no portal',
                code: 'PORTAL-LOGIN',
                description: 'Autenticação MT Login, parceiro ou cliente.',
                icon: 'login',
              },
              {
                id: 'svc-cot-nova',
                name: 'Nova cotação',
                code: 'PORTAL-COT-NOVA',
                description:
                  'Selecione solução/produto, itens dos catálogos vigentes, licenças e serviços; informe dados da empresa e envie.',
                icon: 'request_quote',
              },
              {
                id: 'svc-cot-consulta',
                name: 'Consultar catálogos',
                code: 'PORTAL-CAT',
                description: 'Navegue produtos vigentes, licenças e serviços antes de montar a cotação.',
                icon: 'inventory_2',
              },
              {
                id: 'svc-cot-solicitar-proposta-atlas',
                name: 'Solicitar proposta Atlas',
                code: 'PORTAL-ATLAS-FASE1',
                description:
                  'Origem opcional de demanda da Fase 1 — registra a solicitação que dará origem à proposta Atlas e direciona ao fluxo de proposta → contrato.',
                icon: 'request_quote',
              },
            ],
          },
        ],
      },
      {
        id: 'sec-portal-cotacao-info',
        type: 'html',
        htmlContent:
          '<p style="margin:0;color:#616161;font-size:0.9rem;">Após o login, preencha os dados do solicitante, representante legal e empresa (layout semelhante à <strong>Convocação Pública</strong>), adicione itens na grade e envie a cotação para análise MTI.</p>',
      },
    ],
  },
]

/** Fluxo de apresentação do portal de cotação (flows.json). */
export const atlasPortalCotacaoFlow = {
  id: 'flow-atlas-portal-cotacao',
  name: 'Portal — cotação comercial',
  steps: [
    {
      id: 'step-portal-cot-login',
      title: 'Login no portal',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: 'form-atlas-portal-login',
      assigneeRole: 'Visitante / solicitante',
      bpmnActivityKey: 'Autenticar no portal',
      bpmnDescription: 'E-mail e senha. Perfis: Cliente, Parceiro ou MTI interno.',
      bpmnFormConfirmNavigateStepId: 'step-portal-cot-home',
    },
    {
      id: 'step-portal-cot-home',
      title: 'Portal — página inicial',
      type: 'servicePortal',
      servicePortalSubtype: 'homePage',
      linkedServicePortalId: 'portal-atlas-cotacao',
      assigneeRole: 'Usuário autenticado',
      servicePortalPresentationDescription:
        'Vitrine de serviços: entrar, nova cotação ou consultar catálogos. Estilo portal público MTI (header azul, formulário por seções).',
      servicePortalServiceNavigateStepIds: {
        'svc-cot-login': 'step-portal-cot-login',
        'svc-cot-nova': 'step-portal-cot-form',
        'svc-cot-consulta': 'step-portal-cot-form',
      },
    },
    {
      id: 'step-portal-cot-form',
      title: 'Montar cotação',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      linkedFormId: 'form-atlas-portal-cotacao',
      assigneeRole: 'Solicitante',
      bpmnActivityKey: 'Montar cotação comercial',
      bpmnDescription:
        'Selecione solução/produto; dados do solicitante, representante e empresa; itens dos catálogos; enviar cotação.',
      bpmnRuleList: [
        'Itens podem vir de produtos vigentes, licenças e serviços.',
        'Valor total recalculado antes do envio.',
        'Envio gera número COT-AAAA-NNNN e status Enviada.',
      ],
    },
    {
      id: 'step-portal-cot-visual',
      title: 'Referência visual (Convocação)',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Convocação Pública',
      linkedFormId: 'form-atlas-portal-cotacao',
      htmlContent: '', // preenchido por sync-atlas-portal-flow.mjs
    },
  ],
}
