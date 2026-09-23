/**
 * Atlas — Fase 1 (Proposta → Documentos → Workflow → Assinatura → Contrato).
 * Novas classes: organização, motor de workflow versionado, templates/documentos,
 * checklist contratual, integrações, notificações e visão operacional consolidada.
 */

import { FORM_MAESTRO_RECORRENCIA } from './atlas-catalog-forms.mjs'
import { FORM_PROPOSTA, FORM_PROPOSTA_ITEM } from './atlas-proposta-forms.mjs'

export const FORM_ORGANIZACAO = 'form-atlas-organizacao'
export const FORM_USUARIO = 'form-atlas-usuario'
export const FORM_WF_MODELO = 'form-atlas-workflow-modelo'
export const FORM_WF_VERSAO = 'form-atlas-workflow-versao'
export const FORM_WF_ETAPA = 'form-atlas-workflow-etapa'
export const FORM_WF_INSTANCIA = 'form-atlas-workflow-instancia'
export const FORM_WF_EVENTO = 'form-atlas-workflow-evento'
export const FORM_DOC_TEMPLATE = 'form-atlas-documento-template'
export const FORM_DOC_PARAMETRO = 'form-atlas-documento-parametro'
export const FORM_DOC_GERADO = 'form-atlas-documento-gerado'
export const FORM_CHECKLIST = 'form-atlas-checklist-contratual'
export const FORM_INTEGRACAO = 'form-atlas-integracao-evento'
export const FORM_NOTIFICACAO = 'form-atlas-notificacao-processo'
export const FORM_VISAO_FASE1 = 'form-atlas-visao-fase1-operacional'
export const FORM_FASE1_GOVERNANCA = 'form-atlas-fase1-governanca'

export const FORM_TRAMITE_ASSINATURA = 'form-atlas-tramite-assinatura'
export const FORM_CONTRATO_GESTAO = 'form-atlas-contrato-gestao'
const FORM_PROCESSO_CONTRATUAL = 'form-atlas-processo-contratual'

const AREAS_FASE1 = ['DIRC', 'UGVEN', 'UGEPV', 'UGPEN', 'DTIC', 'DAFI', 'Presidência', 'Parceiro', 'Cliente', 'Sistema']
const AREAS_FASE1_SEM_CS = ['DIRC', 'UGVEN', 'UGEPV', 'UGPEN', 'DTIC', 'DAFI', 'Presidência', 'Parceiro', 'Cliente']
const AREAS_FASE1_OWNER = ['DIRC', 'UGVEN', 'UGEPV', 'UGPEN', 'DTIC', 'DAFI', 'Presidência', 'Parceiro']
const AREAS_FASE1_TEMPLATE = ['DIRC', 'UGVEN', 'UGEPV', 'UGPEN', 'DTIC', 'DAFI', 'Presidência']
const TIPOS_ORG = ['Cliente', 'Parceiro', 'MTI', 'Unidade MTI', 'Órgão do Estado', 'Órgão externo']

// =====================================================================
// Organização
// =====================================================================

export const organizacaoForm = {
  id: FORM_ORGANIZACAO,
  name: 'Organização',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'edit',
  metadata: 'Cadastro de organizações envolvidas na Fase 1, incluindo clientes, parceiros, unidades MTI e órgãos vinculados.',
  methods: [
    { id: 'atlas-org-meth-validar-cnpj', name: 'Validar CNPJ', icon: 'verified', kind: 'destaque' },
    { id: 'atlas-org-meth-inativar', name: 'Inativar', icon: 'cancel', kind: 'menu' },
  ],
  sections: [
    { id: 'sec-org-ident', title: 'Identificação', icon: 'business' },
    { id: 'sec-org-contatos', title: 'Contatos', icon: 'person' },
    { id: 'sec-org-governanca', title: 'Governança', icon: 'account_tree' },
  ],
  fields: [
    { id: 'atlas-org-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-org-ident', spec: 'Nome amigável da organização exibido nos processos.' },
    { id: 'atlas-org-razao-social', label: 'Razão social', type: 'text', size: 'large', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-org-ident', spec: 'Razão social quando a organização possuir CNPJ.' },
    { id: 'atlas-org-sigla', label: 'Sigla', type: 'text', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-org-ident', spec: 'Sigla usada em propostas, contratos e filtros.' },
    { id: 'atlas-org-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-org-ident', options: TIPOS_ORG, spec: 'Classificação da organização no Atlas.' },
    { id: 'atlas-org-cnpj', label: 'CNPJ', type: 'text', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-org-ident', spec: 'CNPJ utilizado para vínculo contratual e fiscal.' },
    { id: 'atlas-org-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-org-ident', options: ['Ativa', 'Inativa', 'Em validação', 'Bloqueada'], spec: 'Situação de uso da organização.' },
    { id: 'atlas-org-email', label: 'E-mail principal', type: 'text', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-org-contatos', spec: 'E-mail padrão para notificações institucionais.' },
    { id: 'atlas-org-telefone', label: 'Telefone', type: 'text', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-org-contatos', spec: 'Telefone institucional de contato.' },
    { id: 'atlas-org-gestor-contrato', label: 'Gestor contrato', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-org-contatos', linkedFormId: FORM_USUARIO, spec: 'Usuário responsável pelo contrato ou relacionamento.' },
    { id: 'atlas-org-contatos-notificacao', label: 'E-mails notificação', type: 'text', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', sectionId: 'sec-org-contatos', spec: 'Lista de e-mails que recebem avisos de proposta, assinatura e contrato.' },
    { id: 'atlas-org-superior', label: 'Organização superior', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-org-governanca', linkedFormId: FORM_ORGANIZACAO, spec: 'Organização pai quando houver hierarquia.' },
    { id: 'atlas-org-observacoes', label: 'Observações', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-org-governanca', spec: 'Observações gerais sobre uso, restrições ou vínculo institucional.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-org-preset-mti-cliente',
      name: 'Cliente órgão estadual',
      iconColor: '#0c1ba8',
      fieldValues: {
        'atlas-org-nome': 'Secretaria Cliente Demo',
        'atlas-org-razao-social': 'Secretaria Cliente Demo',
        'atlas-org-sigla': 'SCD',
        'atlas-org-tipo': 'Cliente',
        'atlas-org-cnpj': '00.000.000/0001-00',
        'atlas-org-status': 'Ativa',
        'atlas-org-email': 'gestao.contrato@cliente.demo.mt.gov.br',
        'atlas-org-telefone': '(65) 0000-0000',
        'atlas-org-contatos-notificacao': ['gestao.contrato@cliente.demo.mt.gov.br', 'financeiro@cliente.demo.mt.gov.br'],
        'atlas-org-observacoes': 'Cliente usado para demonstrar proposta e contrato na Fase 1.',
      },
    },
    {
      id: 'atlas-org-preset-parceiro-simplifica',
      name: 'Parceiro MTI Simplifica',
      iconColor: '#059669',
      fieldValues: {
        'atlas-org-nome': 'Parceiro Simplifica Demo',
        'atlas-org-razao-social': 'Parceiro Simplifica Demo Ltda.',
        'atlas-org-sigla': 'SIMPLIFICA',
        'atlas-org-tipo': 'Parceiro',
        'atlas-org-cnpj': '11.111.111/0001-11',
        'atlas-org-status': 'Ativa',
        'atlas-org-email': 'parcerias@simplifica.demo',
        'atlas-org-contatos-notificacao': ['parcerias@simplifica.demo', 'contratos@simplifica.demo'],
      },
    },
  ],
  activeExamplePresetId: 'atlas-org-preset-mti-cliente',
}

// =====================================================================
// Workflow — modelo / versão / etapa / instância / evento
// =====================================================================

export const wfEtapaForm = {
  id: FORM_WF_ETAPA,
  name: 'Workflow — etapa',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'edit',
  metadata: 'Etapa configurável de workflow com responsável, SLA, documentos, assinatura e caminho de retorno.',
  sections: [
    { id: 'sec-wfe-ident', title: 'Etapa', icon: 'assignment' },
    { id: 'sec-wfe-regra', title: 'Regras', icon: 'tune' },
    { id: 'sec-wfe-transicoes', title: 'Transições', icon: 'account_tree' },
  ],
  fields: [
    { id: 'atlas-wfe-ordem', label: 'Ordem', type: 'number', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfe-ident', spec: 'Ordem sequencial da etapa dentro da versão.' },
    { id: 'atlas-wfe-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-wfe-ident', spec: 'Nome da etapa exibido no processo.' },
    { id: 'atlas-wfe-tipo', label: 'Tipo etapa', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfe-ident', options: ['Entrada', 'Edição', 'Revisão', 'Assinatura', 'Decisão', 'Notificação', 'Finalização', 'Integração'], spec: 'Tipo funcional da etapa.' },
    { id: 'atlas-wfe-area-responsavel', label: 'Área responsável', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'common', sectionId: 'sec-wfe-ident', options: AREAS_FASE1, spec: 'Área que recebe ou executa a etapa.' },
    { id: 'atlas-wfe-perfil-responsavel', label: 'Perfil responsável', type: 'text', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-ident', spec: 'Perfil, papel ou regra de responsável pela tarefa.' },
    { id: 'atlas-wfe-exige-assinatura', label: 'Exige assinatura', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-wfe-regra', spec: 'Define se a etapa cria trâmite de assinatura.' },
    { id: 'atlas-wfe-tipo-assinatura', label: 'Tipo assinatura', type: 'textOptions', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-regra', options: ['Certificado digital', 'Gov.br', 'MT Login', 'Senha', 'Aceite simples', 'Não se aplica'], spec: 'Mecanismo esperado para assinatura ou aceite.' },
    { id: 'atlas-wfe-exige-documento', label: 'Exige documento', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-regra', spec: 'Define se a etapa exige anexo ou documento gerado.' },
    { id: 'atlas-wfe-documento-template', label: 'Template', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-regra', linkedFormId: FORM_DOC_TEMPLATE, spec: 'Template associado à etapa quando houver documento.' },
    { id: 'atlas-wfe-sla-dias', label: 'SLA dias', type: 'number', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-regra', spec: 'Prazo padrão em dias úteis para a etapa.' },
    { id: 'atlas-wfe-acao-atraso', label: 'Ação atraso', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-wfe-regra', spec: 'Ação esperada quando o SLA for ultrapassado.' },
    { id: 'atlas-wfe-retorna-para', label: 'Retorna para', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-wfe-transicoes', linkedFormId: FORM_WF_ETAPA, spec: 'Etapa para retorno em caso de ajuste ou reprovação.' },
    { id: 'atlas-wfe-proxima-aprovado', label: 'Próxima aprovado', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfe-transicoes', linkedFormId: FORM_WF_ETAPA, spec: 'Próxima etapa quando o resultado for aprovado.' },
    { id: 'atlas-wfe-proxima-reprovado', label: 'Próxima reprovado', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-wfe-transicoes', linkedFormId: FORM_WF_ETAPA, spec: 'Próxima etapa quando o resultado for reprovado.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-wfe-preset-assinatura-dtic',
      name: 'Etapa de assinatura DTIC',
      iconColor: '#7c3aed',
      fieldValues: {
        'atlas-wfe-ordem': 4,
        'atlas-wfe-nome': 'Assinatura DTIC',
        'atlas-wfe-tipo': 'Assinatura',
        'atlas-wfe-area-responsavel': 'DTIC',
        'atlas-wfe-perfil-responsavel': 'Aprovador técnico',
        'atlas-wfe-exige-assinatura': 'true',
        'atlas-wfe-tipo-assinatura': 'MT Login',
        'atlas-wfe-exige-documento': 'true',
        'atlas-wfe-sla-dias': 2,
        'atlas-wfe-acao-atraso': 'Reenviar notificação e escalar ao gestor DTIC.',
      },
    },
  ],
  activeExamplePresetId: 'atlas-wfe-preset-assinatura-dtic',
}

const EMB_WF_ETAPAS = 'emb_workflow_etapas'
const EMB_WF_VERSOES = 'emb_workflow_versoes'
const EMB_WF_EVENTOS = 'emb_workflow_eventos'

export const wfVersaoForm = {
  id: FORM_WF_VERSAO,
  name: 'Workflow — versão',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'edit',
  metadata: 'Versão congelada de um workflow para preservar processos já iniciados sem perda processual.',
  methods: [
    { id: 'atlas-wfv-meth-clonar', name: 'Clonar versão', icon: 'compare', kind: 'destaque' },
  ],
  sections: [
    { id: 'sec-wfv-ident', title: 'Identificação', icon: 'history' },
    { id: 'sec-wfv-etapas', title: 'Etapas', icon: 'linear_scale' },
  ],
  fields: [
    { id: 'atlas-wfv-modelo', label: 'Modelo', type: 'reference', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-wfv-ident', linkedFormId: FORM_WF_MODELO, spec: 'Modelo de workflow ao qual esta versão pertence.' },
    { id: 'atlas-wfv-numero', label: 'Versão', type: 'text', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfv-ident', spec: 'Número da versão, por exemplo 1.0 ou 1.1.' },
    { id: 'atlas-wfv-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfv-ident', options: ['Rascunho', 'Ativa', 'Encerrada', 'Substituída'], spec: 'Situação da versão.' },
    { id: 'atlas-wfv-inicio', label: 'Início vigência', type: 'date', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfv-ident', spec: 'Data de início da versão para novas instâncias.' },
    { id: 'atlas-wfv-fim', label: 'Fim vigência', type: 'date', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-wfv-ident', spec: 'Data de encerramento da versão.' },
    { id: 'atlas-wfv-observacao', label: 'Observação', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfv-ident', spec: 'Justificativa ou nota sobre alterações desta versão.' },
    { id: EMB_WF_ETAPAS, label: 'Etapas', type: 'embeddedReference', size: 'large', readOnly: false, required: true, multiple: true, relevance: 'common', sectionId: 'sec-wfv-etapas', linkedFormId: FORM_WF_ETAPA, embeddedDisplay: 'table', spec: 'Etapas que compõem a versão do fluxo.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-wfv-preset-v1-proposta',
      name: 'Versão 1.0 — proposta',
      iconColor: '#6366f1',
      fieldValues: {
        'atlas-wfv-modelo': 'Workflow padrão de proposta',
        'atlas-wfv-numero': '1.0',
        'atlas-wfv-status': 'Ativa',
        'atlas-wfv-inicio': '2026-05-23',
        'atlas-wfv-observacao': 'Fluxo inicial usado para protótipo da Fase 1.',
      },
      embeddedRowsByFieldId: {
        [EMB_WF_ETAPAS]: [
          { 'atlas-wfe-ordem': 1, 'atlas-wfe-nome': 'Registrar demanda', 'atlas-wfe-tipo': 'Entrada', 'atlas-wfe-area-responsavel': 'DIRC', 'atlas-wfe-exige-assinatura': 'false', 'atlas-wfe-sla-dias': 1 },
          { 'atlas-wfe-ordem': 2, 'atlas-wfe-nome': 'Compor proposta', 'atlas-wfe-tipo': 'Edição', 'atlas-wfe-area-responsavel': 'DIRC', 'atlas-wfe-exige-assinatura': 'false', 'atlas-wfe-sla-dias': 3 },
          { 'atlas-wfe-ordem': 3, 'atlas-wfe-nome': 'Assinatura DIRC/parceiro', 'atlas-wfe-tipo': 'Assinatura', 'atlas-wfe-area-responsavel': 'Parceiro', 'atlas-wfe-exige-assinatura': 'true', 'atlas-wfe-tipo-assinatura': 'MT Login', 'atlas-wfe-sla-dias': 2 },
          { 'atlas-wfe-ordem': 4, 'atlas-wfe-nome': 'Assinatura DTIC', 'atlas-wfe-tipo': 'Assinatura', 'atlas-wfe-area-responsavel': 'DTIC', 'atlas-wfe-exige-assinatura': 'true', 'atlas-wfe-tipo-assinatura': 'MT Login', 'atlas-wfe-sla-dias': 2 },
          { 'atlas-wfe-ordem': 5, 'atlas-wfe-nome': 'Assinatura Presidência', 'atlas-wfe-tipo': 'Assinatura', 'atlas-wfe-area-responsavel': 'Presidência', 'atlas-wfe-exige-assinatura': 'true', 'atlas-wfe-tipo-assinatura': 'Certificado digital', 'atlas-wfe-sla-dias': 2 },
          { 'atlas-wfe-ordem': 6, 'atlas-wfe-nome': 'Cadastro contratual', 'atlas-wfe-tipo': 'Finalização', 'atlas-wfe-area-responsavel': 'DIRC', 'atlas-wfe-exige-assinatura': 'false', 'atlas-wfe-sla-dias': 3 },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-wfv-preset-v1-proposta',
}

export const wfModeloForm = {
  id: FORM_WF_MODELO,
  name: 'Workflow — modelo',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'edit',
  metadata: 'Modelo configurável de fluxo para propostas, contratos, documentos e assinaturas da Fase 1.',
  methods: [
    { id: 'atlas-wfm-meth-criar-versao', name: 'Criar versão', icon: 'add_shopping_cart', kind: 'destaque' },
    { id: 'atlas-wfm-meth-ativar', name: 'Ativar modelo', icon: 'verified', kind: 'menu' },
  ],
  sections: [
    { id: 'sec-wfm-ident', title: 'Identificação', icon: 'account_tree' },
    { id: 'sec-wfm-controle', title: 'Controle', icon: 'tune' },
    { id: 'sec-wfm-versoes', title: 'Versões', icon: 'history' },
  ],
  fields: [
    { id: 'atlas-wfm-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-wfm-ident', spec: 'Nome do modelo de workflow.' },
    { id: 'atlas-wfm-dominio', label: 'Domínio', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfm-ident', options: ['Proposta', 'Contrato', 'Documento', 'Ordem de serviço', 'Homologação', 'Outro'], spec: 'Domínio de negócio atendido pelo workflow.' },
    { id: 'atlas-wfm-area-dona', label: 'Área dona', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfm-ident', options: AREAS_FASE1_OWNER, spec: 'Área responsável pela governança do fluxo.' },
    { id: 'atlas-wfm-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfm-controle', options: ['Rascunho', 'Ativo', 'Suspenso', 'Substituído', 'Arquivado'], spec: 'Situação do modelo para uso nos processos.' },
    { id: 'atlas-wfm-permite-configuracao', label: 'No low-code', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfm-controle', spec: 'Indica se o fluxo pode ser configurado por usuário autorizado.' },
    { id: 'atlas-wfm-versao-ativa', label: 'Versão ativa', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfm-controle', linkedFormId: FORM_WF_VERSAO, spec: 'Versão atualmente utilizada para novas instâncias.' },
    { id: 'atlas-wfm-descricao', label: 'Descrição', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfm-controle', spec: 'Explica objetivo, escopo e regra geral do fluxo.' },
    { id: EMB_WF_VERSOES, label: 'Versões', type: 'embeddedReference', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', sectionId: 'sec-wfm-versoes', linkedFormId: FORM_WF_VERSAO, embeddedDisplay: 'table', spec: 'Grade com as versões configuradas para este modelo.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-wfm-preset-proposta',
      name: 'Workflow padrão de proposta',
      iconColor: '#6366f1',
      fieldValues: {
        'atlas-wfm-nome': 'Workflow padrão de proposta',
        'atlas-wfm-dominio': 'Proposta',
        'atlas-wfm-area-dona': 'DIRC',
        'atlas-wfm-status': 'Ativo',
        'atlas-wfm-permite-configuracao': 'true',
        'atlas-wfm-versao-ativa': '1.0',
        'atlas-wfm-descricao': 'Fluxo padrão da Fase 1 para proposta, revisão, assinatura DIRC/parceiro, DTIC, Presidência e cadastro contratual.',
      },
      embeddedRowsByFieldId: {
        [EMB_WF_VERSOES]: [
          { 'atlas-wfv-numero': '1.0', 'atlas-wfv-status': 'Ativa', 'atlas-wfv-inicio': '2026-05-23', 'atlas-wfv-observacao': 'Versão inicial do fluxo da Fase 1.' },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-wfm-preset-proposta',
}

export const wfEventoForm = {
  id: FORM_WF_EVENTO,
  name: 'Workflow — evento',
  sectionLayout: 'none',
  defaultCanvasMode: 'read',
  metadata: 'Linha de histórico de movimentação de uma instância de workflow.',
  fields: [
    { id: 'atlas-wfev-data', label: 'Data', type: 'date', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'identity', spec: 'Data do evento.' },
    { id: 'atlas-wfev-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', options: ['Criação', 'Envio', 'Assinatura', 'Aprovação', 'Reprovação', 'Ajuste', 'Notificação', 'Integração', 'Conclusão', 'Cancelamento'], spec: 'Tipo de evento registrado.' },
    { id: 'atlas-wfev-etapa', label: 'Etapa', type: 'text', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', spec: 'Nome da etapa relacionada ao evento.' },
    { id: 'atlas-wfev-responsavel', label: 'Responsável', type: 'text', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', spec: 'Usuário ou área que executou o evento.' },
    { id: 'atlas-wfev-descricao', label: 'Descrição', type: 'text', size: 'large', textLong: true, readOnly: true, required: false, multiple: false, relevance: 'common', spec: 'Descrição resumida do evento ocorrido.' },
  ],
}

export const wfInstanciaForm = {
  id: FORM_WF_INSTANCIA,
  name: 'Workflow — instância',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'read',
  metadata: 'Execução real de um workflow para uma proposta, documento ou contrato.',
  methods: [
    { id: 'atlas-wfi-meth-avancar', name: 'Avançar etapa', icon: 'send', kind: 'destaque' },
    { id: 'atlas-wfi-meth-solicitar-ajuste', name: 'Solicitar ajuste', icon: 'edit_note', kind: 'menu' },
    { id: 'atlas-wfi-meth-cancelar', name: 'Cancelar fluxo', icon: 'cancel', kind: 'menu' },
  ],
  sections: [
    { id: 'sec-wfi-ident', title: 'Identificação', icon: 'account_tree' },
    { id: 'sec-wfi-andamento', title: 'Andamento', icon: 'linear_scale' },
    { id: 'sec-wfi-eventos', title: 'Eventos', icon: 'history' },
  ],
  fields: [
    { id: 'atlas-wfi-numero', label: 'Número', type: 'text', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-wfi-ident', spec: 'Identificador gerado para a instância do workflow.' },
    { id: 'atlas-wfi-modelo', label: 'Modelo', type: 'reference', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'common', sectionId: 'sec-wfi-ident', linkedFormId: FORM_WF_MODELO, spec: 'Modelo de workflow utilizado.' },
    { id: 'atlas-wfi-versao', label: 'Versão', type: 'reference', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-ident', linkedFormId: FORM_WF_VERSAO, spec: 'Versão congelada usada pela instância.' },
    { id: 'atlas-wfi-objeto-tipo', label: 'Objeto tipo', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-ident', options: ['Proposta', 'Contrato', 'Documento', 'Outro'], spec: 'Tipo do objeto principal que está sendo tramitado.' },
    { id: 'atlas-wfi-objeto-resumo', label: 'Objeto resumo', type: 'text', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfi-ident', spec: 'Texto de identificação do objeto principal.' },
    { id: 'atlas-wfi-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-andamento', options: ['Em andamento', 'Aguardando assinatura', 'Aguardando ajuste', 'Concluído', 'Cancelado', 'Expirado'], spec: 'Situação atual da execução.' },
    { id: 'atlas-wfi-etapa-atual', label: 'Etapa atual', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-andamento', linkedFormId: FORM_WF_ETAPA, spec: 'Etapa onde o processo está parado no momento.' },
    { id: 'atlas-wfi-responsavel-atual', label: 'Responsável atual', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfi-andamento', linkedFormId: FORM_USUARIO, spec: 'Usuário que possui a pendência atual quando houver.' },
    { id: 'atlas-wfi-area-atual', label: 'Área atual', type: 'textOptions', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfi-andamento', options: AREAS_FASE1, spec: 'Área que deve atuar na etapa atual.' },
    { id: 'atlas-wfi-data-inicio', label: 'Data início', type: 'date', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-wfi-andamento', spec: 'Data de abertura da instância.' },
    { id: 'atlas-wfi-data-limite', label: 'Data limite', type: 'date', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-andamento', spec: 'Data limite calculada a partir do SLA da etapa.' },
    { id: 'atlas-wfi-dias-parado', label: 'Dias parado', type: 'number', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-wfi-andamento', spec: 'Quantidade de dias desde a última movimentação.' },
    { id: EMB_WF_EVENTOS, label: 'Eventos', type: 'embeddedReference', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-wfi-eventos', linkedFormId: FORM_WF_EVENTO, embeddedDisplay: 'table', spec: 'Histórico de movimentações, notificações, aprovações e retornos.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-wfi-preset-proposta-pendente-dtic',
      name: 'Proposta parada na DTIC',
      iconColor: '#b45309',
      fieldValues: {
        'atlas-wfi-numero': 'WFI-2026-0001',
        'atlas-wfi-modelo': 'Workflow padrão de proposta',
        'atlas-wfi-versao': '1.0',
        'atlas-wfi-objeto-tipo': 'Proposta',
        'atlas-wfi-objeto-resumo': 'Proposta MTI Simplifica — Secretaria Cliente Demo',
        'atlas-wfi-status': 'Aguardando assinatura',
        'atlas-wfi-etapa-atual': 'Assinatura DTIC',
        'atlas-wfi-responsavel-atual': 'Aprovador Técnico DTIC',
        'atlas-wfi-area-atual': 'DTIC',
        'atlas-wfi-data-inicio': '2026-05-23',
        'atlas-wfi-data-limite': '2026-05-27',
        'atlas-wfi-dias-parado': 2,
      },
      embeddedRowsByFieldId: {
        [EMB_WF_EVENTOS]: [
          { 'atlas-wfev-data': '2026-05-23', 'atlas-wfev-tipo': 'Criação', 'atlas-wfev-etapa': 'Registrar demanda', 'atlas-wfev-responsavel': 'Analista DIRC', 'atlas-wfev-descricao': 'Proposta criada a partir de solicitação do portal.' },
          { 'atlas-wfev-data': '2026-05-24', 'atlas-wfev-tipo': 'Assinatura', 'atlas-wfev-etapa': 'Assinatura DIRC/parceiro', 'atlas-wfev-responsavel': 'DIRC e parceiro', 'atlas-wfev-descricao': 'Assinaturas iniciais concluídas.' },
          { 'atlas-wfev-data': '2026-05-25', 'atlas-wfev-tipo': 'Notificação', 'atlas-wfev-etapa': 'Assinatura DTIC', 'atlas-wfev-responsavel': 'Sistema', 'atlas-wfev-descricao': 'Notificação enviada para aprovador técnico.' },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-wfi-preset-proposta-pendente-dtic',
}

// =====================================================================
// Documentos — template, parâmetro, documento gerado
// =====================================================================

const EMB_TEMPLATE_PARAMETROS = 'emb_template_parametros'
const EMB_DOCUMENTO_TRAMITES = 'emb_documento_tramites'

export const docParametroForm = {
  id: FORM_DOC_PARAMETRO,
  name: 'Documento — parâmetro',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Linha de parâmetro usado por um template documental.',
  fields: [
    { id: 'atlas-dpar-campo-id', label: 'Campo id', type: 'text', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'identity', spec: 'ID do campo usado como placeholder.' },
    { id: 'atlas-dpar-label', label: 'Label', type: 'text', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'common', spec: 'Nome amigável do parâmetro.' },
    { id: 'atlas-dpar-origem', label: 'Origem', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'common', options: ['Proposta', 'Item proposta', 'Contrato', 'Cliente', 'Parceiro', 'Usuário', 'Manual'], spec: 'Origem do valor usado no placeholder.' },
    { id: 'atlas-dpar-obrigatorio', label: 'Obrigatório', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', spec: 'Indica se o parâmetro precisa estar preenchido antes de gerar o documento.' },
  ],
}

export const docTemplateForm = {
  id: FORM_DOC_TEMPLATE,
  name: 'Documento — template',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'edit',
  metadata: 'Modelo parametrizado para geração de propostas, contratos, handover e documentos auxiliares.',
  methods: [
    { id: 'atlas-dtmp-meth-preview', name: 'Pré-visualizar', icon: 'visibility', kind: 'destaque' },
    { id: 'atlas-dtmp-meth-publicar', name: 'Publicar', icon: 'verified', kind: 'menu' },
  ],
  sections: [
    { id: 'sec-dtmp-ident', title: 'Identificação', icon: 'description' },
    { id: 'sec-dtmp-conteudo', title: 'Conteúdo', icon: 'article' },
    { id: 'sec-dtmp-parametros', title: 'Parâmetros', icon: 'tune' },
  ],
  fields: [
    { id: 'atlas-dtmp-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-dtmp-ident', spec: 'Nome do template documental.' },
    { id: 'atlas-dtmp-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-dtmp-ident', options: ['Proposta', 'Contrato', 'Handover', 'Anexo', 'Certidão', 'Extrato publicação', 'Outro'], spec: 'Tipo de documento gerado pelo template.' },
    { id: 'atlas-dtmp-versao', label: 'Versão', type: 'text', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-dtmp-ident', spec: 'Versão do template.' },
    { id: 'atlas-dtmp-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-dtmp-ident', options: ['Rascunho', 'Publicado', 'Substituído', 'Arquivado'], spec: 'Template publicado não é editado diretamente; alterações geram nova versão (rascunho → publicar).' },
    { id: 'atlas-dtmp-alerta-versao', label: 'Versionamento', type: 'alert', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dtmp-ident', alertVariant: 'warning', alertTitle: 'Publicado é imutável', alertMessage: 'Template com status Publicado não deve ser alterado no lugar. Crie nova versão (rascunho), revise o conteúdo e publique novamente.', spec: 'Regra de governança documental Fase 1.' },
    { id: 'atlas-dtmp-area-dona', label: 'Área dona', type: 'textOptions', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dtmp-ident', options: AREAS_FASE1_TEMPLATE, spec: 'Área responsável pelo conteúdo do template.' },
    { id: 'atlas-dtmp-html', label: 'HTML conteúdo', type: 'html', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'common', sectionId: 'sec-dtmp-conteudo', htmlContent: '<p>Use placeholders <code>{{id_do_campo}}</code> aqui — eles serão substituídos pelos valores do preset activo no preview.</p>', spec: 'Conteúdo HTML com placeholders no formato {{id_do_campo}}.' },
    { id: 'atlas-dtmp-alerta', label: 'Atenção', type: 'alert', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dtmp-conteudo', alertVariant: 'info', alertTitle: 'Placeholders', alertMessage: 'Use placeholders com IDs de campos, por exemplo {{atlas-prp-escopo-resumido}}.', spec: 'Orientação de uso para prototipação de templates.' },
    { id: EMB_TEMPLATE_PARAMETROS, label: 'Parâmetros', type: 'embeddedReference', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', sectionId: 'sec-dtmp-parametros', linkedFormId: FORM_DOC_PARAMETRO, embeddedDisplay: 'table', spec: 'Lista de parâmetros esperados pelo template.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-dtmp-preset-proposta-padrao',
      name: 'Template de proposta padrão',
      iconColor: '#0c1ba8',
      fieldValues: {
        'atlas-dtmp-nome': 'Proposta padrão Atlas',
        'atlas-dtmp-tipo': 'Proposta',
        'atlas-dtmp-versao': '1.0',
        'atlas-dtmp-status': 'Publicado',
        'atlas-dtmp-area-dona': 'DIRC',
        'atlas-dtmp-html': '<h1>Proposta Atlas</h1><p>Cliente: {{atlas-prp-cliente-org}}</p><p>Escopo: {{atlas-prp-escopo-resumido}}</p>',
      },
      embeddedRowsByFieldId: {
        [EMB_TEMPLATE_PARAMETROS]: [
          { 'atlas-dpar-campo-id': 'atlas-prp-cliente-org', 'atlas-dpar-label': 'Cliente', 'atlas-dpar-origem': 'Proposta', 'atlas-dpar-obrigatorio': 'true' },
          { 'atlas-dpar-campo-id': 'atlas-prp-escopo-resumido', 'atlas-dpar-label': 'Escopo', 'atlas-dpar-origem': 'Proposta', 'atlas-dpar-obrigatorio': 'true' },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-dtmp-preset-proposta-padrao',
}

export const docGeradoForm = {
  id: FORM_DOC_GERADO,
  name: 'Documento gerado',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'read',
  metadata: 'Documento gerado a partir de template, proposta, contrato ou workflow.',
  methods: [
    { id: 'atlas-dger-meth-baixar', name: 'Baixar', icon: 'open_in_new', kind: 'destaque' },
    { id: 'atlas-dger-meth-enviar-assinatura', name: 'Enviar assinatura', icon: 'draw', kind: 'destaque' },
  ],
  sections: [
    { id: 'sec-dger-ident', title: 'Identificação', icon: 'description' },
    { id: 'sec-dger-arquivo', title: 'Arquivo', icon: 'folder' },
    { id: 'sec-dger-assinatura', title: 'Assinatura', icon: 'draw' },
  ],
  fields: [
    { id: 'atlas-dger-numero', label: 'Número', type: 'text', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-dger-ident', spec: 'Número único do documento gerado.' },
    { id: 'atlas-dger-nome', label: 'Nome', type: 'text', size: 'large', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-dger-ident', spec: 'Nome do documento exibido no processo.' },
    { id: 'atlas-dger-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-dger-ident', options: ['Proposta', 'Contrato', 'Anexo', 'Handover', 'Extrato publicação', 'Outro'], spec: 'Tipo documental.' },
    { id: 'atlas-dger-template', label: 'Template', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dger-ident', linkedFormId: FORM_DOC_TEMPLATE, spec: 'Template usado para gerar o documento (deve estar Publicado na geração).' },
    { id: 'atlas-dger-template-versao', label: 'Versão do template', type: 'text', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dger-ident', spec: 'Versão do template no momento da geração — snapshot documental.' },
    { id: 'atlas-dger-proposta', label: 'Proposta', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dger-ident', linkedFormId: FORM_PROPOSTA, spec: 'Proposta associada ao documento.' },
    { id: 'atlas-dger-proposta-versao', label: 'Versão da proposta', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dger-ident', linkedFormId: 'form-atlas-proposta-versao', spec: 'Versão da proposta vinculada ao documento gerado.' },
    { id: 'atlas-dger-contrato', label: 'Contrato', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-dger-ident', linkedFormId: FORM_CONTRATO_GESTAO, spec: 'Contrato associado ao documento.' },
    { id: 'atlas-dger-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-dger-ident', options: ['Gerado', 'Em assinatura', 'Assinado', 'Substituído', 'Cancelado'], spec: 'Situação do documento no fluxo.' },
    { id: 'atlas-dger-arquivo', label: 'Arquivo', type: 'file', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', sectionId: 'sec-dger-arquivo', spec: 'Arquivo anexado ou gerado pelo sistema.' },
    { id: 'atlas-dger-hash', label: 'Hash', type: 'text', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-dger-arquivo', spec: 'Hash ou identificador de integridade do documento.' },
    { id: 'atlas-dger-exige-assinatura', label: 'Exige assinatura', type: 'boolean', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-dger-assinatura', spec: 'Informa se o documento precisa de assinatura.' },
    { id: 'atlas-dger-status-assinatura', label: 'Status assinatura', type: 'textOptions', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-dger-assinatura', options: ['Não enviada', 'Pendente', 'Parcial', 'Concluída', 'Rejeitada'], spec: 'Consolidação das assinaturas vinculadas ao documento.' },
    { id: EMB_DOCUMENTO_TRAMITES, label: 'Trâmites', type: 'embeddedReference', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-dger-assinatura', linkedFormId: FORM_TRAMITE_ASSINATURA, embeddedDisplay: 'table', spec: 'Trâmites de assinatura do documento.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-dger-preset-proposta-gerada',
      name: 'Documento de proposta gerado',
      iconColor: '#059669',
      fieldValues: {
        'atlas-dger-numero': 'DOC-2026-0001',
        'atlas-dger-nome': 'Proposta MTI Simplifica — Secretaria Cliente Demo',
        'atlas-dger-tipo': 'Proposta',
        'atlas-dger-template': 'Proposta padrão Atlas',
        'atlas-dger-template-versao': '1.0',
        'atlas-dger-proposta': 'Proposta MTI Simplifica em assinatura',
        'atlas-dger-proposta-versao': '1.0 — primeira emissão',
        'atlas-dger-status': 'Em assinatura',
        'atlas-dger-arquivo': [{ name: 'proposta-mti-simplifica.pdf', kind: 'pdf' }],
        'atlas-dger-hash': 'sha256-demo-0001',
        'atlas-dger-exige-assinatura': 'true',
        'atlas-dger-status-assinatura': 'Parcial',
      },
      embeddedRowsByFieldId: {
        [EMB_DOCUMENTO_TRAMITES]: [
          {
            'atlas-tra-grupo-assinatura': 'DTIC',
            'atlas-tra-area': 'DTIC',
            'atlas-tra-assinante': 'Aprovador Técnico DTIC',
            'atlas-tra-papel': 'Concordância técnica',
            'atlas-tra-mecanismo': 'MT Login',
            'atlas-tra-status-pendencia': 'Pendente',
            'atlas-tra-data-envio': '2026-05-25',
            'atlas-tra-data-limite': '2026-05-27',
            'atlas-tra-dias-pendente': 2,
            'atlas-tra-bloqueia-fluxo': 'true',
          },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-dger-preset-proposta-gerada',
}

// =====================================================================
// Checklist contratual
// =====================================================================

const STATUS_INTEGRACAO_CHECKLIST = [
  'Não enviado',
  'Pendente',
  'Enviado',
  'Confirmado',
  'Erro',
  'Reprocessado',
  'Dispensado',
]

export const checklistForm = {
  id: FORM_CHECKLIST,
  name: 'Checklist contratual',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'edit',
  metadata:
    'Checklist do processo contratual antes de finalizar o cadastro. Referencia o processo (não exige contrato final). ' +
    'Contrato em rascunho deve existir antes desta etapa. Integração: status conhecido; negativo/pendente exige justificativa.',
  methods: [
    { id: 'atlas-chk-meth-validar', name: 'Validar checklist', icon: 'verified', kind: 'destaque' },
  ],
  sections: [
    { id: 'sec-chk-ident', title: 'Processo contratual', icon: 'article' },
    { id: 'sec-chk-itens', title: 'Checklist', icon: 'list_alt' },
    { id: 'sec-chk-integracoes', title: 'Eventos de integração', icon: 'cloud_sync' },
  ],
  fields: [
    { id: 'atlas-chk-processo-contratual', label: 'Processo contratual', type: 'reference', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-chk-ident', linkedFormId: FORM_PROCESSO_CONTRATUAL, spec: 'Processo contratual Fase 1 (recebimento e revisão) — identidade do checklist, não o contrato final.' },
    { id: 'atlas-chk-proposta', label: 'Proposta', type: 'reference', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'common', sectionId: 'sec-chk-ident', linkedFormId: FORM_PROPOSTA, spec: 'Proposta vinculada ao processo contratual.' },
    { id: 'atlas-chk-contrato-rascunho', label: 'Contrato rascunho', type: 'reference', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-ident', linkedFormId: FORM_CONTRATO_GESTAO, spec: 'Contrato aberto em rascunho na etapa anterior — referência ao cadastro em andamento, não ao contrato finalizado.' },
    { id: 'atlas-chk-processo-vinculado-proposta', label: 'Processo vinculado à proposta', type: 'boolean', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-ident', spec: 'Confirma que o processo contratual está corretamente vinculado à proposta aprovada.' },
    { id: 'atlas-chk-cliente-cadastrado', label: 'Cliente cadastrado', type: 'boolean', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-itens', spec: 'Indica se o cliente foi cadastrado e vinculado ao contrato.' },
    { id: 'atlas-chk-credenciais-enviadas', label: 'Credenciais enviadas', type: 'boolean', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-itens', spec: 'Indica se as credenciais iniciais foram enviadas ao cliente.' },
    { id: 'atlas-chk-itens-revisados', label: 'Itens revisados', type: 'boolean', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-itens', spec: 'Indica se os itens contratados foram revisados contra a proposta.' },
    { id: 'atlas-chk-extrato-publicacao', label: 'Extrato publicação', type: 'file', size: 'large', readOnly: false, required: true, multiple: true, relevance: 'highlight', sectionId: 'sec-chk-itens', spec: 'Anexo obrigatório de extrato de publicação do contrato.' },
    { id: 'atlas-chk-data-publicacao', label: 'Data publicação', type: 'date', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'common', sectionId: 'sec-chk-itens', spec: 'Data do extrato de publicação que valida o contrato.' },
    { id: 'atlas-chk-alerta-integracao', label: 'Integração', type: 'alert', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-chk-integracoes', alertVariant: 'info', alertTitle: 'Status conhecido e justificativa', alertMessage: 'Protheus e ServiceNow devem ter status conhecido e rastreável. Conclusão não é obrigatória. Se status for Erro, Não enviado, Pendente ou Dispensado, a justificativa correspondente é obrigatória.', spec: 'Regra de integração Fase 1 — Gestão Centralizada DIRC.' },
    { id: 'atlas-chk-protheus-status', label: 'Evento Protheus — status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-integracoes', options: STATUS_INTEGRACAO_CHECKLIST, spec: 'Status conhecido do evento Protheus — conclusão não exigida.' },
    { id: 'atlas-chk-protheus-justificativa', label: 'Justificativa Protheus', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-chk-integracoes', spec: 'Obrigatória quando status Protheus for Erro, Não enviado, Pendente ou Dispensado.' },
    { id: 'atlas-chk-servicenow-status', label: 'Evento ServiceNow — status', type: 'textOptions', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-integracoes', options: STATUS_INTEGRACAO_CHECKLIST, spec: 'Status conhecido do evento ServiceNow — conclusão não exigida.' },
    { id: 'atlas-chk-servicenow-justificativa', label: 'Justificativa ServiceNow', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: 'sec-chk-integracoes', spec: 'Obrigatória quando status ServiceNow for Erro, Não enviado, Pendente ou Dispensado.' },
    { id: 'atlas-chk-validado', label: 'Checklist validado', type: 'boolean', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-chk-integracoes', spec: 'Marcado após validação bem-sucedida — libera cadastro do contrato.' },
    { id: 'atlas-chk-observacoes', label: 'Observações', type: 'text', size: 'large', textLong: true, readOnly: false, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-chk-integracoes', spec: 'Observações sobre pendências, exceções ou integrações.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-chk-preset-contrato-simplifica',
      name: 'Checklist contrato Simplifica',
      iconColor: '#0ea5e9',
      fieldValues: {
        'atlas-chk-processo-contratual': 'Processo contratual Simplifica 2026',
        'atlas-chk-proposta': 'Proposta MTI Simplifica em assinatura',
        'atlas-chk-contrato-rascunho': 'Contrato Simplifica 2026/001 (rascunho)',
        'atlas-chk-processo-vinculado-proposta': 'true',
        'atlas-chk-cliente-cadastrado': 'true',
        'atlas-chk-credenciais-enviadas': 'false',
        'atlas-chk-itens-revisados': 'true',
        'atlas-chk-extrato-publicacao': [{ name: 'extrato-publicacao-contrato.pdf', kind: 'pdf' }],
        'atlas-chk-data-publicacao': '2026-06-03',
        'atlas-chk-protheus-status': 'Pendente',
        'atlas-chk-protheus-justificativa': 'Aguardando janela de cadastro no Protheus após publicação do extrato.',
        'atlas-chk-servicenow-status': 'Pendente',
        'atlas-chk-servicenow-justificativa': 'Ticket de contrato será aberto após confirmação do cadastro.',
        'atlas-chk-validado': 'false',
        'atlas-chk-observacoes': 'Contrato recebido com redução de um item em relação à proposta original.',
      },
    },
  ],
  activeExamplePresetId: 'atlas-chk-preset-contrato-simplifica',
}

// =====================================================================
// Integração e Notificação
// =====================================================================

export const integracaoForm = {
  id: FORM_INTEGRACAO,
  name: 'Integração — evento',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'read',
  metadata: 'Registro protótipo de eventos de integração preparados ou disparados pela Fase 1.',
  methods: [
    { id: 'atlas-int-meth-reprocessar', name: 'Reprocessar', icon: 'cloud_sync', kind: 'menu' },
  ],
  sections: [
    { id: 'sec-int-ident', title: 'Identificação', icon: 'cloud_sync' },
    { id: 'sec-int-payload', title: 'Payload', icon: 'article' },
  ],
  fields: [
    { id: 'atlas-int-sistema', label: 'Sistema', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-int-ident', options: ['Protheus', 'ServiceNow', 'HCMX', 'Qlik Sense', 'InfoCenter', 'Outro'], spec: 'Sistema de destino ou origem da integração.' },
    { id: 'atlas-int-evento', label: 'Evento', type: 'text', size: 'large', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-int-ident', spec: 'Nome do evento de integração.' },
    { id: 'atlas-int-objeto-tipo', label: 'Objeto tipo', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'common', sectionId: 'sec-int-ident', options: ['Proposta', 'Contrato', 'Produto', 'Cliente', 'Documento', 'Workflow'], spec: 'Tipo de objeto relacionado ao evento.' },
    { id: 'atlas-int-objeto-resumo', label: 'Objeto resumo', type: 'text', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-int-ident', spec: 'Identificação amigável do objeto relacionado.' },
    { id: 'atlas-int-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-int-ident', options: ['Pendente', 'Enviado', 'Recebido', 'Erro', 'Ignorado', 'Simulado'], spec: 'Status do evento de integração no protótipo.' },
    { id: 'atlas-int-data', label: 'Data', type: 'date', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-int-ident', spec: 'Data do registro do evento.' },
    { id: 'atlas-int-payload', label: 'Payload', type: 'text', size: 'large', textLong: true, readOnly: true, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-int-payload', spec: 'Resumo textual do payload ou dos dados preparados para integração.' },
    { id: 'atlas-int-erro', label: 'Erro', type: 'text', size: 'large', textLong: true, readOnly: true, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-int-payload', spec: 'Mensagem de erro quando houver falha.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-int-preset-protheus-contrato',
      name: 'Evento Protheus contrato',
      iconColor: '#6366f1',
      fieldValues: {
        'atlas-int-sistema': 'Protheus',
        'atlas-int-evento': 'Preparar cadastro de contrato',
        'atlas-int-objeto-tipo': 'Contrato',
        'atlas-int-objeto-resumo': 'Contrato Simplifica 2026/001',
        'atlas-int-status': 'Simulado',
        'atlas-int-data': '2026-06-03',
        'atlas-int-payload': 'Cliente, itens contratados, recorrência, códigos Protheus e dados de publicação preparados para envio.',
      },
    },
  ],
  activeExamplePresetId: 'atlas-int-preset-protheus-contrato',
}

export const notificacaoForm = {
  id: FORM_NOTIFICACAO,
  name: 'Notificação — processo',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'read',
  metadata: 'Registro protótipo de notificação interna e e-mail para pendências, assinaturas e eventos da Fase 1.',
  methods: [
    { id: 'atlas-not-meth-reenviar', name: 'Reenviar', icon: 'send', kind: 'destaque' },
  ],
  sections: [
    { id: 'sec-not-ident', title: 'Notificação', icon: 'send' },
    { id: 'sec-not-destino', title: 'Destino', icon: 'groups' },
  ],
  fields: [
    { id: 'atlas-not-titulo', label: 'Título', type: 'text', size: 'large', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-not-ident', spec: 'Título exibido na notificação.' },
    { id: 'atlas-not-tipo', label: 'Tipo', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-not-ident', options: ['Assinatura', 'Ajuste', 'Atraso', 'Conclusão', 'Contrato', 'Integração', 'Informativo'], spec: 'Tipo de notificação.' },
    { id: 'atlas-not-canal', label: 'Canal', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-not-ident', options: ['Portal', 'E-mail', 'Portal e e-mail', 'Simulado'], spec: 'Canal usado para enviar a notificação.' },
    { id: 'atlas-not-mensagem', label: 'Mensagem', type: 'text', size: 'large', textLong: true, readOnly: true, required: true, multiple: false, relevance: 'common', sectionId: 'sec-not-ident', spec: 'Corpo da mensagem enviada ou exibida.' },
    { id: 'atlas-not-status', label: 'Status', type: 'textOptions', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'highlight', sectionId: 'sec-not-ident', options: ['Pendente', 'Enviada', 'Lida', 'Falha', 'Cancelada'], spec: 'Situação da notificação.' },
    { id: 'atlas-not-destinatario', label: 'Destinatário', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-not-destino', linkedFormId: FORM_USUARIO, spec: 'Usuário destinatário quando houver usuário cadastrado.' },
    { id: 'atlas-not-email', label: 'E-mail', type: 'text', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-not-destino', spec: 'E-mails destinatários.' },
    { id: 'atlas-not-area', label: 'Área', type: 'textOptions', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-not-destino', options: AREAS_FASE1_SEM_CS, spec: 'Área destinatária da notificação.' },
    { id: 'atlas-not-workflow', label: 'Workflow', type: 'reference', size: 'medium', readOnly: true, required: false, multiple: false, relevance: 'advanced', sectionId: 'sec-not-destino', linkedFormId: FORM_WF_INSTANCIA, spec: 'Instância de workflow relacionada à notificação.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-not-preset-pendencia-dtic',
      name: 'Notificação pendência DTIC',
      iconColor: '#b45309',
      fieldValues: {
        'atlas-not-titulo': 'Assinatura técnica pendente',
        'atlas-not-tipo': 'Assinatura',
        'atlas-not-canal': 'Portal e e-mail',
        'atlas-not-mensagem': 'A proposta MTI Simplifica aguarda sua concordância técnica para prosseguir.',
        'atlas-not-status': 'Enviada',
        'atlas-not-destinatario': 'Aprovador Técnico DTIC',
        'atlas-not-email': ['aprovador.dtic@mti.demo'],
        'atlas-not-area': 'DTIC',
        'atlas-not-workflow': 'WFI-2026-0001',
      },
    },
  ],
  activeExamplePresetId: 'atlas-not-preset-pendencia-dtic',
}

// =====================================================================
// Governança — regras e permissões Fase 1
// =====================================================================

export const governancaFase1Form = {
  id: FORM_FASE1_GOVERNANCA,
  name: 'Governança — Fase 1',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'read',
  metadata:
    'Regras de negócio e matriz de permissões por perfil para proposta, assinatura, documentos e cadastro contratual.',
  sections: [
    { id: 'sec-gov-regras', title: 'Regras de negócio', icon: 'gavel' },
    { id: 'sec-gov-permissoes', title: 'Permissões por perfil', icon: 'admin_panel_settings' },
  ],
  fields: [
    {
      id: 'atlas-gov-regra-assinatura-bloqueio',
      label: 'Assinatura e trâmites',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-regras',
      alertVariant: 'warning',
      alertTitle: 'Trâmites bloqueantes',
      alertMessage:
        'A assinatura só avança quando todos os trâmites obrigatórios e bloqueantes estiverem concluídos.',
      spec: 'Regra aplicada nas etapas de assinatura e no avanço da instância de workflow.',
    },
    {
      id: 'atlas-gov-regra-parceiro-opcional',
      label: 'Parceiro opcional',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-regras',
      alertVariant: 'info',
      alertTitle: 'Sem parceiro envolvido',
      alertMessage:
        'Quando não houver parceiro envolvido na proposta, a revisão e assinatura do parceiro não são exigidas.',
      spec: 'Derivado do campo Parceiros na proposta (atlas-prp-parceiros-envolvidos).',
    },
    {
      id: 'atlas-gov-regra-integracao',
      label: 'Integração',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-regras',
      alertVariant: 'info',
      alertTitle: 'Status de integração',
      alertMessage:
        'Status de integração deve ser conhecido e, quando negativo ou pendente, deve possuir justificativa.',
      spec: 'Validada no checklist contratual (atlas-chk-meth-validar).',
    },
    {
      id: 'atlas-gov-regra-template',
      label: 'Template documental',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-regras',
      alertVariant: 'warning',
      alertTitle: 'Versionamento de template',
      alertMessage: 'Template publicado não é editado diretamente; alterações geram nova versão.',
      spec: 'Publicar bloqueia edição direta; usar nova versão em rascunho.',
    },
    {
      id: 'atlas-gov-perm-admin',
      label: 'Administrador Atlas',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Administrador Atlas',
      alertMessage:
        'Configuração de workflow, templates, organizações, perfis e visão operacional. Pode reprocessar integrações e reenviar notificações.',
      spec: 'Perfil atlas-usr-perfil-fase1.',
    },
    {
      id: 'atlas-gov-perm-dirc',
      label: 'Analista DIRC',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Analista DIRC',
      alertMessage:
        'Registrar demanda, compor proposta, revisar, conduzir assinaturas DIRC, enviar ao cliente, receber contrato, revisar itens, abrir rascunho, checklist e finalizar cadastro.',
      spec: 'Perfil principal do fluxo Fase 1.',
    },
    {
      id: 'atlas-gov-perm-parceiro',
      label: 'Parceiro',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Parceiro',
      alertMessage:
        'Revisar e assinar apenas o escopo da sua solução quando houver parceiro envolvido. Sem parceiro na proposta, etapas de parceiro são dispensadas.',
      spec: 'Parceiro gestor / Parceiro usuário.',
    },
    {
      id: 'atlas-gov-perm-dtic',
      label: 'Assinante DTIC',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Assinante DTIC',
      alertMessage: 'Concordância técnica na etapa Assinatura DTIC. Trâmite bloqueante até conclusão ou retorno para revisão.',
      spec: 'DTIC aprovador.',
    },
    {
      id: 'atlas-gov-perm-presidencia',
      label: 'Presidência',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Presidência',
      alertMessage: 'Assinatura superior quando exigida pelo workflow. Documento aprovado não deve ser alterado sem nova versão.',
      spec: 'Presidência.',
    },
    {
      id: 'atlas-gov-perm-posvendas',
      label: 'Pós-vendas',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Pós-vendas',
      alertMessage:
        'Recebe notificação de kickoff após cadastro do contrato (UGEPV). Consulta contrato ativo e itens revisados.',
      spec: 'UGEPV / pós-vendas.',
    },
    {
      id: 'atlas-gov-perm-cliente',
      label: 'Cliente / consulta',
      type: 'alert',
      size: 'large',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: 'sec-gov-permissoes',
      alertVariant: 'info',
      alertTitle: 'Cliente / consulta',
      alertMessage:
        'Recebe proposta aprovada e notificação de contrato cadastrado. Consulta status quando aplicável (portal Fase 1 futura).',
      spec: 'Cliente gestor / Cliente consulta.',
    },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-gov-preset-regras',
      name: 'Regras e permissões Fase 1',
      iconColor: '#0c1ba8',
      fieldValues: {},
    },
  ],
  activeExamplePresetId: 'atlas-gov-preset-regras',
}

// =====================================================================
// Visão operacional Fase 1
// =====================================================================

const EMB_F1_WORKFLOWS = 'emb_fase1_workflows'
const EMB_F1_NOTIFICACOES = 'emb_fase1_notificacoes'
const EMB_F1_INTEGRACOES = 'emb_fase1_integracoes'

export const visaoFase1Form = {
  id: FORM_VISAO_FASE1,
  name: 'Visão operacional — Fase 1',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'read',
  metadata: 'Visão consolidada para acompanhar propostas, assinaturas, gargalos, contratos em cadastro e integrações da Fase 1.',
  methods: [
    { id: 'atlas-f1v-meth-atualizar', name: 'Atualizar visão', icon: 'filter_list', kind: 'destaque' },
  ],
  sections: [
    { id: 'sec-f1v-resumo', title: 'Resumo', icon: 'visibility' },
    { id: 'sec-f1v-operacao', title: 'Operação', icon: 'table_chart' },
  ],
  fields: [
    { id: 'atlas-f1v-data-referencia', label: 'Data referência', type: 'date', size: 'medium', readOnly: true, required: true, multiple: false, relevance: 'identity', sectionId: 'sec-f1v-resumo', spec: 'Data usada para consolidar a visão operacional.' },
    { id: 'atlas-f1v-propostas-ativas', label: 'Propostas ativas', type: 'number', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-f1v-resumo', spec: 'Quantidade de propostas em andamento.' },
    { id: 'atlas-f1v-assinaturas-pendentes', label: 'Assinaturas pendentes', type: 'number', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-f1v-resumo', spec: 'Quantidade de pendências de assinatura abertas.' },
    { id: 'atlas-f1v-contratos-cadastro', label: 'Contratos cadastro', type: 'number', size: 'small', readOnly: true, required: false, multiple: false, relevance: 'highlight', sectionId: 'sec-f1v-resumo', spec: 'Quantidade de contratos em fase de cadastro/finalização.' },
    { id: 'atlas-f1v-alerta-gargalo', label: 'Alerta gargalo', type: 'alert', size: 'large', readOnly: true, required: false, multiple: false, relevance: 'common', sectionId: 'sec-f1v-resumo', alertVariant: 'warning', alertTitle: 'Gargalos', alertMessage: 'Existem processos parados há mais de 2 dias úteis aguardando assinatura ou ajuste.', spec: 'Alerta visual para processos com atraso.' },
    { id: EMB_F1_WORKFLOWS, label: 'Workflows', type: 'embeddedReference', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-f1v-operacao', linkedFormId: FORM_WF_INSTANCIA, embeddedDisplay: 'table', spec: 'Instâncias de workflow em andamento.' },
    { id: EMB_F1_NOTIFICACOES, label: 'Notificações', type: 'embeddedReference', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-f1v-operacao', linkedFormId: FORM_NOTIFICACAO, embeddedDisplay: 'table', spec: 'Notificações recentes da Fase 1.' },
    { id: EMB_F1_INTEGRACOES, label: 'Integrações', type: 'embeddedReference', size: 'large', readOnly: true, required: false, multiple: true, relevance: 'common', sectionId: 'sec-f1v-operacao', linkedFormId: FORM_INTEGRACAO, embeddedDisplay: 'table', spec: 'Eventos de integração simulados ou pendentes.' },
  ],
  exampleValuePresets: [
    {
      id: 'atlas-f1v-preset-operacao',
      name: 'Operação Fase 1',
      iconColor: '#0c1ba8',
      fieldValues: {
        'atlas-f1v-data-referencia': '2026-05-23',
        'atlas-f1v-propostas-ativas': 5,
        'atlas-f1v-assinaturas-pendentes': 3,
        'atlas-f1v-contratos-cadastro': 2,
      },
      embeddedRowsByFieldId: {
        [EMB_F1_WORKFLOWS]: [
          { 'atlas-wfi-numero': 'WFI-2026-0001', 'atlas-wfi-objeto-tipo': 'Proposta', 'atlas-wfi-objeto-resumo': 'Proposta MTI Simplifica — Secretaria Cliente Demo', 'atlas-wfi-status': 'Aguardando assinatura', 'atlas-wfi-area-atual': 'DTIC', 'atlas-wfi-dias-parado': 2 },
        ],
        [EMB_F1_NOTIFICACOES]: [
          { 'atlas-not-titulo': 'Assinatura técnica pendente', 'atlas-not-tipo': 'Assinatura', 'atlas-not-canal': 'Portal e e-mail', 'atlas-not-status': 'Enviada', 'atlas-not-area': 'DTIC' },
        ],
        [EMB_F1_INTEGRACOES]: [
          { 'atlas-int-sistema': 'Protheus', 'atlas-int-evento': 'Preparar cadastro de contrato', 'atlas-int-objeto-tipo': 'Contrato', 'atlas-int-status': 'Simulado' },
        ],
      },
    },
  ],
  activeExamplePresetId: 'atlas-f1v-preset-operacao',
}

// =====================================================================
// Export agregado + class-groups + workspace classes
// =====================================================================

// uso da recorrência para amarrar maestro existente (mantém referência declarada)
void FORM_MAESTRO_RECORRENCIA
void FORM_PROPOSTA_ITEM

export const fase1Forms = [
  organizacaoForm,
  wfEtapaForm,
  wfVersaoForm,
  wfModeloForm,
  wfEventoForm,
  wfInstanciaForm,
  docParametroForm,
  docTemplateForm,
  docGeradoForm,
  checklistForm,
  integracaoForm,
  notificacaoForm,
  governancaFase1Form,
  visaoFase1Form,
]

export const fase1ClassGroups = {
  extraGroups: [
    { id: 'grp-atlas-organizacoes', name: 'Organizações' },
    { id: 'grp-atlas-fase1-workflow', name: 'Fase 1 — Workflow e documentos' },
    { id: 'grp-atlas-fase1-operacao', name: 'Fase 1 — Operação' },
    { id: 'grp-atlas-fase1-suporte', name: 'Linhas embutidas Fase 1' },
  ],
  assignments: {
    [FORM_ORGANIZACAO]: 'grp-atlas-organizacoes',
    [FORM_WF_MODELO]: 'grp-atlas-fase1-workflow',
    [FORM_WF_VERSAO]: 'grp-atlas-fase1-workflow',
    [FORM_WF_ETAPA]: 'grp-atlas-fase1-suporte',
    [FORM_WF_INSTANCIA]: 'grp-atlas-fase1-operacao',
    [FORM_WF_EVENTO]: 'grp-atlas-fase1-suporte',
    [FORM_DOC_TEMPLATE]: 'grp-atlas-fase1-workflow',
    [FORM_DOC_PARAMETRO]: 'grp-atlas-fase1-suporte',
    [FORM_DOC_GERADO]: 'grp-atlas-fase1-operacao',
    [FORM_CHECKLIST]: 'grp-atlas-fase1-operacao',
    [FORM_INTEGRACAO]: 'grp-atlas-fase1-operacao',
    [FORM_NOTIFICACAO]: 'grp-atlas-fase1-operacao',
    [FORM_FASE1_GOVERNANCA]: 'grp-atlas-fase1-workflow',
    [FORM_VISAO_FASE1]: 'grp-atlas-fase1-operacao',
  },
  memberOrder: {
    'grp-atlas-organizacoes': [FORM_ORGANIZACAO],
    'grp-atlas-fase1-workflow': [FORM_WF_MODELO, FORM_WF_VERSAO, FORM_DOC_TEMPLATE, FORM_FASE1_GOVERNANCA],
    'grp-atlas-fase1-operacao': [
      FORM_VISAO_FASE1,
      FORM_WF_INSTANCIA,
      FORM_DOC_GERADO,
      FORM_CHECKLIST,
      FORM_NOTIFICACAO,
      FORM_INTEGRACAO,
    ],
    'grp-atlas-fase1-suporte': [FORM_WF_ETAPA, FORM_WF_EVENTO, FORM_DOC_PARAMETRO],
  },
  /** Classes para inclusão direta em workspaces. */
  workspaceClasses: {
    organizacoes: [
      { id: 'cls-atlas-identidade-fase1-organizacao', name: 'Organizações', linkedFormId: FORM_ORGANIZACAO, linkedFormExamplePresetIds: ['atlas-org-preset-mti-cliente', 'atlas-org-preset-parceiro-simplifica'] },
    ],
    fase1Workflow: [
      { id: 'cls-atlas-fase1-governanca', name: 'Governança Fase 1', linkedFormId: FORM_FASE1_GOVERNANCA, linkedFormExamplePresetIds: ['atlas-gov-preset-regras'] },
      { id: 'cls-atlas-fase1-workflow-modelo', name: 'Modelos de workflow', linkedFormId: FORM_WF_MODELO, linkedFormExamplePresetIds: ['atlas-wfm-preset-proposta'] },
      { id: 'cls-atlas-fase1-workflow-versao', name: 'Versões de workflow', linkedFormId: FORM_WF_VERSAO, linkedFormExamplePresetIds: ['atlas-wfv-preset-v1-proposta'] },
      { id: 'cls-atlas-fase1-workflow-etapa', name: 'Etapas de workflow', linkedFormId: FORM_WF_ETAPA, linkedFormExamplePresetIds: ['atlas-wfe-preset-assinatura-dtic'] },
      { id: 'cls-atlas-fase1-workflow-instancia', name: 'Instâncias', linkedFormId: FORM_WF_INSTANCIA, linkedFormExamplePresetIds: ['atlas-wfi-preset-proposta-pendente-dtic'] },
    ],
    fase1Documentos: [
      { id: 'cls-atlas-fase1-documento-template', name: 'Templates', linkedFormId: FORM_DOC_TEMPLATE, linkedFormExamplePresetIds: ['atlas-dtmp-preset-proposta-padrao'] },
      { id: 'cls-atlas-fase1-documento-gerado', name: 'Documentos gerados', linkedFormId: FORM_DOC_GERADO, linkedFormExamplePresetIds: ['atlas-dger-preset-proposta-gerada'] },
    ],
    fase1Monitoramento: [
      { id: 'cls-atlas-fase1-notificacao', name: 'Notificações', linkedFormId: FORM_NOTIFICACAO, linkedFormExamplePresetIds: ['atlas-not-preset-pendencia-dtic'] },
      { id: 'cls-atlas-fase1-integracao', name: 'Integrações', linkedFormId: FORM_INTEGRACAO, linkedFormExamplePresetIds: ['atlas-int-preset-protheus-contrato'] },
    ],
    fase1Propostas: [
      { id: 'cls-atlas-propostas-fase1-visao', name: 'Visão Fase 1', linkedFormId: FORM_VISAO_FASE1, linkedFormExamplePresetIds: ['atlas-f1v-preset-operacao'] },
      { id: 'cls-atlas-propostas-fase1-documentos', name: 'Documentos gerados', linkedFormId: FORM_DOC_GERADO, linkedFormExamplePresetIds: ['atlas-dger-preset-proposta-gerada'] },
      { id: 'cls-atlas-propostas-fase1-workflows', name: 'Workflows em andamento', linkedFormId: FORM_WF_INSTANCIA, linkedFormExamplePresetIds: ['atlas-wfi-preset-proposta-pendente-dtic'] },
    ],
    fase1ContratosRaer: [
      { id: 'cls-atlas-contratos-fase1-checklist', name: 'Checklist contratual', linkedFormId: FORM_CHECKLIST, linkedFormExamplePresetIds: ['atlas-chk-preset-contrato-simplifica'] },
    ],
  },
  suporteGroupId: 'grp-atlas-fase1-suporte',
}
