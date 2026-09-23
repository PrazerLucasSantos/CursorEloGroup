#!/usr/bin/env node
/**
 * Classe Demanda (back-office) + fluxo operacional do Parceiro.
 * Modelagem 20/07/2026 · espelha portalClienteDemandaData.ts.
 *
 * Uso: node scripts/patch-atlas-prototipo-demanda-parceiro.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const WS_PATH = path.join(EPIC_DIR, 'workspaces.json')
const FLOWS_PATH = path.join(EPIC_DIR, 'flows.json')
const CONTEXT_PATH = path.join(EPIC_DIR, 'context.md')

const FORM = 'form-patlasv4-proto-demanda'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const SEC_ID = 'sec-demanda-identificacao'
const SEC_NEC = 'sec-demanda-necessidade'
const SEC_PAR = 'sec-demanda-parceiro'
const SEC_AT = 'sec-demanda-atendimento'
const SEC_HIST = 'sec-demanda-historico'

const STATUS = [
  'Aguardando gestor',
  'Aguardando análise',
  'Em análise',
  'Devolvida para correção',
  'Aguardando autorização',
  'Em orçamento',
  'Recusada',
  'Não autorizada',
  'Aprovada · em atendimento',
]

const P = {
  AGUARDANDO_PARCEIRO: 'patlasv4proto-p-demanda-aguardando-parceiro',
  EM_ANALISE: 'patlasv4proto-p-demanda-parceiro-em-analise',
  VIA_CONTRATO: 'patlasv4proto-p-demanda-parceiro-via-contrato',
  ORCAMENTO: 'patlasv4proto-p-demanda-parceiro-orcamento',
  DEVOLVIDA: 'patlasv4proto-p-demanda-parceiro-devolvida',
  RECUSADA: 'patlasv4proto-p-demanda-parceiro-recusada',
}

const FLOW_ID = 'flow-proto-demanda-parceiro'

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function preset(id, name, iconColor, values) {
  return {
    id,
    name,
    iconColor,
    fieldValues: values,
    embeddedRowsByFieldId: {},
  }
}

function buildDemandaForm() {
  return {
    id: FORM,
    name: '(10.0) Demanda',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Classe Demanda no back-office (MTI / Parceiro). Fluxo 20/07/2026: abertura no portal → ' +
      'roteamento (1 solução+parceria notifica parceiro; senão MTI qualifica) → análise compartilhada ' +
      '(via contrato / orçamento / devolver / recusar) → autorização do cliente. ' +
      'Parceiro só vê e age após parceiroNotificado=true. Qualificar é exclusivo MTI.',
    sections: [
      { id: SEC_ID, title: 'Identificação', icon: 'badge' },
      { id: SEC_NEC, title: 'Necessidade', icon: 'description' },
      { id: SEC_PAR, title: 'Parceiro / roteamento', icon: 'handshake' },
      { id: SEC_AT, title: 'Atendimento', icon: 'assignment' },
      { id: SEC_HIST, title: 'Histórico', icon: 'history' },
    ],
    fields: [
      f('patlasv4proto-demanda-numero', 'Número', 'text', SEC_ID, {
        readOnly: true,
        required: true,
        relevance: 'identity',
        size: 'small',
        spec: 'Gerado no registro. Ex.: DEM-2026-0042.',
      }),
      f('patlasv4proto-demanda-status', 'Status', 'textOptions', SEC_ID, {
        required: true,
        relevance: 'highlight',
        options: STATUS,
        spec: 'Status do rito Demanda (hierarquia → análise → autorização / orçamento / recusa).',
      }),
      f('patlasv4proto-demanda-origem', 'Origem', 'textOptions', SEC_ID, {
        required: true,
        relevance: 'highlight',
        readOnly: true,
        options: ['Cliente', 'Parceiro', 'MTI'],
        spec: 'Automático pelo perfil de quem abriu no portal.',
      }),
      f('patlasv4proto-demanda-cliente', 'Cliente solicitante', 'reference', SEC_ID, {
        required: true,
        linkedFormId: FORM_UO,
        options: [
          'Secretaria de Estado de Planejamento e Gestão',
          'Empresa Mato-grossense de Tecnologia da Informação',
        ],
        spec: 'Organização cliente (portal / contrato).',
      }),
      f('patlasv4proto-demanda-contato', 'Contato (quem abre)', 'reference', SEC_ID, {
        required: true,
        linkedFormId: FORM_PESSOA,
        options: ['Lucas Costa', 'Ana Paula Ribeiro', 'Bernardo Almeida'],
        spec: 'Padrão = pessoa logada no portal.',
      }),
      f('patlasv4proto-demanda-contato-sec', 'Contato secundário', 'reference', SEC_ID, {
        linkedFormId: FORM_PESSOA,
        options: ['Ana Paula Ribeiro', 'Carlos Eduardo Souza', 'Helena Ribeiro Lima'],
        spec: 'Preferencial (observador).',
      }),
      f('patlasv4proto-demanda-data-evento', 'Data do evento', 'date', SEC_ID, {
        required: true,
        size: 'small',
      }),

      f('patlasv4proto-demanda-contrato', 'Nº do contrato', 'text', SEC_NEC, {
        relevance: 'highlight',
        spec: 'Contrato do cliente. 1 solução com parceria → notifica parceiro automaticamente.',
      }),
      f('patlasv4proto-demanda-produto', 'Produto / solução', 'text', SEC_NEC, {
        required: true,
        relevance: 'highlight',
        spec: 'Soluções do contrato + «Outros». Sem contrato → sobe como Outros (só MTI).',
      }),
      f('patlasv4proto-demanda-descricao', 'Descrição da demanda', 'text', SEC_NEC, {
        required: true,
        textLong: true,
        size: 'large',
        spec: 'Depois do produto/solução.',
      }),
      f('patlasv4proto-demanda-observacoes', 'Observações', 'text', SEC_NEC, {
        textLong: true,
        size: 'large',
      }),
      f('patlasv4proto-demanda-anexos', 'Anexos', 'file', SEC_NEC, {
        multiple: true,
        size: 'large',
        spec: 'Documentos iniciais da demanda (portal).',
      }),

      f('patlasv4proto-demanda-parceiro-notificado', 'Parceiro notificado', 'boolean', SEC_PAR, {
        readOnly: true,
        relevance: 'highlight',
        size: 'small',
        spec:
          'Sistema. True quando 1 solução+parceria no contrato OU após MTI qualificar com parceiro. ' +
          'Gate: parceiro só vê ações se true.',
      }),
      f('patlasv4proto-demanda-parceiro-nome', 'Parceiro', 'text', SEC_PAR, {
        relevance: 'highlight',
        spec: 'Nome do parceiro notificado (ex.: EloGroup). Vazio = atendimento só MTI.',
      }),
      f('patlasv4proto-demanda-qualificado', 'Qualificado pela MTI', 'boolean', SEC_PAR, {
        readOnly: true,
        size: 'small',
        spec: 'True após método Qualificar (Outros / várias soluções / sem parceria automática).',
      }),
      f('patlasv4proto-demanda-roteamento', 'Regra de roteamento', 'text', SEC_PAR, {
        readOnly: true,
        textLong: true,
        size: 'large',
        spec:
          'Automático: contrato + produto ≠ Outros + exatamente 1 solução no contrato com parceria=true → ' +
          'notifica parceiro. Caso contrário → fila MTI (qualificar).',
      }),

      f('patlasv4proto-demanda-catalogos', 'Catálogos', 'text', SEC_AT, {
        textLong: true,
        size: 'large',
        spec: 'Preenchido no atendimento via contrato (plural).',
      }),
      f('patlasv4proto-demanda-itens', 'Itens de catálogo', 'text', SEC_AT, {
        textLong: true,
        size: 'large',
        spec: 'Itens no plural — atendimento via contrato.',
      }),
      f('patlasv4proto-demanda-desc-atendimento', 'Descrição do atendimento', 'text', SEC_AT, {
        textLong: true,
        size: 'large',
      }),
      f('patlasv4proto-demanda-os', 'OS vinculada', 'text', SEC_AT, {
        size: 'small',
        spec: 'OS existente ou digital gerada na autorização do cliente.',
      }),
      f('patlasv4proto-demanda-motivo', 'Motivo da última ação', 'text', SEC_AT, {
        readOnly: true,
        textLong: true,
        size: 'large',
        spec: 'Preenchido em devolver / recusar / não autorizar.',
      }),

      f('patlasv4proto-demanda-criado-em', 'Criado em', 'date', SEC_HIST, {
        readOnly: true,
        size: 'small',
      }),
      f('patlasv4proto-demanda-atualizado-em', 'Atualizado em', 'date', SEC_HIST, {
        readOnly: true,
        size: 'small',
      }),
      f('patlasv4proto-demanda-ultimo-ator', 'Último ator', 'text', SEC_HIST, {
        readOnly: true,
        spec: 'Perfil/cargo da última ação (Cliente, Parceiro, MTI).',
      }),
      f('patlasv4proto-demanda-ultima-acao', 'Última ação', 'text', SEC_HIST, {
        readOnly: true,
        textLong: true,
        size: 'large',
      }),
    ],
    methods: [
      {
        id: 'method-demanda-iniciar-analise',
        name: 'Iniciar análise',
        icon: 'play_arrow',
        kind: 'destaque',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-iniciar-analise',
        spec: 'MTI ou Parceiro (se notificado). Status Aguardando análise → Em análise.',
      },
      {
        id: 'method-demanda-qualificar',
        name: 'Qualificar produto/parceiro',
        icon: 'hub',
        kind: 'menu',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-qualificar',
        spec: 'Exclusivo MTI. Outros / várias soluções / sem parceria automática. Pode notificar parceiro.',
      },
      {
        id: 'method-demanda-via-contrato',
        name: 'Atendimento via contrato',
        icon: 'assignment',
        kind: 'destaque',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
        spec: 'MTI / Parceiro. Catálogos + itens → cliente autorizar.',
      },
      {
        id: 'method-demanda-orcamento',
        name: 'Enviar para orçamento',
        icon: 'request_quote',
        kind: 'menu',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
        spec: 'MTI / Parceiro. Sai deste BPM para fluxo de orçamento.',
      },
      {
        id: 'method-demanda-devolver',
        name: 'Devolver para correção',
        icon: 'undo',
        kind: 'menu',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
        spec: 'MTI / Parceiro. Motivo + assinatura. Com parceria: rito MTI e parceiro.',
      },
      {
        id: 'method-demanda-recusar',
        name: 'Recusar demanda',
        icon: 'cancel',
        kind: 'menu',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
        spec: 'MTI / Parceiro. Motivo + assinatura. Com parceria: assinatura MTI e parceiro.',
      },
      {
        id: 'method-demanda-autorizar',
        name: 'Autorização do cliente',
        icon: 'verified',
        kind: 'menu',
        inputFormId: 'form-patlasv4-proto-metodo-demanda-autorizar',
        spec: 'Portal do cliente. Cargos de assinatura incluem parceiro (handover do contrato).',
      },
    ],
    exampleValuePresets: [
      preset(P.AGUARDANDO_PARCEIRO, 'Parceiro · notificado · aguardando análise', '#0c4a6e', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0101',
        'patlasv4proto-demanda-status': 'Aguardando análise',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-contato-sec': 'Ana Paula Ribeiro',
        'patlasv4proto-demanda-data-evento': '2026-07-10',
        'patlasv4proto-demanda-contrato': 'CTR-2025-0142',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao':
          'Necessidade de apoio na implantação do Simplifica na SEPLAG, com parceria EloGroup.',
        'patlasv4proto-demanda-observacoes': 'Roteamento automático: 1 solução com parceria.',
        'patlasv4proto-demanda-anexos': 'oficio-simplifica.pdf',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-roteamento':
          '1 solução no contrato com parceria=true → parceiro EloGroup notificado automaticamente.',
        'patlasv4proto-demanda-criado-em': '2026-07-10',
        'patlasv4proto-demanda-atualizado-em': '2026-07-10',
        'patlasv4proto-demanda-ultimo-ator': 'Sistema',
        'patlasv4proto-demanda-ultima-acao': 'Registrou demanda · Parceiro notificado: EloGroup',
      }),
      preset(P.EM_ANALISE, 'Parceiro · em análise', '#1d4ed8', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0102',
        'patlasv4proto-demanda-status': 'Em análise',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-data-evento': '2026-07-08',
        'patlasv4proto-demanda-contrato': 'CTR-2025-0142',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao': 'Parceiro EloGroup iniciou a análise da demanda.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-roteamento': 'Parceiro notificado · análise compartilhada MTI/Parceiro.',
        'patlasv4proto-demanda-criado-em': '2026-07-08',
        'patlasv4proto-demanda-atualizado-em': '2026-07-12',
        'patlasv4proto-demanda-ultimo-ator': 'Parceiro · EloGroup',
        'patlasv4proto-demanda-ultima-acao': 'Iniciou análise',
      }),
      preset(P.VIA_CONTRATO, 'Parceiro · via contrato → autorizar', '#166534', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0103',
        'patlasv4proto-demanda-status': 'Aguardando autorização',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-data-evento': '2026-07-05',
        'patlasv4proto-demanda-contrato': 'CTR-2025-0142',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao': 'Atendimento montado via contrato pelo parceiro.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-catalogos': 'Catálogo Simplifica · Pacote Implantação',
        'patlasv4proto-demanda-itens': 'Workshop de processos; Configuração de fluxos; Capacitação equipe',
        'patlasv4proto-demanda-desc-atendimento':
          'Escopo via contrato CTR-2025-0142. Aguardando autorização do cliente no portal.',
        'patlasv4proto-demanda-os': '',
        'patlasv4proto-demanda-criado-em': '2026-07-05',
        'patlasv4proto-demanda-atualizado-em': '2026-07-14',
        'patlasv4proto-demanda-ultimo-ator': 'Parceiro · EloGroup',
        'patlasv4proto-demanda-ultima-acao': 'Atendimento via contrato → cliente autorizar',
      }),
      preset(P.ORCAMENTO, 'Parceiro · enviou para orçamento', '#92400e', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0104',
        'patlasv4proto-demanda-status': 'Em orçamento',
        'patlasv4proto-demanda-origem': 'Parceiro',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Bernardo Almeida',
        'patlasv4proto-demanda-data-evento': '2026-07-02',
        'patlasv4proto-demanda-contrato': 'CTR-2024-0088',
        'patlasv4proto-demanda-produto': 'MTI CLOUD — Serviços em nuvem',
        'patlasv4proto-demanda-descricao': 'Demanda exige orçamento fora do escopo contratado.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'Parceiro Cloud MT',
        'patlasv4proto-demanda-qualificado': false,
        'patlasv4proto-demanda-desc-atendimento': 'Encaminhado ao fluxo de orçamento.',
        'patlasv4proto-demanda-criado-em': '2026-07-02',
        'patlasv4proto-demanda-atualizado-em': '2026-07-11',
        'patlasv4proto-demanda-ultimo-ator': 'Parceiro · Parceiro Cloud MT',
        'patlasv4proto-demanda-ultima-acao': 'Enviou para orçamento',
      }),
      preset(P.DEVOLVIDA, 'Parceiro · devolveu para correção', '#b45309', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0105',
        'patlasv4proto-demanda-status': 'Devolvida para correção',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-data-evento': '2026-06-28',
        'patlasv4proto-demanda-contrato': 'CTR-2025-0142',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao': 'Descrição incompleta — parceiro devolveu.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-motivo':
          'Falta detalhar unidades impactadas e prazo desejado. Anexar ofício atualizado.',
        'patlasv4proto-demanda-criado-em': '2026-06-28',
        'patlasv4proto-demanda-atualizado-em': '2026-07-09',
        'patlasv4proto-demanda-ultimo-ator': 'Parceiro · EloGroup',
        'patlasv4proto-demanda-ultima-acao': 'Devolveu para correção (cliente)',
      }),
      preset(P.RECUSADA, 'Parceiro · recusa (assinatura conjunta)', '#991b1b', {
        'patlasv4proto-demanda-numero': 'DEM-2026-0106',
        'patlasv4proto-demanda-status': 'Recusada',
        'patlasv4proto-demanda-origem': 'Cliente',
        'patlasv4proto-demanda-cliente': 'Secretaria de Estado de Planejamento e Gestão',
        'patlasv4proto-demanda-contato': 'Lucas Costa',
        'patlasv4proto-demanda-data-evento': '2026-06-20',
        'patlasv4proto-demanda-contrato': 'CTR-2025-0142',
        'patlasv4proto-demanda-produto': 'MTI Simplifica — Desburocratização',
        'patlasv4proto-demanda-descricao': 'Pedido fora do escopo e sem enquadramento em orçamento.',
        'patlasv4proto-demanda-parceiro-notificado': true,
        'patlasv4proto-demanda-parceiro-nome': 'EloGroup',
        'patlasv4proto-demanda-motivo':
          'Não há enquadramento contratual nem viabilidade de orçamento neste ciclo. Assinaturas: MTI + EloGroup.',
        'patlasv4proto-demanda-criado-em': '2026-06-20',
        'patlasv4proto-demanda-atualizado-em': '2026-07-07',
        'patlasv4proto-demanda-ultimo-ator': 'Parceiro · EloGroup (+ MTI)',
        'patlasv4proto-demanda-ultima-acao': 'Recusou demanda (rito com parceria)',
      }),
    ],
    activeExamplePresetId: P.AGUARDANDO_PARCEIRO,
    fieldVisibilityRules: [],
  }
}

function buildParceiroFlow() {
  return {
    id: FLOW_ID,
    name: 'Demanda — Fluxo do Parceiro (back-office)',
    metadata:
      'Protótipo do rito Demanda sob a ótica do Parceiro (20/07/2026). ' +
      'Parceiro só entra após notificação (automática ou pós-qualificação MTI). ' +
      'Análise compartilhada: via contrato, orçamento, devolver ou recusar.',
    steps: [
      {
        id: 'step-parc-intro',
        title: '0. Visão — Parceiro',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · Parceiro',
        htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:880px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#004a8d;font-size:22px">Demanda no back-office — papel do Parceiro</h1>
  <p style="margin:0 0 12px;color:#475569">A MTI e o Parceiro operam no <strong>back-office</strong> (não no portal do cliente). O portal só abre/acompanha/autoriza.</p>
  <h2 style="margin:16px 0 8px;font-size:16px">Quando o parceiro entra</h2>
  <ul style="margin:0;padding-left:18px">
    <li><strong>Automático:</strong> 1 solução do contrato com parceria → notifica o parceiro.</li>
    <li><strong>Após MTI:</strong> Outros / várias soluções / sem parceria → MTI qualifica e pode notificar.</li>
    <li><strong>Gate:</strong> sem <em>parceiro notificado</em>, o parceiro não vê ações.</li>
  </ul>
  <h2 style="margin:16px 0 8px;font-size:16px">O que o parceiro faz na análise</h2>
  <ol style="margin:0;padding-left:18px">
    <li>Iniciar análise</li>
    <li>Atendimento via contrato → cliente autoriza</li>
    <li>Enviar para orçamento</li>
    <li>Devolver correção ou Recusar (com parceria: assinatura MTI + parceiro)</li>
  </ol>
</div>`,
      },
      {
        id: 'step-parc-receber',
        title: '1. Parceiro recebe a demanda',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.receber',
        assigneeRole: 'Parceiro',
        bpmnDescription:
          'Demanda em Aguardando análise com parceiroNotificado=true. Classe Demanda no Explorer.',
        linkedFormId: FORM,
        bpmnPossiblePaths: [{ key: 'Iniciar análise', value: 'step-parc-analise' }],
        bpmnOutputs: 'Status → Em análise',
        classMethodNavigateStepIds: {
          'method-demanda-iniciar-analise': 'step-parc-analise',
        },
      },
      {
        id: 'step-parc-analise',
        title: '2. Em análise — quatro caminhos',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.analise',
        assigneeRole: 'Parceiro (+ MTI)',
        bpmnDescription:
          'Análise compartilhada. Evitar sobrescrita: indicar quem já abriu ação. Qualificar permanece só MTI.',
        linkedFormId: FORM,
        bpmnPossiblePaths: [
          { key: 'Via contrato', value: 'step-parc-via-contrato' },
          { key: 'Orçamento', value: 'step-parc-orcamento' },
          { key: 'Devolver correção', value: 'step-parc-devolver' },
          { key: 'Recusar', value: 'step-parc-recusar' },
        ],
        classMethodNavigateStepIds: {
          'method-demanda-via-contrato': 'step-parc-via-contrato',
          'method-demanda-orcamento': 'step-parc-orcamento',
          'method-demanda-devolver': 'step-parc-devolver',
          'method-demanda-recusar': 'step-parc-recusar',
        },
      },
      {
        id: 'step-parc-via-contrato',
        title: '3a. Atendimento via contrato',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.viaContrato',
        assigneeRole: 'Parceiro',
        bpmnDescription: 'Catálogos + itens (plural) + descrição + anexos/OS → encaminha cliente autorizar.',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-via-contrato',
        bpmnPossiblePaths: [{ key: 'Encaminhar cliente', value: 'step-parc-autorizar' }],
      },
      {
        id: 'step-parc-orcamento',
        title: '3b. Enviar para orçamento',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.orcamento',
        assigneeRole: 'Parceiro',
        bpmnDescription: 'Sai deste BPM para o fluxo de orçamento.',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-orcamento',
        bpmnPossiblePaths: [{ key: 'Fim — Em orçamento', value: 'step-parc-fim-orcamento' }],
      },
      {
        id: 'step-parc-devolver',
        title: '3c. Devolver para correção',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.devolver',
        assigneeRole: 'Parceiro',
        bpmnDescription: 'Motivo + assinatura. Cliente corrige no portal e reenvia → volta à análise.',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-devolver',
        bpmnPossiblePaths: [{ key: 'Cliente reenvia', value: 'step-parc-analise' }],
      },
      {
        id: 'step-parc-recusar',
        title: '3d. Recusar (parceria)',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.recusar',
        assigneeRole: 'Parceiro + MTI',
        bpmnDescription: 'Com parceria: assinatura MTI e parceiro. Cliente pode reabrir.',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-recusar',
        bpmnPossiblePaths: [{ key: 'Confirmar recusa', value: 'step-parc-fim-recusa' }],
      },
      {
        id: 'step-parc-autorizar',
        title: '4. Cliente autoriza (portal)',
        type: 'bpmnActivity',
        bpmnTaskType: 'userTask',
        bpmnActivityKey: 'demanda.parceiro.autorizar',
        assigneeRole: 'Cliente',
        bpmnDescription:
          'Portal. Autorizar gera/usa OS e cargos (GP, FALP, pós-vendas, parceiro) → ServiceNow.',
        linkedFormId: 'form-patlasv4-proto-metodo-demanda-autorizar',
        bpmnPossiblePaths: [
          { key: 'Autorizar', value: 'step-parc-fim-ok' },
          { key: 'Não autorizar', value: 'step-parc-fim-nao-aut' },
        ],
      },
      {
        id: 'step-parc-fim-ok',
        title: 'Fim — Em atendimento',
        type: 'html',
        htmlPresentationShowHeader: true,
        htmlPresentationHeaderTitle: 'Atlas · Demanda · Parceiro',
        htmlContent:
          '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px;color:#0f172a"><h2 style="color:#166534">Aprovada · em atendimento</h2><p>Demanda autorizada. Parceiro pode constar nos cargos de assinatura/handover. Esteira OS = modelagem seguinte.</p></div>',
      },
      {
        id: 'step-parc-fim-orcamento',
        title: 'Fim — Orçamento',
        type: 'html',
        htmlContent:
          '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px"><h2>Em orçamento</h2><p>Fluxo de orçamento é agenda própria — fora deste BPM do parceiro.</p></div>',
      },
      {
        id: 'step-parc-fim-recusa',
        title: 'Fim — Recusada',
        type: 'html',
        htmlContent:
          '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px"><h2>Recusada</h2><p>Cliente pode reabrir com justificativa → retorna à análise (não renasce do zero).</p></div>',
      },
      {
        id: 'step-parc-fim-nao-aut',
        title: 'Fim — Não autorizada',
        type: 'html',
        htmlContent:
          '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:720px;padding:8px"><h2>Não autorizada</h2><p>Cliente recusou a autorização. Pode reabrir.</p></div>',
      },
    ],
  }
}

function upsertForm(forms, form) {
  const i = forms.findIndex((x) => x.id === form.id)
  if (i >= 0) forms[i] = form
  else forms.push(form)
}

function upsertFlow(flows, flow) {
  const i = flows.findIndex((x) => x.id === flow.id)
  if (i >= 0) flows[i] = flow
  else flows.push(flow)
}

function patchGroups(groups) {
  groups.formToGroupId = groups.formToGroupId ?? {}
  groups.groupToFormIds = groups.groupToFormIds ?? {}
  groups.formToGroupId[FORM] = 'grp-10-fluxo'
  const list = groups.groupToFormIds['grp-10-fluxo'] ?? []
  if (!list.includes(FORM)) list.unshift(FORM)
  groups.groupToFormIds['grp-10-fluxo'] = list
  return groups
}

function patchWorkspaces(workspaces) {
  for (const ws of workspaces) {
    for (const pkg of ws.packages ?? []) {
      // Remove duplicates from other packages first
      if (pkg.classes) {
        pkg.classes = pkg.classes.filter((c) => c.id !== 'cls-mapa-demanda')
      }
      if (pkg.id !== 'pkg-fase-2-fluxo') continue
      const classes = pkg.classes ?? []
      classes.unshift({
        id: 'cls-mapa-demanda',
        name: '(10.0) Demanda',
        linkedFormId: FORM,
        linkedFormExamplePresetIds: [
          P.AGUARDANDO_PARCEIRO,
          P.EM_ANALISE,
          P.VIA_CONTRATO,
          P.ORCAMENTO,
          P.DEVOLVIDA,
          P.RECUSADA,
        ],
      })
      pkg.classes = classes
    }
  }
  return workspaces
}

function patchExistingDemandaFlow(flows) {
  const flow = flows.find((x) => x.id === 'flow-proto-demanda-completa')
  if (!flow) return
  for (const step of flow.steps ?? []) {
    if (
      step.linkedFormId === 'form-patlasv4-proto-processos' &&
      ['step-dem-abrir', 'step-dem-hierarquia', 'step-dem-rotear', 'step-dem-servicenow'].includes(
        step.id,
      )
    ) {
      step.linkedFormId = FORM
    }
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const groups = JSON.parse(fs.readFileSync(GROUPS_PATH, 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(WS_PATH, 'utf8'))
  const flows = JSON.parse(fs.readFileSync(FLOWS_PATH, 'utf8'))

  upsertForm(forms, buildDemandaForm())
  upsertFlow(flows, buildParceiroFlow())
  patchExistingDemandaFlow(flows)
  patchGroups(groups)
  patchWorkspaces(workspaces)

  fs.writeFileSync(FORMS_PATH, JSON.stringify(forms, null, 2) + '\n')
  fs.writeFileSync(GROUPS_PATH, JSON.stringify(groups, null, 2) + '\n')
  fs.writeFileSync(WS_PATH, JSON.stringify(workspaces, null, 2) + '\n')
  fs.writeFileSync(FLOWS_PATH, JSON.stringify(flows, null, 2) + '\n')

  if (fs.existsSync(CONTEXT_PATH)) {
    let ctx = fs.readFileSync(CONTEXT_PATH, 'utf8')
    const note =
      '\n\n## Demanda (parceiro)\n\n```bash\nnode scripts/patch-atlas-prototipo-demanda-parceiro.mjs\n```\n\nClasse `(10.0) Demanda` + apresentação `Demanda — Fluxo do Parceiro (back-office)`.\n'
    if (!ctx.includes('patch-atlas-prototipo-demanda-parceiro')) {
      fs.writeFileSync(CONTEXT_PATH, ctx.trimEnd() + note)
    }
  }

  console.log('OK — classe', FORM)
  console.log('OK — fluxo', FLOW_ID)
  console.log('OK — workspace cls-mapa-demanda + grp-10-fluxo')
}

main()
