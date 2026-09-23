/**
 * Apresentação de homologação Fase 1 — narrativa completa para validação com negócio.
 * Inclui contexto, cadastros prévios, telas/classes, operações e os 18 passos do processo.
 */
import { flowFase1PropostaContrato } from './atlas-fase1-flows.mjs'

const HOM_PREFIX = 'step-hom-'

/** Clona etapas do fluxo principal com ids prefixados e referências internas remapeadas. */
function cloneProcessSteps(steps) {
  const idMap = Object.fromEntries(steps.map((s) => [s.id, `${HOM_PREFIX}${s.id}`]))
  return steps.map((step) => {
    const copy = structuredClone(step)
    copy.id = idMap[step.id]
    if (copy.bpmnFormConfirmNavigateStepId && idMap[copy.bpmnFormConfirmNavigateStepId]) {
      copy.bpmnFormConfirmNavigateStepId = idMap[copy.bpmnFormConfirmNavigateStepId]
    }
    if (copy.bpmnPossiblePaths) {
      copy.bpmnPossiblePaths = copy.bpmnPossiblePaths.map((p) => ({
        ...p,
        value: idMap[p.value] ?? p.value,
      }))
    }
    if (copy.classMethodNavigateStepIds) {
      const next = {}
      for (const [k, v] of Object.entries(copy.classMethodNavigateStepIds)) {
        next[k] = idMap[v] ?? v
      }
      copy.classMethodNavigateStepIds = next
    }
    return copy
  })
}

const HTML_CAPA =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:32px;max-width:880px;background:linear-gradient(135deg,#0c1ba8 0%,#1e40af 100%);color:#fff;border-radius:12px'>" +
  "<p style='margin:0 0 8px;font-size:13px;opacity:.85;letter-spacing:.08em;text-transform:uppercase'>Atlas · Gestão Centralizada DIRC</p>" +
  "<h1 style='margin:0 0 12px;font-size:2rem'>Fase 1 — Homologar</h1>" +
  "<p style='margin:0 0 20px;font-size:1.05rem;line-height:1.5;max-width:640px'>" +
  "Roteiro completo para homologação do protótipo: <strong>da demanda comercial ao cadastro contratual</strong>, " +
  "com 18 nós principais, retornos condicionais, assinaturas, checklist e integrações simuladas.</p>" +
  "<ul style='margin:0;padding-left:1.2rem;line-height:1.7;font-size:14px'>" +
  "<li>Fluxo: <code style='background:rgba(255,255,255,.15);padding:2px 6px;border-radius:4px'>flow-atlas-fase1-proposta-contrato</code></li>" +
  "<li>Épico: <code style='background:rgba(255,255,255,.15);padding:2px 6px;border-radius:4px'>atlas-epico</code></li>" +
  "<li>Classes fora da Fase 1 aparecem com prefixo <strong>#</strong> no Explorer</li>" +
  "</ul></div>"

const HTML_COMO_USAR =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:800px;line-height:1.55'>" +
  "<h2 style='color:#0c1ba8;margin-top:0'>Como percorrer esta apresentação</h2>" +
  "<ol style='padding-left:1.25rem'>" +
  "<li><strong>Lista à esquerda</strong> — etapas numeradas; clique para mudar de slide.</li>" +
  "<li><strong>Canvas central</strong> — formulário, workspace ou HTML conforme o tipo da etapa.</li>" +
  "<li><strong>Botão verde (atividades BPMN)</strong> — simula confirmação e salta para a próxima etapa configurada.</li>" +
  "<li><strong>Métodos no formulário</strong> — em modo leitura, cliques em métodos podem navegar (quando mapeados).</li>" +
  "<li><strong>Especificações</strong> — ative «Mostrar specs» para ver regras de campos e negócio.</li>" +
  "</ol>" +
  "<p style='background:#f0f9ff;border-left:4px solid #0c1ba8;padding:12px 16px;color:#0c4a6e'>" +
  "<strong>Homologação:</strong> valide cada tela contra o guia <code>GUIA-FASE-1-PASSO-A-PASSO.md</code> e a matriz DIRC (110 linhas).</p></div>"

const HTML_WORKSPACES =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:900px'>" +
  "<h2 style='color:#0c1ba8'>Workspaces da Fase 1</h2>" +
  "<table style='width:100%;border-collapse:collapse;font-size:14px'>" +
  "<thead><tr style='background:#f1f5f9'><th style='text-align:left;padding:8px;border:1px solid #e2e8f0'>Workspace</th>" +
  "<th style='text-align:left;padding:8px;border:1px solid #e2e8f0'>ID</th><th style='text-align:left;padding:8px;border:1px solid #e2e8f0'>Uso na homologação</th></tr></thead><tbody>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'><strong>Atlas Fase 1 — Workflow e documentos</strong></td><td><code>ws-atlas-fase1-workflow</code></td><td>Modelos, versões, templates, governança, monitoramento</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'><strong>Propostas comerciais</strong></td><td><code>ws-atlas-propostas</code></td><td>Propostas, documentos gerados, workflows em andamento</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'><strong>Contratos — Cadastro contratual</strong></td><td><code>ws-atlas-contratos-raer</code></td><td>Processo contratual, contrato rascunho, checklist</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'><strong>Identidade e acesso</strong></td><td><code>ws-atlas-acesso-identidade</code></td><td>Organizações, pessoas, usuários (assinantes)</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'><strong>Portal de cotação</strong></td><td><code>ws-atlas-portal-cotacao</code></td><td>Origem opcional da demanda</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>Catálogo — produtos vigentes</td><td><code>ws-atlas-catalogo-vigentes</code></td><td>Consulta catálogo (referência nos itens da proposta)</td></tr>" +
  "</tbody></table></div>"

const HTML_DIAGRAMA =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:920px'>" +
  "<h2 style='color:#0c1ba8;margin-top:0'>Caminho feliz — 18 nós</h2>" +
  "<p style='color:#64748b;font-size:14px'>Retornos de ajuste/reprovação voltam para nós já existentes (revisão, itens, documento).</p>" +
  "<pre style='background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:8px;font-size:12px;line-height:1.45;overflow:auto'>" +
  "1 Início → 2 Registrar demanda → 3 Itens catálogo → 4 Compor documento → 5 Prévia\n" +
  "→ 6 Revisão MTI/parceiro → 7 Assin. DIRC/parceiro → 8 DTIC → 9 Presidência\n" +
  "→ 10 Enviar cliente → 11 Aguardar contrato (externo) → 12 Receber contrato\n" +
  "→ 13 Revisar itens → 14 Abrir rascunho → 15 Checklist → 16 Finalizar cadastro\n" +
  "→ 17 Notificar → 18 Fim Fase 1</pre></div>"

const HTML_ESCOPO =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:880px'>" +
  "<h2 style='color:#0c1ba8'>Dentro vs fora da Fase 1</h2>" +
  "<div style='display:grid;grid-template-columns:1fr 1fr;gap:16px'>" +
  "<div style='background:#ecfdf5;border:1px solid #a7f3d0;padding:16px;border-radius:8px'>" +
  "<h3 style='margin:0 0 8px;color:#047857'>✓ Escopo Fase 1</h3><ul style='margin:0;padding-left:1.1rem;font-size:14px;line-height:1.6'>" +
  "<li>Proposta comercial e snapshot de catálogo</li><li>Workflow versionado e assinaturas</li>" +
  "<li>Envio ao cliente e retorno do contrato</li><li>Cadastro contratual (rascunho → ativo)</li>" +
  "<li>Checklist + integração rastreável (sem exigir conclusão)</li><li>Notificação pós-cadastro</li></ul></div>" +
  "<div style='background:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px'>" +
  "<h3 style='margin:0 0 8px;color:#b91c1c'>✗ Fora (classes com #)</h3><ul style='margin:0;padding-left:1.1rem;font-size:14px;line-height:1.6'>" +
  "<li>PV, NF, DAR, faturamento</li><li>OS, homologação operacional, RAER consumo</li>" +
  "<li>Painel cliente completo, BI</li><li>Gestão avançada de catálogo (upload CSV Fase 3)</li></ul></div></div></div>"

const HTML_SECAO_PREPARACAO =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:20px 24px;background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;max-width:800px'>" +
  "<h2 style='margin:0 0 8px;color:#92400e'>§ Cadastros de apoio (antes do fluxo)</h2>" +
  "<p style='margin:0;color:#78350f;font-size:14px'>Execute uma vez (ou valide que existem) antes de homologar o passo 2 em diante.</p></div>"

const HTML_SECAO_PROCESSO =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:20px 24px;background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;max-width:800px'>" +
  "<h2 style='margin:0 0 8px;color:#1e40af'>§ Processo principal — 18 passos</h2>" +
  "<p style='margin:0;color:#1e3a8a;font-size:14px'>Cada etapa abaixo mostra a tela (classe), papel, regras e operações do protótipo.</p></div>"

const HTML_SECAO_POS =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:20px 24px;background:#f0fdf4;border:2px solid #22c55e;border-radius:8px;max-width:800px'>" +
  "<h2 style='margin:0 0 8px;color:#166534'>§ Acompanhamento e encerramento</h2>" +
  "<p style='margin:0;color:#14532d;font-size:14px'>Visão operacional, integrações e checklist de homologação.</p></div>"

const HTML_CHECKLIST_HOM =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:920px'>" +
  "<h2 style='color:#0c1ba8;margin-top:0'>Checklist de homologação — Fase 1</h2>" +
  "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
  "<thead><tr style='background:#f1f5f9'><th style='padding:8px;border:1px solid #e2e8f0;width:40px'>✓</th>" +
  "<th style='padding:8px;border:1px solid #e2e8f0'>Item</th><th style='padding:8px;border:1px solid #e2e8f0'>Evidência</th></tr></thead><tbody>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Organização e usuários cadastrados</td><td>form-atlas-organizacao, pessoa, usuario</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Workflow modelo + versão publicada</td><td>form-atlas-workflow-modelo / versao / etapa</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Template publicado gera documento</td><td>form-atlas-documento-template</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Proposta: itens com snapshot atlas-prpi-*</td><td>Método montar catálogo</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Assinaturas bloqueantes e retorno revisão</td><td>form-atlas-tramite-assinatura</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Processo contratual + anexo + data retorno</td><td>form-atlas-processo-contratual</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Rascunho antes do checklist</td><td>atlas-ctg-meth-abrir-rascunho</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Checklist validado libera finalizar</td><td>form-atlas-checklist-contratual</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Integração: status + justificativa se pendente</td><td>Protheus / ServiceNow no checklist</td></tr>" +
  "<tr><td style='padding:8px;border:1px solid #e2e8f0'>☐</td><td>Classes fora Fase 1 com prefixo #</td><td>Explorer do épico</td></tr>" +
  "</tbody></table></div>"

const HTML_CHATGPT =
  "<div style='font-family:Segoe UI,Arial,sans-serif;padding:24px;max-width:800px;background:#faf5ff;border:1px solid #d8b4fe;border-radius:8px'>" +
  "<h2 style='color:#6b21a8;margin-top:0'>Compartilhar com ChatGPT ou stakeholders</h2>" +
  "<ol style='line-height:1.6;font-size:14px;padding-left:1.2rem'>" +
  "<li><strong>Site estático (recomendado):</strong> exporte esta apresentação (menu Apresentações → exportar), gere o ZIP com <code>npm run zip:presentation</code> e publique na Netlify — o link abre todas as telas interativas.</li>" +
  "<li><strong>ChatGPT:</strong> envie o arquivo <code>FASE-1-HOMOLOGAR.md</code> do épico + o link Netlify; para imagens fixas, exporte PDF por etapa no navegador (Ctrl+P).</li>" +
  "<li><strong>Não há API oficial</strong> para vincular esta conta ao ChatGPT — use upload de arquivos ou link público do viewer.</li>" +
  "</ol></div>"

const introSteps = [
  {
    id: 'step-hom-capa',
    title: '0. Capa — Fase 1 Homologar',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Fase 1 Homologar',
    htmlContent: HTML_CAPA,
  },
  {
    id: 'step-hom-como-usar',
    title: '0.1 Como usar esta apresentação',
    type: 'html',
    htmlContent: HTML_COMO_USAR,
  },
  {
    id: 'step-hom-workspaces-tabela',
    title: '0.2 Workspaces Fase 1',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Ambientes',
    htmlContent: HTML_WORKSPACES,
  },
  {
    id: 'step-hom-diagrama-18',
    title: '0.3 Diagrama — 18 nós',
    type: 'html',
    htmlContent: HTML_DIAGRAMA,
  },
  {
    id: 'step-hom-escopo',
    title: '0.4 Escopo Fase 1 vs fora',
    type: 'html',
    htmlContent: HTML_ESCOPO,
  },
  {
    id: 'step-hom-ws-fase1-workflow',
    title: 'Prep. Workspace — Workflow e documentos',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-fase1-workflow',
    workspacePresentationDescription:
      'Pacotes: Configuração de workflows, Templates e documentos, Monitoramento (notificações e integrações). Homologar governança e modelos antes da proposta.',
    assigneeRole: 'Administrador Fase 1',
    assigneeRoleDetail: 'DIRC / TI processo.',
  },
  {
    id: 'step-hom-sec-preparacao',
    title: '§ Cadastros de apoio',
    type: 'html',
    htmlContent: HTML_SECAO_PREPARACAO,
  },
  {
    id: 'step-hom-class-governanca',
    title: 'Prep. Governança Fase 1',
    type: 'class',
    linkedFormId: 'form-atlas-fase1-governanca',
    classPresentationTitle: 'Governança — regras e permissões',
    classPresentationDescription:
      'Regras transversais: trâmites bloqueantes, parceiro opcional, template publicado = nova versão, integração com justificativa.',
  },
  {
    id: 'step-hom-ws-identidade',
    title: 'Prep. Workspace — Identidade',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-acesso-identidade',
    workspacePresentationDescription:
      'Pacote «Fase 1 — Organizações e assinantes»: organizações, pessoas e usuários para assinaturas e proposta.',
    assigneeRole: 'Cadastro identidade',
  },
  {
    id: 'step-hom-class-organizacao',
    title: 'Prep. Classe — Organização',
    type: 'class',
    linkedFormId: 'form-atlas-organizacao',
    classPresentationTitle: 'Organização (cliente / parceiro)',
    classPresentationDescription: 'Cliente e parceiros vinculados à proposta (atlas-prp-cliente-org, parceiros).',
  },
  {
    id: 'step-hom-class-pessoa',
    title: 'Prep. Classe — Pessoa',
    type: 'class',
    linkedFormId: 'form-atlas-pessoa',
    classPresentationTitle: 'Pessoa',
    classPresentationDescription: 'Dados de assinantes e solicitantes; embutidos documento, e-mail, telefone.',
  },
  {
    id: 'step-hom-class-usuario',
    title: 'Prep. Classe — Usuário',
    type: 'class',
    linkedFormId: 'form-atlas-usuario',
    classPresentationTitle: 'Usuário',
    classPresentationDescription: 'Focal de vendas, ajudante, assinantes (referência em proposta e trâmites).',
  },
  {
    id: 'step-hom-class-wf-modelo',
    title: 'Prep. Classe — Modelo workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-modelo',
    classPresentationTitle: 'Modelo de workflow',
    classPresentationDescription: 'Motor versionado; método criar versão.',
    classMethodNavigateStepIds: { 'atlas-wfm-meth-criar-versao': 'step-hom-class-wf-versao' },
  },
  {
    id: 'step-hom-class-wf-versao',
    title: 'Prep. Classe — Versão workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-versao',
    classPresentationTitle: 'Versão do workflow',
    classPresentationDescription: 'Versão congelada usada na submissão da proposta.',
  },
  {
    id: 'step-hom-class-wf-etapa',
    title: 'Prep. Classe — Etapa workflow',
    type: 'class',
    linkedFormId: 'form-atlas-workflow-etapa',
    classPresentationTitle: 'Etapa de workflow',
    classPresentationDescription: 'Área responsável, SLA, assinatura, transições por etapa.',
  },
  {
    id: 'step-hom-class-doc-template',
    title: 'Prep. Classe — Template documento',
    type: 'class',
    linkedFormId: 'form-atlas-documento-template',
    classPresentationTitle: 'Template de documento',
    classPresentationDescription: 'Somente status Publicado gera proposta; publicado exige nova versão para alterar.',
  },
  {
    id: 'step-hom-ws-catalogo',
    title: 'Prep. Workspace — Catálogo',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-catalogo-vigentes',
    workspacePresentationDescription:
      'Produtos vigentes, licenças e serviços — fonte na seleção de itens (passo 3). Snapshot congela em atlas-prpi-*.',
    assigneeRole: 'Analista comercial',
  },
  {
    id: 'step-hom-class-proposta-item',
    title: 'Prep. Classe — Item proposta',
    type: 'class',
    linkedFormId: 'form-atlas-proposta-item',
    classPresentationTitle: 'Proposta — item (snapshot)',
    classPresentationDescription:
      'Campos atlas-prpi-* congelados na seleção; origem Produto/Licença/Serviço/Manual.',
  },
  {
    id: 'step-hom-portal-cotacao',
    title: 'Prep. Portal — Cotação (opcional)',
    type: 'servicePortal',
    servicePortalSubtype: 'homePage',
    linkedServicePortalId: 'portal-atlas-cotacao',
    servicePortalPresentationDescription:
      'Entrada opcional: serviço «Solicitar proposta Atlas» pode originar proposta com origem Portal.',
    assigneeRole: 'Cliente / parceiro externo',
  },
  {
    id: 'step-hom-ws-propostas',
    title: 'Prep. Workspace — Propostas',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-propostas',
    workspacePresentationDescription:
      'Pacote «Fase 1 — Propostas e assinaturas»: visão operacional, propostas, documentos gerados, workflows em andamento.',
    assigneeRole: 'DIRC / UGVEN',
  },
  {
    id: 'step-hom-sec-processo',
    title: '§ Processo principal',
    type: 'html',
    htmlContent: HTML_SECAO_PROCESSO,
  },
]

const processSteps = cloneProcessSteps(flowFase1PropostaContrato.steps)

const posSteps = [
  {
    id: 'step-hom-sec-pos',
    title: '§ Acompanhamento',
    type: 'html',
    htmlContent: HTML_SECAO_POS,
  },
  {
    id: 'step-hom-class-visao-f1',
    title: 'Pós. Visão operacional Fase 1',
    type: 'class',
    linkedFormId: 'form-atlas-visao-fase1-operacional',
    classPresentationTitle: 'Visão Fase 1 — operação',
    classPresentationDescription:
      'Acompanhamento de propostas, pendências de assinatura, processos contratuais e contratos em cadastro.',
  },
  {
    id: 'step-hom-class-integracao',
    title: 'Pós. Integração (evento)',
    type: 'class',
    linkedFormId: 'form-atlas-integracao-evento',
    classPresentationTitle: 'Evento de integração',
    classPresentationDescription: 'Log simulado Protheus/ServiceNow; reprocessar em erro.',
  },
  {
    id: 'step-hom-ws-contratos',
    title: 'Pós. Workspace — Contratos',
    type: 'workspace',
    linkedWorkspaceId: 'ws-atlas-contratos-raer',
    workspacePresentationDescription:
      'Pacote «Fase 1 — Cadastro contratual»: processos, contratos, checklist. Itens # (PV/órfãos) fora do escopo.',
    assigneeRole: 'Analista contratual',
  },
  {
    id: 'step-hom-class-proposta',
    title: 'Ref. Classe — Proposta (mapa campos)',
    type: 'class',
    linkedFormId: 'form-atlas-proposta',
    classPresentationTitle: 'Proposta comercial — cadastro',
    classPresentationDescription:
      'Classe central: dados comerciais DIRC, workflow, assinaturas, métodos (montar catálogo, gerar documento, enviar, submeter).',
  },
  {
    id: 'step-hom-class-tramite',
    title: 'Ref. Classe — Trâmite assinatura',
    type: 'class',
    linkedFormId: 'form-atlas-tramite-assinatura',
    classPresentationTitle: 'Trâmite — assinatura',
    classPresentationDescription: 'Grupo, área, assinante, bloqueia fluxo, SLA, dias pendente.',
  },
  {
    id: 'step-hom-class-processo',
    title: 'Ref. Classe — Processo contratual',
    type: 'class',
    linkedFormId: 'form-atlas-processo-contratual',
    classPresentationTitle: 'Processo contratual',
    classPresentationDescription: 'Recebimento contrato cliente, divergências, vínculo rascunho.',
  },
  {
    id: 'step-hom-class-contrato-gestao',
    title: 'Ref. Classe — Contrato gestão',
    type: 'class',
    linkedFormId: 'form-atlas-contrato-gestao',
    classPresentationTitle: 'Contrato — gestão',
    classPresentationDescription: 'Métodos: abrir rascunho, finalizar cadastro, notificar cliente.',
  },
  {
    id: 'step-hom-class-checklist',
    title: 'Ref. Classe — Checklist',
    type: 'class',
    linkedFormId: 'form-atlas-checklist-contratual',
    classPresentationTitle: 'Checklist contratual',
    classPresentationDescription:
      'Referencia processo e rascunho; Protheus/ServiceNow com justificativa; método validar checklist.',
  },
  {
    id: 'step-hom-checklist-homologacao',
    title: 'Checklist de homologação',
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: 'Homologação',
    htmlContent: HTML_CHECKLIST_HOM,
  },
  {
    id: 'step-hom-compartilhar',
    title: 'Compartilhar (ChatGPT / link público)',
    type: 'html',
    htmlContent: HTML_CHATGPT,
  },
]

/** Renomeia títulos dos passos clonados para numerar na homologação */
processSteps.forEach((s, i) => {
  if (s.title && !s.title.startsWith('Passo ')) {
    const n = i + 1
    s.title = `Passo ${n}. ${s.title}`
  }
})

export const flowFase1Homologar = {
  id: 'flow-atlas-fase1-homologar',
  name: 'fase 1 homologar',
  steps: [...introSteps, ...processSteps, ...posSteps],
}

export const homologarFlows = [flowFase1Homologar]
