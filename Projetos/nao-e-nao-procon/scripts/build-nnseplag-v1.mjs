/**
 * Épico: Projeto Não é Não - Seplag v1.
 * Classes + portal + workspace + protótipo clicável (fluxo completo do selo).
 * Fonte: documentacao.md / FigJam / reunião 10/09 (1 serviço; revogação; sem denúncia).
 *
 * Uso: node scripts/build-nnseplag-v1.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const subDir = path.join(root, 'data/subprojects/nao-e-nao-seplag')
const epicDir = path.join(subDir, 'epics/projeto-nao-e-nao-seplag-v1')

const SIM_NAO = ['Sim', 'Não']
const VINCULO = ['Empregatício', 'Prestação de serviço', 'Terceirizado', 'Sócio', 'Outro']
const CONCLUSAO = ['Conforme', 'Não conforme', 'Necessita complementação']
const DECISAO = ['Deferir', 'Indeferir']
const RECURSO = ['Provido', 'Não provido']
const STATUS_PEDIDO = [
  'RASCUNHO',
  'PROTOCOLADO',
  'EM ANÁLISE',
  'EM DILIGÊNCIA',
  'DILIGÊNCIA RESPONDIDA',
  'DILIGÊNCIA NÃO RESPONDIDA',
  'DEFERIDO',
  'INDEFERIDO',
  'EM RECURSO',
  'FINALIZADO',
]
const STATUS_SELO = ['VIGENTE', 'EXPIRADO', 'CANCELADO A PEDIDO', 'REVOGADO']

function field(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.currency ? { currency: true } : {}),
    ...(opts.alertVariant ? { alertVariant: opts.alertVariant } : {}),
    ...(opts.alertTitle ? { alertTitle: opts.alertTitle } : {}),
    ...(opts.alertMessage ? { alertMessage: opts.alertMessage } : {}),
    spec: opts.spec ?? '',
  }
}

function method(id, name, opts = {}) {
  return {
    id,
    name,
    icon: opts.icon ?? 'play_arrow',
    kind: opts.kind ?? 'destaque',
  }
}

function preset(id, name, fieldValues, iconColor = '#9d174d') {
  return { id, name, iconColor, fieldValues }
}

function section(id, title, icon = 'description') {
  return { id, title, icon }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

const FORM_CAPACITADO = 'form-nen-capacitado'
const FORM_ACESSO = 'form-nen-acesso'
const FORM_SOLICITACAO = 'form-nen-solicitacao'
const FORM_ANALISE = 'form-nen-analise'
const FORM_AJUSTES = 'form-nen-ajustes'
const FORM_DECISAO = 'form-nen-decisao'
// Certificado absorvido em form-nen-estabelecimento-selo (17/09/2026) — não criar classe separada
const FORM_CERTIFICADO = 'form-nen-estabelecimento-selo'
const FORM_RECURSO = 'form-nen-recurso'
const FORM_RENOVACAO = 'form-nen-renovacao'
const FORM_CANCELAMENTO = 'form-nen-cancelamento'
const FORM_REVOGACAO = 'form-nen-revogacao'
const FORM_ESTABELECIMENTO = 'form-nen-estabelecimento-selo'

const SEC = {
  dados: 'sec-nen-dados',
  enquad: 'sec-nen-enquadramento',
  equipe: 'sec-nen-equipe',
  sinal: 'sec-nen-sinalizacao',
  codigo: 'sec-nen-codigo',
  proc: 'sec-nen-procedimentos',
  cameras: 'sec-nen-cameras',
  decl: 'sec-nen-declaracoes',
}

function forms() {
  const capacitado = {
    id: FORM_CAPACITADO,
    name: 'Capacitado',
    sectionLayout: 'none',
    fields: [
      field('nen-cap-nome', 'Nome', 'text', { required: true, relevance: 'identity' }),
      field('nen-cap-funcao', 'Função', 'text', { required: true, relevance: 'highlight' }),
      field('nen-cap-vinculo', 'Tipo de vínculo', 'textOptions', {
        required: true,
        options: VINCULO,
        relevance: 'highlight',
      }),
      field('nen-cap-curso', 'Curso realizado', 'text', {
        required: true,
        spec: 'Protocolo Não é Não (Escola de Governo)',
      }),
      field('nen-cap-data', 'Data de conclusão', 'date', { required: true }),
      field('nen-cap-cert', 'Certificado', 'file', { required: true }),
      field('nen-cap-vinculo-doc', 'Comprovante de vínculo', 'file', {
        required: true,
        spec: 'CTPS, contrato, ato societário ou outro idôneo',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-cap-p1',
        label: 'João — Segurança',
        fieldValues: {
          'nen-cap-nome': 'João Pedro Almeida',
          'nen-cap-funcao': 'Segurança',
          'nen-cap-vinculo': 'Empregatício',
          'nen-cap-curso': 'Protocolo Não é Não',
          'nen-cap-data': '2026-08-01',
        },
      },
      {
        id: 'nen-cap-p2',
        label: 'Ana — Atendimento',
        fieldValues: {
          'nen-cap-nome': 'Ana Clara Souza',
          'nen-cap-funcao': 'Atendimento',
          'nen-cap-vinculo': 'Prestação de serviço',
          'nen-cap-curso': 'Protocolo Não é Não',
          'nen-cap-data': '2026-07-15',
        },
      },
    ],
    activeExamplePresetId: 'nen-cap-p1',
  }

  const acesso = {
    id: FORM_ACESSO,
    name: 'Acesso e seleção de estabelecimento',
    sectionLayout: 'none',
    fields: [
      field('nen-acs-auth', 'Autenticação', 'text', {
        required: true,
        relevance: 'identity',
        readOnly: true,
        spec: 'MT Login',
      }),
      field('nen-acs-empresa', 'Estabelecimento (JUCEMAT)', 'textOptions', {
        required: true,
        relevance: 'highlight',
        size: 'large',
        options: [
          '12.345.678/0001-90 — Casa Noturna Aurora LTDA — Cuiabá',
          '98.765.432/0001-10 — Bar e Eventos Pantanal ME — Várzea Grande',
        ],
        spec: 'Somente empresas retornadas pela JUCEMAT vinculadas ao usuário',
      }),
      field('nen-acs-rep', 'Documento de representação', 'file', {
        required: false,
        spec: 'Exigir quando solicitante ≠ responsável cadastral',
      }),
    ],
    methods: [
      method('nen-acs-entrar', 'Entrar', { appearance: 'primary', spec: 'MT Login' }),
      method('nen-acs-continuar', 'Continuar', { appearance: 'primary' }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-acs-p1',
        label: 'Solicitante — Aurora',
        fieldValues: {
          'nen-acs-auth': 'Maria Silva (MT Login)',
          'nen-acs-empresa': '12.345.678/0001-90 — Casa Noturna Aurora LTDA — Cuiabá',
        },
      },
    ],
    activeExamplePresetId: 'nen-acs-p1',
  }

  const solicitacao = {
    id: FORM_SOLICITACAO,
    name: 'Formulário de Solicitação',
    sectionLayout: 'tabs',
    sections: [
      section(SEC.dados, 'Dados do estabelecimento', 'store'),
      section(SEC.enquad, 'Enquadramento', 'category'),
      section(SEC.equipe, 'Equipe e capacitação', 'groups'),
      section(SEC.sinal, 'Sinalização', 'campaign'),
      section(SEC.codigo, 'Sinal / código', 'password'),
      section(SEC.proc, 'Procedimentos', 'checklist'),
      section(SEC.cameras, 'Câmeras', 'videocam'),
      section(SEC.decl, 'Declarações', 'verified'),
    ],
    fields: [
      field('nen-sol-protocolo', 'Nº protocolo', 'text', {
        sectionId: SEC.dados,
        readOnly: true,
        relevance: 'highlight',
      }),
      field('nen-sol-status', 'Status do pedido', 'textOptions', {
        sectionId: SEC.dados,
        options: STATUS_PEDIDO,
        readOnly: true,
        relevance: 'highlight',
      }),
      field('nen-sol-cnpj', 'CNPJ', 'text', {
        sectionId: SEC.dados,
        required: true,
        relevance: 'identity',
        spec: 'Pré-preenchido JUCEMAT',
      }),
      field('nen-sol-razao', 'Razão social', 'text', {
        sectionId: SEC.dados,
        required: true,
        size: 'large',
        relevance: 'highlight',
      }),
      field('nen-sol-fantasia', 'Nome fantasia', 'text', {
        sectionId: SEC.dados,
        required: true,
        size: 'large',
      }),
      field('nen-sol-end', 'Endereço', 'text', { sectionId: SEC.dados, required: true, size: 'large' }),
      field('nen-sol-mun', 'Município', 'text', { sectionId: SEC.dados, required: true }),
      field('nen-sol-cnae', 'CNAE / atividade', 'text', { sectionId: SEC.dados, required: true, size: 'large' }),
      field('nen-sol-resp', 'Responsável pelo requerimento', 'text', {
        sectionId: SEC.dados,
        required: true,
        relevance: 'highlight',
      }),
      field('nen-sol-contato', 'Contato do responsável', 'text', { sectionId: SEC.dados, required: true }),

      field('nen-sol-boate', 'É casa noturna ou boate?', 'textOptions', {
        sectionId: SEC.enquad,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-show', 'Realiza show/evento musical em local fechado?', 'textOptions', {
        sectionId: SEC.enquad,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-alcool', 'Há venda de bebida alcoólica?', 'textOptions', {
        sectionId: SEC.enquad,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-esporte', 'Competição ou evento esportivo?', 'textOptions', {
        sectionId: SEC.enquad,
        required: true,
        options: SIM_NAO,
      }),

      field('nen-sol-qtd-func', 'Qtd. funcionários/equipe', 'number', {
        sectionId: SEC.equipe,
        required: true,
        relevance: 'highlight',
      }),
      field('nen-sol-qtd-cap', 'Qtd. capacitados', 'number', {
        sectionId: SEC.equipe,
        required: true,
        relevance: 'highlight',
        spec: '≤ qtd. funcionários; % calculado automaticamente',
      }),
      field('nen-sol-perc', 'Percentual capacitados', 'text', {
        sectionId: SEC.equipe,
        readOnly: true,
        relevance: 'highlight',
      }),
      field('nen-sol-certs', 'Certificados do curso (geral)', 'file', {
        sectionId: SEC.equipe,
        required: true,
        multiple: true,
      }),
      field('nen-sol-capacitados', 'Capacitados', 'embeddedReference', {
        sectionId: SEC.equipe,
        linkedFormId: FORM_CAPACITADO,
        embeddedDisplay: 'table',
        multiple: true,
        required: true,
        size: 'large',
        spec: 'Mínimo 2 capacitados; eventos >300 → 10% (confirmar decreto)',
      }),

      field('nen-sol-banheiro', 'Info de auxílio no banheiro feminino e local visível?', 'textOptions', {
        sectionId: SEC.sinal,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-acionar', 'Contém forma de acionar o protocolo?', 'textOptions', {
        sectionId: SEC.sinal,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-190', 'Contém telefone 190?', 'textOptions', {
        sectionId: SEC.sinal,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-180', 'Contém telefone 180?', 'textOptions', {
        sectionId: SEC.sinal,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-a3', 'Formato mínimo A3 e texto oficial?', 'textOptions', {
        sectionId: SEC.sinal,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-fotos-sinal', 'Fotos da sinalização', 'file', {
        sectionId: SEC.sinal,
        required: true,
        multiple: true,
      }),

      field('nen-sol-codigo', 'Qual sinal ou código é utilizado?', 'text', {
        sectionId: SEC.codigo,
        required: true,
        relevance: 'highlight',
      }),
      field('nen-sol-como-info', 'Como é informado às mulheres?', 'text', {
        sectionId: SEC.codigo,
        required: true,
        textLong: true,
        size: 'large',
      }),
      field('nen-sol-foto-cod', 'Foto do material', 'file', { sectionId: SEC.codigo, required: true }),

      field('nen-sol-p1', 'Verifica de forma reservada se a mulher necessita assistência', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p2', 'Protege e afasta do agressor (inclusive visual)', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p3', 'Colabora na identificação de testemunhas', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p4', 'Solicita PM/agente quando necessário', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p5', 'Preserva local/vestígios até autoridade', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p6', 'Auxilia até transporte/comunicação à polícia', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p7', 'Cabe à mulher definir se sofreu constrangimento/violência', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p8', 'Suporte imediato (Lei 12.478/2024)', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p9', 'Orientação Código Sinal Vermelho (Lei 11.889/2022)', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p10', 'Reconhece sinal gestual universal de socorro', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),
      field('nen-sol-p11', 'Compromete-se a assegurar direitos do protocolo', 'textOptions', {
        sectionId: SEC.proc,
        required: true,
        options: SIM_NAO,
      }),

      field('nen-sol-tem-cam', 'Dispõe de câmeras?', 'textOptions', {
        sectionId: SEC.cameras,
        required: true,
        options: SIM_NAO,
        relevance: 'highlight',
        spec: 'Se Não, pular bloco; ausência não reprova',
      }),
      field('nen-sol-cam-30', 'Preservará imagens ≥ 30 dias?', 'textOptions', {
        sectionId: SEC.cameras,
        options: SIM_NAO,
        spec: 'Condicional se possui câmera',
      }),
      field('nen-sol-cam-acesso', 'Garantirá acesso legal (PC, perícia, envolvidos)?', 'textOptions', {
        sectionId: SEC.cameras,
        options: SIM_NAO,
      }),

      field('nen-sol-dec-impl', 'Declaração de implementação do protocolo', 'boolean', {
        sectionId: SEC.decl,
        required: true,
      }),
      field('nen-sol-dec-ver', 'Declaração de veracidade', 'boolean', {
        sectionId: SEC.decl,
        required: true,
      }),
      field('nen-sol-sancao', 'Sanção administrativa definitiva nos 12 meses anteriores', 'textOptions', {
        sectionId: SEC.decl,
        required: true,
        options: SIM_NAO,
      }),
    ],
    fieldVisibilityRules: [
      {
        id: 'nen-vis-cam',
        operator: 'eq',
        sourceFieldId: 'nen-sol-tem-cam',
        action: 'show',
        targetFieldIds: ['nen-sol-cam-30', 'nen-sol-cam-acesso'],
        sourceKind: 'textOptions',
        expectedOptionText: 'Sim',
      },
    ],
    methods: [
      method('nen-sol-rascunho', 'Salvar rascunho'),
      method('nen-sol-avancar', 'Avançar / Revisar', { appearance: 'primary' }),
      method('nen-sol-protocolar', 'Protocolar solicitação', {
        appearance: 'primary',
        spec: 'Gera protocolo, STATUS PROTOCOLADO, notifica servidor PROCON',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-sol-p1',
        label: 'Aurora — rascunho completo',
        fieldValues: {
          'nen-sol-protocolo': '',
          'nen-sol-status': 'RASCUNHO',
          'nen-sol-cnpj': '12.345.678/0001-90',
          'nen-sol-razao': 'Casa Noturna Aurora LTDA',
          'nen-sol-fantasia': 'Aurora Night',
          'nen-sol-end': 'Av. do CPA, 1200',
          'nen-sol-mun': 'Cuiabá',
          'nen-sol-cnae': '5630-1/01 — Bares e outros estabelecimentos',
          'nen-sol-resp': 'Maria Silva',
          'nen-sol-contato': '(65) 99999-0000',
          'nen-sol-boate': 'Sim',
          'nen-sol-show': 'Sim',
          'nen-sol-alcool': 'Sim',
          'nen-sol-esporte': 'Não',
          'nen-sol-qtd-func': '20',
          'nen-sol-qtd-cap': '4',
          'nen-sol-perc': '20%',
          'nen-sol-banheiro': 'Sim',
          'nen-sol-acionar': 'Sim',
          'nen-sol-190': 'Sim',
          'nen-sol-180': 'Sim',
          'nen-sol-a3': 'Sim',
          'nen-sol-codigo': 'Sinal Vermelho',
          'nen-sol-como-info': 'Cartaz A3 e treinamento da equipe',
          'nen-sol-p1': 'Sim',
          'nen-sol-p2': 'Sim',
          'nen-sol-p3': 'Sim',
          'nen-sol-p4': 'Sim',
          'nen-sol-p5': 'Sim',
          'nen-sol-p6': 'Sim',
          'nen-sol-p7': 'Sim',
          'nen-sol-p8': 'Sim',
          'nen-sol-p9': 'Sim',
          'nen-sol-p10': 'Sim',
          'nen-sol-p11': 'Sim',
          'nen-sol-tem-cam': 'Sim',
          'nen-sol-cam-30': 'Sim',
          'nen-sol-cam-acesso': 'Sim',
          'nen-sol-dec-impl': 'true',
          'nen-sol-dec-ver': 'true',
          'nen-sol-sancao': 'Não',
        },
      },
      {
        id: 'nen-sol-p2',
        label: 'Aurora — protocolado',
        fieldValues: {
          'nen-sol-protocolo': '2026/SELO-00042',
          'nen-sol-status': 'PROTOCOLADO',
          'nen-sol-cnpj': '12.345.678/0001-90',
          'nen-sol-razao': 'Casa Noturna Aurora LTDA',
          'nen-sol-fantasia': 'Aurora Night',
          'nen-sol-mun': 'Cuiabá',
          'nen-sol-resp': 'Maria Silva',
          'nen-sol-qtd-func': '20',
          'nen-sol-qtd-cap': '4',
          'nen-sol-perc': '20%',
          'nen-sol-boate': 'Sim',
          'nen-sol-alcool': 'Sim',
        },
      },
    ],
    activeExamplePresetId: 'nen-sol-p1',
  }

  const analise = {
    id: FORM_ANALISE,
    name: 'Formulário de Análise (PROCON)',
    sectionLayout: 'none',
    fields: [
      field('nen-an-prot', 'Nº protocolo', 'text', { readOnly: true, relevance: 'identity' }),
      field('nen-an-empresa', 'CNPJ / estabelecimento / município', 'text', {
        readOnly: true,
        size: 'large',
        relevance: 'highlight',
      }),
      field('nen-an-prazo', 'Data / prazo restante', 'text', { readOnly: true, relevance: 'highlight' }),
      field('nen-an-item', 'Item do requisito (resumo)', 'text', {
        readOnly: true,
        textLong: true,
        size: 'large',
        spec: 'Resposta + anexo + base legal',
      }),
      field('nen-an-conclusao', 'Conclusão do item', 'textOptions', {
        required: true,
        options: CONCLUSAO,
        relevance: 'highlight',
      }),
      field('nen-an-espec', 'Especificação da complementação', 'text', {
        textLong: true,
        size: 'large',
        spec: 'Obrigatório se Necessita complementação',
      }),
      field('nen-an-alerta', 'Regra', 'alert', {
        alertVariant: 'warning',
        alertTitle: 'Não deferir',
        alertMessage: 'Impedir deferimento se houver requisito obrigatório “não conforme”.',
      }),
    ],
    methods: [
      method('nen-an-diligencia', 'Abrir diligência', {
        appearance: 'primary',
        spec: 'Diligência única — todas as pendências de uma vez',
      }),
      method('nen-an-encaminhar', 'Encaminhar para decisão', { appearance: 'primary' }),
      method('nen-an-salvar', 'Salvar'),
    ],
    exampleValuePresets: [
      {
        id: 'nen-an-p1',
        label: 'Análise — foto A3 pendente',
        fieldValues: {
          'nen-an-prot': '2026/SELO-00042',
          'nen-an-empresa': '12.345.678/0001-90 — Aurora Night — Cuiabá',
          'nen-an-prazo': '18 dias restantes (prazo 30 dias)',
          'nen-an-item': 'Sinalização A3 — foto do banheiro feminino incompleta',
          'nen-an-conclusao': 'Necessita complementação',
          'nen-an-espec': 'Enviar foto nítida do cartaz A3 no banheiro feminino',
        },
      },
    ],
    activeExamplePresetId: 'nen-an-p1',
  }

  const ajustes = {
    id: FORM_AJUSTES,
    name: 'Formulário de Ajustes (diligência)',
    sectionLayout: 'none',
    fields: [
      field('nen-aj-pend', 'Pendências listadas pelo analista', 'text', {
        readOnly: true,
        textLong: true,
        size: 'large',
        relevance: 'identity',
      }),
      field('nen-aj-prazo', 'Prazo', 'text', {
        readOnly: true,
        relevance: 'highlight',
        spec: '5 dias — Lei 7.692/2002',
      }),
      field('nen-aj-resp', 'Resposta / esclarecimento', 'text', {
        required: true,
        textLong: true,
        size: 'large',
      }),
      field('nen-aj-anexos', 'Anexos complementares', 'file', { multiple: true }),
    ],
    methods: [
      method('nen-aj-enviar', 'Enviar complementação', {
        appearance: 'primary',
        spec: 'DILIGÊNCIA RESPONDIDA; notifica servidor',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-aj-p1',
        label: 'Complementação foto A3',
        fieldValues: {
          'nen-aj-pend': '1) Foto nítida do cartaz A3 no banheiro feminino',
          'nen-aj-prazo': '5 dias corridos',
          'nen-aj-resp': 'Segue foto atualizada do cartaz no banheiro feminino.',
        },
      },
    ],
    activeExamplePresetId: 'nen-aj-p1',
  }

  const decisao = {
    id: FORM_DECISAO,
    name: 'Decisão',
    sectionLayout: 'none',
    fields: [
      field('nen-dec-prot', 'Nº protocolo', 'text', { readOnly: true, relevance: 'identity' }),
      field('nen-dec-parecer', 'Parecer / fundamentação', 'text', {
        required: true,
        textLong: true,
        size: 'large',
      }),
      field('nen-dec-req', 'Requisitos não preenchidos', 'text', {
        textLong: true,
        size: 'large',
        spec: 'Se indeferir',
      }),
      field('nen-dec-legal', 'Fundamentos legais', 'text', { textLong: true, size: 'large' }),
      field('nen-dec-decisao', 'Decisão', 'textOptions', {
        required: true,
        options: DECISAO,
        relevance: 'highlight',
      }),
    ],
    methods: [
      method('nen-dec-deferir', 'Deferir', {
        appearance: 'primary',
        spec: 'Emite certificado + QR Validador MT + inclui na classe + notifica',
      }),
      method('nen-dec-indeferir', 'Indeferir', { appearance: 'danger' }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-dec-p1',
        label: 'Deferimento',
        fieldValues: {
          'nen-dec-prot': '2026/SELO-00042',
          'nen-dec-parecer': 'Requisitos atendidos conforme protocolo e evidências anexadas.',
          'nen-dec-decisao': 'Deferir',
        },
      },
      {
        id: 'nen-dec-p2',
        label: 'Indeferimento',
        fieldValues: {
          'nen-dec-prot': '2026/SELO-00042',
          'nen-dec-parecer': 'Capacitação insuficiente e sinalização incompleta.',
          'nen-dec-req': 'Percentual de capacitados; foto A3',
          'nen-dec-legal': 'Minuta do decreto / Protocolo Não é Não',
          'nen-dec-decisao': 'Indeferir',
        },
      },
    ],
    activeExamplePresetId: 'nen-dec-p1',
  }

  const certificado = {
    id: FORM_CERTIFICADO,
    name: 'Template / Certificado do Selo',
    sectionLayout: 'none',
    fields: [
      field('nen-cert-num', 'Número do selo', 'text', {
        required: true,
        readOnly: true,
        relevance: 'identity',
      }),
      field('nen-cert-cnpj', 'CNPJ', 'text', { required: true, readOnly: true }),
      field('nen-cert-fantasia', 'Nome fantasia', 'text', {
        required: true,
        readOnly: true,
        relevance: 'highlight',
      }),
      field('nen-cert-end', 'Endereço / município', 'text', { required: true, readOnly: true, size: 'large' }),
      field('nen-cert-concessao', 'Data de concessão', 'date', { required: true, readOnly: true }),
      field('nen-cert-validade', 'Data de validade', 'date', {
        required: true,
        readOnly: true,
        relevance: 'highlight',
        spec: 'Concessão + 24 meses',
      }),
      field('nen-cert-qr', 'QR Code (Validador MT)', 'text', {
        required: true,
        readOnly: true,
        size: 'large',
        relevance: 'highlight',
      }),
      field('nen-cert-status', 'Status do selo', 'textOptions', {
        required: true,
        options: STATUS_SELO,
        relevance: 'highlight',
      }),
    ],
    methods: [method('nen-cert-baixar', 'Baixar certificado', { appearance: 'primary' })],
    exampleValuePresets: [
      {
        id: 'nen-cert-p1',
        label: 'Selo vigente Aurora',
        fieldValues: {
          'nen-cert-num': 'SELO-2026-00042',
          'nen-cert-cnpj': '12.345.678/0001-90',
          'nen-cert-fantasia': 'Aurora Night',
          'nen-cert-end': 'Av. do CPA, 1200 — Cuiabá/MT',
          'nen-cert-concessao': '2026-09-15',
          'nen-cert-validade': '2028-09-15',
          'nen-cert-qr': 'https://validador.mt.gov.br/doc/SELO-2026-00042',
          'nen-cert-status': 'VIGENTE',
        },
      },
    ],
    activeExamplePresetId: 'nen-cert-p1',
  }

  const recurso = {
    id: FORM_RECURSO,
    name: 'Formulário de Recurso',
    sectionLayout: 'none',
    fields: [
      field('nen-rec-razoes', 'Razões do recurso', 'text', {
        required: true,
        textLong: true,
        size: 'large',
        relevance: 'identity',
      }),
      field('nen-rec-anexos', 'Anexos', 'file', { multiple: true }),
      field('nen-rec-decisao', 'Decisão do recurso', 'textOptions', {
        options: RECURSO,
        relevance: 'highlight',
        spec: 'Autoridade',
      }),
      field('nen-rec-fund', 'Fundamentação do julgamento', 'text', {
        textLong: true,
        size: 'large',
      }),
    ],
    methods: [
      method('nen-rec-apresentar', 'Apresentar recurso', { appearance: 'primary' }),
      method('nen-rec-julgar', 'Julgar recurso', { appearance: 'primary' }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-rec-p1',
        label: 'Recurso — capacitação',
        fieldValues: {
          'nen-rec-razoes': 'Foram anexados novos certificados de 2 capacitados adicionais.',
          'nen-rec-decisao': 'Provido',
          'nen-rec-fund': 'Evidências sanam a não conformidade. Emitir selo.',
        },
      },
    ],
    activeExamplePresetId: 'nen-rec-p1',
  }

  const renovacao = {
    id: FORM_RENOVACAO,
    name: 'Formulário de Renovação',
    sectionLayout: 'none',
    fields: [
      field('nen-ren-selo', 'Número do selo vigente', 'text', {
        readOnly: true,
        relevance: 'identity',
      }),
      field('nen-ren-validade', 'Validade atual', 'date', { readOnly: true, relevance: 'highlight' }),
      field('nen-ren-alerta', 'Aviso', 'alert', {
        alertVariant: 'info',
        alertTitle: 'Renovação',
        alertMessage:
          'Dados cadastrais pré-preenchidos; revalidar condições e fotos. Mesmo fluxo de análise.',
      }),
      field('nen-ren-obs', 'Alterações a declarar', 'text', { textLong: true, size: 'large' }),
    ],
    methods: [
      method('nen-ren-iniciar', 'Iniciar renovação', { appearance: 'primary' }),
      method('nen-ren-protocolar', 'Protocolar renovação', { appearance: 'primary' }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-ren-p1',
        label: 'Renovação próxima ao vencimento',
        fieldValues: {
          'nen-ren-selo': 'SELO-2026-00042',
          'nen-ren-validade': '2028-09-15',
          'nen-ren-obs': 'Equipe atualizada; novas fotos de sinalização.',
        },
      },
    ],
    activeExamplePresetId: 'nen-ren-p1',
  }

  const cancelamento = {
    id: FORM_CANCELAMENTO,
    name: 'Cancelamento de Selo',
    sectionLayout: 'none',
    fields: [
      field('nen-can-selo', 'Selo', 'text', { readOnly: true, relevance: 'identity' }),
      field('nen-can-confirma', 'Confirmação de cancelamento', 'boolean', {
        required: true,
        relevance: 'highlight',
      }),
      field('nen-can-motivo', 'Motivo (opcional)', 'text', { textLong: true, size: 'large' }),
    ],
    methods: [
      method('nen-can-exec', 'Cancelar selo', {
        appearance: 'danger',
        spec: 'CANCELADO A PEDIDO; sai da lista',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-can-p1',
        label: 'Cancelamento voluntário',
        fieldValues: {
          'nen-can-selo': 'SELO-2026-00042 — Aurora Night',
          'nen-can-confirma': 'true',
          'nen-can-motivo': 'Encerramento das atividades no endereço.',
        },
      },
    ],
    activeExamplePresetId: 'nen-can-p1',
  }

  const revogacao = {
    id: FORM_REVOGACAO,
    name: 'Revogação de Selo',
    sectionLayout: 'none',
    fields: [
      field('nen-rev-selo', 'Estabelecimento / selo', 'text', {
        required: true,
        relevance: 'identity',
        spec: 'Selo VIGENTE',
      }),
      field('nen-rev-doc', 'Documento da decisão / processo', 'file', {
        required: true,
        relevance: 'highlight',
        spec: 'Cópia Sigadoc ou equivalente — sem integração Sigadoc nesta entrega',
      }),
      field('nen-rev-just', 'Justificativa / referência do processo', 'text', {
        required: true,
        textLong: true,
        size: 'large',
      }),
      field('nen-rev-data', 'Data da revogação', 'date', { required: true }),
      field('nen-rev-alerta', 'Atenção', 'alert', {
        alertVariant: 'warning',
        alertTitle: 'Sem notificação automática',
        alertMessage:
          'Empresa já cientificada no procedimento externo. Sistema só marca REVOGADO e remove da lista.',
      }),
    ],
    methods: [
      method('nen-rev-exec', 'Revogar selo', {
        appearance: 'danger',
        spec: 'REVOGADO; sai da lista; QR não vigente',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'nen-rev-p1',
        label: 'Revogação administrativa',
        fieldValues: {
          'nen-rev-selo': 'SELO-2026-00042 — Aurora Night (VIGENTE)',
          'nen-rev-just': 'Proc. Sigadoc 2026/12345 — descumprimento do protocolo após apuração interna.',
          'nen-rev-data': '2026-12-01',
        },
      },
    ],
    activeExamplePresetId: 'nen-rev-p1',
  }

  const estabelecimento = {
    id: FORM_ESTABELECIMENTO,
    name: 'Estabelecimentos com Selo',
    sectionLayout: 'none',
    fields: [
      field('nen-est-fantasia', 'Nome fantasia', 'text', { relevance: 'identity' }),
      field('nen-est-cnpj', 'CNPJ', 'text', { relevance: 'highlight' }),
      field('nen-est-end', 'Endereço', 'text', { size: 'large' }),
      field('nen-est-mun', 'Município', 'text', { relevance: 'highlight' }),
      field('nen-est-num', 'Número do selo', 'text', { relevance: 'highlight' }),
      field('nen-est-concessao', 'Data de concessão', 'date'),
      field('nen-est-validade', 'Validade', 'date', { relevance: 'highlight' }),
      field('nen-est-status', 'Status', 'textOptions', {
        options: STATUS_SELO,
        relevance: 'highlight',
      }),
    ],
    methods: [
      method('nen-est-filtrar', 'Filtrar'),
      method('nen-est-exportar', 'Exportar', { appearance: 'primary' }),
      method('nen-est-cancelar', 'Abrir cancelamento'),
      method('nen-est-revogar', 'Abrir revogação'),
    ],
    exampleValuePresets: [
      {
        id: 'nen-est-p1',
        label: 'Aurora — vigente',
        fieldValues: {
          'nen-est-fantasia': 'Aurora Night',
          'nen-est-cnpj': '12.345.678/0001-90',
          'nen-est-end': 'Av. do CPA, 1200',
          'nen-est-mun': 'Cuiabá',
          'nen-est-num': 'SELO-2026-00042',
          'nen-est-concessao': '2026-09-15',
          'nen-est-validade': '2028-09-15',
          'nen-est-status': 'VIGENTE',
        },
      },
      {
        id: 'nen-est-p2',
        label: 'Pantanal — revogado',
        fieldValues: {
          'nen-est-fantasia': 'Bar Pantanal',
          'nen-est-cnpj': '98.765.432/0001-10',
          'nen-est-mun': 'Várzea Grande',
          'nen-est-num': 'SELO-2026-00018',
          'nen-est-status': 'REVOGADO',
        },
      },
    ],
    activeExamplePresetId: 'nen-est-p1',
  }

  return [
    capacitado,
    acesso,
    solicitacao,
    analise,
    ajustes,
    decisao,
    certificado,
    recurso,
    renovacao,
    cancelamento,
    revogacao,
    estabelecimento,
  ]
}

function portals() {
  return [
    {
      id: 'portal-nen-estabelecimentos',
      name: 'Portal — Selo Não é Não',
      servicePortalHomeHeroTitle: 'Selo Não é Não — Mulheres Seguras',
      servicePortalHomeHeroSubtitle:
        'Solicite, acompanhe e renove o selo do seu estabelecimento. Autenticação via MT Login.',
      servicePortalHomeSearchPlaceholder: 'Buscar serviços',
      servicePortalHeaderMenuOptions: ['Início', 'Meus pedidos', 'Ajuda'],
      servicePortalHeaderUserInitials: 'MS',
      servicePortalHomeColorPrimary: '#9d174d',
      servicePortalHomeColorSecondary: '#be185d',
      servicePortalHomeColorText: '#ffffff',
      servicePortalHomeColorBackground: '#ffffff',
      servicePortalHomeSections: [
        {
          type: 'html',
          id: 'sec-nen-portal-info',
          htmlContent:
            '<div style="padding:16px 20px;margin:0 0 8px;background:#fdf2f8;border-radius:8px;border:1px solid:#fbcfe8;"><p style="margin:0 0 8px;font-weight:600;color:#9d174d;">Escopo desta entrega</p><p style="margin:0;font-size:0.9rem;color:#475569;">Um serviço: solicitação / concessão / renovação / cancelamento / revogação administrativa. Denúncia e apuração ficam nos canais atuais + Sigadoc (fora deste portal).</p></div>',
        },
        {
          type: 'catalog',
          id: 'sec-nen-portal-servicos',
          name: 'Serviços',
          gridColumns: 3,
          gridRows: 2,
          services: [
            {
              id: 'svc-nen-solicitar',
              name: 'Solicitar selo',
              description: 'MT Login → JUCEMAT → formulário → protocolar',
              icon: 'verified',
            },
            {
              id: 'svc-nen-acompanhar',
              name: 'Acompanhar pedido',
              description: 'Status, diligência e resultado',
              icon: 'history',
            },
            {
              id: 'svc-nen-renovar',
              name: 'Renovar selo',
              description: 'Pré-preenchido; validade 24 meses',
              icon: 'autorenew',
            },
            {
              id: 'svc-nen-cancelar',
              name: 'Cancelar selo',
              description: 'Cancelamento voluntário a pedido',
              icon: 'cancel',
            },
            {
              id: 'svc-nen-validar',
              name: 'Validar certificado',
              description: 'QR / Validador MT',
              icon: 'qr_code',
            },
          ],
        },
      ],
    },
  ]
}

function workspaces() {
  return [
    {
      id: 'ws-nen-procon',
      name: 'PROCON — Selo Não é Não',
      explorerChromeColor: '#9d174d',
      explorerHeaderForeground: '#ffffff',
      explorerUserInitials: 'PR',
      packages: [
        {
          id: 'pkg-nen-solicitacao',
          name: 'Solicitação',
          classes: [
            {
              id: 'cls-nen-acesso',
              name: 'Acesso e seleção',
              linkedFormId: FORM_ACESSO,
              linkedFormExamplePresetIds: ['nen-acs-p1'],
            },
            {
              id: 'cls-nen-solicitacao',
              name: 'Solicitação de Selo',
              linkedFormId: FORM_SOLICITACAO,
              linkedFormExamplePresetIds: ['nen-sol-p1', 'nen-sol-p2'],
            },
            {
              id: 'cls-nen-capacitado',
              name: 'Capacitados',
              linkedFormId: FORM_CAPACITADO,
              linkedFormExamplePresetIds: ['nen-cap-p1', 'nen-cap-p2'],
            },
          ],
        },
        {
          id: 'pkg-nen-analise',
          name: 'Análise e decisão',
          classes: [
            {
              id: 'cls-nen-analise',
              name: 'Análise PROCON',
              linkedFormId: FORM_ANALISE,
              linkedFormExamplePresetIds: ['nen-an-p1'],
            },
            {
              id: 'cls-nen-ajustes',
              name: 'Ajustes (diligência)',
              linkedFormId: FORM_AJUSTES,
              linkedFormExamplePresetIds: ['nen-aj-p1'],
            },
            {
              id: 'cls-nen-decisao',
              name: 'Decisão',
              linkedFormId: FORM_DECISAO,
              linkedFormExamplePresetIds: ['nen-dec-p1', 'nen-dec-p2'],
            },
            {
              id: 'cls-nen-recurso',
              name: 'Recurso',
              linkedFormId: FORM_RECURSO,
              linkedFormExamplePresetIds: ['nen-rec-p1'],
            },
          ],
        },
        {
          id: 'pkg-nen-selo',
          name: 'Selo e pós-concessão',
          classes: [
            {
              id: 'cls-nen-cert',
              name: 'Certificado do Selo',
              linkedFormId: FORM_CERTIFICADO,
              linkedFormExamplePresetIds: ['nen-cert-p1'],
            },
            {
              id: 'cls-nen-estab',
              name: 'Estabelecimentos com Selo',
              linkedFormId: FORM_ESTABELECIMENTO,
              linkedFormExamplePresetIds: ['nen-est-p1', 'nen-est-p2'],
            },
            {
              id: 'cls-nen-renov',
              name: 'Renovação',
              linkedFormId: FORM_RENOVACAO,
              linkedFormExamplePresetIds: ['nen-ren-p1'],
            },
            {
              id: 'cls-nen-canc',
              name: 'Cancelamento',
              linkedFormId: FORM_CANCELAMENTO,
              linkedFormExamplePresetIds: ['nen-can-p1'],
            },
            {
              id: 'cls-nen-rev',
              name: 'Revogação',
              linkedFormId: FORM_REVOGACAO,
              linkedFormExamplePresetIds: ['nen-rev-p1'],
            },
          ],
        },
      ],
    },
  ]
}

function classGroups(formList) {
  const groups = [
    { id: 'grp-nen-entrada', name: 'Entrada e solicitação' },
    { id: 'grp-nen-procon', name: 'Análise PROCON' },
    { id: 'grp-nen-pos', name: 'Selo e pós-concessão' },
  ]
  const map = {
    [FORM_CAPACITADO]: 'grp-nen-entrada',
    [FORM_ACESSO]: 'grp-nen-entrada',
    [FORM_SOLICITACAO]: 'grp-nen-entrada',
    [FORM_ANALISE]: 'grp-nen-procon',
    [FORM_AJUSTES]: 'grp-nen-procon',
    [FORM_DECISAO]: 'grp-nen-procon',
    [FORM_RECURSO]: 'grp-nen-procon',
    [FORM_CERTIFICADO]: 'grp-nen-pos',
    [FORM_ESTABELECIMENTO]: 'grp-nen-pos',
    [FORM_RENOVACAO]: 'grp-nen-pos',
    [FORM_CANCELAMENTO]: 'grp-nen-pos',
    [FORM_REVOGACAO]: 'grp-nen-pos',
  }
  const assignments = {}
  const memberOrderByGroup = {
    'grp-nen-entrada': [],
    'grp-nen-procon': [],
    'grp-nen-pos': [],
  }
  for (const f of formList) {
    const g = map[f.id]
    if (!g) continue
    assignments[f.id] = g
    memberOrderByGroup[g].push(f.id)
  }
  return { groups, assignments, memberOrderByGroup }
}

function htmlSlide(title, body) {
  return `<div style="padding:28px 48px 56px 48px;max-width:980px;margin:0 auto;font-family:Segoe UI,Inter,system-ui,sans-serif;color:#0f172a;line-height:1.55;">
  <div style="font-size:0.75rem;color:#9d174d;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">Projeto Não é Não — Seplag v1</div>
  <h1 style="font-size:1.75rem;margin:0 0 12px;color:#9d174d;">${title}</h1>
  ${body}
</div>`
}

function flows() {
  const steps = [
    {
      id: 'step-nen-capa',
      title: 'Capa',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Não é Não — Seplag v1',
      htmlContent: htmlSlide(
        'Selo “Não é Não – Mulheres Seguras”',
        `<p style="color:#475569;margin:0 0 16px;">Protótipo completo do <strong>único serviço</strong> desta entrega: solicitação, análise, concessão, renovação, cancelamento e revogação administrativa.</p>
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li>Integrações: <strong>MT Login</strong>, <strong>JUCEMAT</strong>, <strong>Validador MT</strong></li>
          <li>Fora: denúncia/fiscalização no sistema; integração Sigadoc; Procon Digital</li>
          <li>Revogação = upload da decisão + status REVOGADO (sem notificar de novo)</li>
        </ul>`,
      ),
    },
    {
      id: 'step-nen-escopo',
      title: 'Escopo (reunião 10/09)',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Escopo fechado',
      htmlContent: htmlSlide(
        'Alinhamento de serviços — 10/09',
        `<div style="border-left:4px solid #9d174d;background:#fdf2f8;padding:14px 18px;border-radius:8px;margin:0 0 12px;">
          <strong>1 serviço</strong> — Solicitação de Selo (inclui pós-concessão: renovar / cancelar / revogar).
        </div>
        <div style="border-left:4px solid #64748b;background:#f8fafc;padding:14px 18px;border-radius:8px;">
          Denúncia e apuração: canais atuais + <strong>Sigadoc</strong> (fora do sistema). No selo só sobe a decisão e marca REVOGADO.
        </div>`,
      ),
    },
    {
      id: 'step-nen-portal',
      title: 'Portal do estabelecimento',
      type: 'servicePortal',
      linkedPortalId: 'portal-nen-estabelecimentos',
      servicePortalServiceNavigateStepIds: {
        'svc-nen-solicitar': 'step-nen-acesso',
        'svc-nen-acompanhar': 'step-nen-ws',
        'svc-nen-renovar': 'step-nen-renovacao',
        'svc-nen-cancelar': 'step-nen-cancelamento',
        'svc-nen-validar': 'step-nen-certificado',
      },
    },
    {
      id: 'step-nen-acesso',
      title: '1. Acesso MT Login + JUCEMAT',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Autenticar e selecionar estabelecimento',
      bpmnDescription:
        'Solicitante autentica via MT Login. Sistema lista empresas vinculadas na JUCEMAT; usuário seleciona a unidade do requerimento.',
      assigneeRole: 'Solicitante (estabelecimento)',
      bpmnInputs: 'Credencial MT Login; empresas JUCEMAT; documento de representação se necessário.',
      bpmnOutputs: 'Estabelecimento vinculado ao requerimento.',
      bpmnRuleList: [
        'Somente empresas retornadas pela JUCEMAT',
        'Requerimento vinculado à unidade',
        'Quem pode solicitar (sócio/representante/filial): pendência de negócio',
      ],
      bpmnPossiblePaths: [{ key: 'Empresa selecionada', value: 'step-nen-solicitacao' }],
      linkedFormId: FORM_ACESSO,
      bpmnFormConfirmNavigateStepId: 'step-nen-solicitacao',
    },
    {
      id: 'step-nen-solicitacao',
      title: '2. Formulário de Solicitação',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Preencher solicitação do selo',
      bpmnDescription:
        'Coletar dados, enquadramento, capacitados, sinalização, código, procedimentos, câmeras e declarações.',
      assigneeRole: 'Solicitante (estabelecimento)',
      bpmnInputs: 'Dados JUCEMAT + evidências do Protocolo Não é Não.',
      bpmnOutputs: 'Rascunho ou pedido pronto para revisão.',
      bpmnRuleList: [
        'Percentual de capacitados calculado automaticamente',
        'Câmeras condicionais; ausência não reprova',
        'Bloquear envio se obrigatórios faltarem',
      ],
      bpmnPossiblePaths: [{ key: 'Revisar', value: 'step-nen-revisao' }],
      linkedFormId: FORM_SOLICITACAO,
      bpmnFormConfirmNavigateStepId: 'step-nen-revisao',
    },
    {
      id: 'step-nen-revisao',
      title: '3. Revisão e protocolização',
      type: 'bpmnActivity',
      bpmnTaskType: 'userTask',
      bpmnActivityKey: 'Protocolar solicitação',
      bpmnDescription:
        'Revisa resumo e anexos. Ao protocolar: número, data/hora, comprovante, STATUS PROTOCOLADO e notificação ao servidor PROCON.',
      assigneeRole: 'Solicitante (estabelecimento)',
      bpmnOutputs: 'Pedido PROTOCOLADO',
      bpmnRuleList: ['Bloqueia se pendências obrigatórias'],
      bpmnPossiblePaths: [{ key: 'Protocolado', value: 'step-nen-analise' }],
      linkedFormId: FORM_SOLICITACAO,
      bpmnFormConfirmNavigateStepId: 'step-nen-analise',
    },
    {
      id: 'step-nen-analise',
      title: '4. Análise PROCON',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Analisar requisitos',
      bpmnDescription:
        'Analista avalia item a item (conforme / não conforme / necessita complementação). Prazo até 30 dias.',
      assigneeRole: 'Analista PROCON',
      bpmnRuleList: [
        'Não deferir com item obrigatório “não conforme”',
        'Diligência única — todas as pendências de uma vez',
      ],
      bpmnPossiblePaths: [
        { key: 'Abrir diligência', value: 'step-nen-ajustes' },
        { key: 'Encaminhar decisão', value: 'step-nen-decisao' },
      ],
      linkedFormId: FORM_ANALISE,
      bpmnFormConfirmNavigateStepId: 'step-nen-ajustes',
    },
    {
      id: 'step-nen-ajustes',
      title: '5. Diligência (5 dias)',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Complementar pendências',
      bpmnDescription:
        'Status EM DILIGÊNCIA. Prazo 5 dias (Lei 7.692/2002). Suspende contagem do prazo de análise. Sem indeferimento automático por ausência de resposta.',
      assigneeRole: 'Solicitante (estabelecimento)',
      bpmnRuleList: ['Diligência única', 'Sem resposta → DILIGÊNCIA NÃO RESPONDIDA; segue para decisão'],
      bpmnPossiblePaths: [{ key: 'Respondida', value: 'step-nen-decisao' }],
      linkedFormId: FORM_AJUSTES,
      bpmnFormConfirmNavigateStepId: 'step-nen-decisao',
    },
    {
      id: 'step-nen-decisao',
      title: '6. Decisão',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Deferir ou indeferir',
      bpmnDescription:
        'Autoridade decide. Deferimento emite certificado + QR Validador MT + inclui na classe. Indeferimento informa recurso.',
      assigneeRole: 'Autoridade PROCON',
      bpmnPossiblePaths: [
        { key: 'Deferido', value: 'step-nen-certificado' },
        { key: 'Indeferido → recurso', value: 'step-nen-recurso' },
      ],
      linkedFormId: FORM_DECISAO,
      bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
    },
    {
      id: 'step-nen-recurso',
      title: '7. Recurso',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Apresentar / julgar recurso',
      bpmnDescription: 'Provido → emite selo. Não provido → finaliza pedido.',
      assigneeRole: 'Solicitante / Autoridade PROCON',
      bpmnPossiblePaths: [
        { key: 'Provido', value: 'step-nen-certificado' },
        { key: 'Não provido', value: 'step-nen-pos' },
      ],
      linkedFormId: FORM_RECURSO,
      bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
    },
    {
      id: 'step-nen-certificado',
      title: '8. Emissão do selo',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Emitir certificado + QR',
      bpmnDescription:
        'Número único, dados da unidade, validade 24 meses, QR Validador MT, status VIGENTE, notificações.',
      assigneeRole: 'Sistema / PROCON',
      bpmnOutputs: 'Selo VIGENTE na classe Estabelecimentos com Selo',
      bpmnPossiblePaths: [{ key: 'Vigente', value: 'step-nen-pos' }],
      linkedFormId: FORM_CERTIFICADO,
      bpmnFormConfirmNavigateStepId: 'step-nen-pos',
    },
    {
      id: 'step-nen-pos',
      title: '9. Pós-concessão',
      type: 'html',
      htmlPresentationShowHeader: true,
      htmlPresentationHeaderTitle: 'Pós-concessão',
      htmlContent: htmlSlide(
        'Após o selo vigente',
        `<ol style="padding-left:18px;color:#334155;">
          <li><strong>Notificação</strong> próximo ao vencimento</li>
          <li><strong>Renovar</strong> — formulário pré-preenchido + mesmo fluxo de análise</li>
          <li><strong>Cancelar a pedido</strong> — status CANCELADO A PEDIDO; sai da lista</li>
          <li><strong>Revogar</strong> — PROCON sobe decisão/Sigadoc e marca REVOGADO (sem notificar)</li>
        </ol>
        <p style="margin-top:14px;color:#64748b;font-size:0.95rem;">Denúncia/apuração: fora do sistema (canais atuais + Sigadoc).</p>`,
      ),
    },
    {
      id: 'step-nen-renovacao',
      title: '10. Renovação',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Renovar selo',
      bpmnDescription: 'Dados pré-preenchidos; revalidar condições e fotos. Protocola e volta à análise.',
      assigneeRole: 'Solicitante (estabelecimento)',
      linkedFormId: FORM_RENOVACAO,
      bpmnFormConfirmNavigateStepId: 'step-nen-analise',
    },
    {
      id: 'step-nen-cancelamento',
      title: '11. Cancelamento a pedido',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Cancelar selo',
      bpmnDescription: 'Cancelamento voluntário → CANCELADO A PEDIDO → sai da lista pública.',
      assigneeRole: 'Solicitante (estabelecimento)',
      linkedFormId: FORM_CANCELAMENTO,
      bpmnFormConfirmNavigateStepId: 'step-nen-lista',
    },
    {
      id: 'step-nen-revogacao',
      title: '12. Revogação administrativa',
      type: 'bpmnActivity',
      bpmnTaskType: 'entryForm',
      bpmnActivityKey: 'Revogar selo',
      bpmnDescription:
        'Após apuração externa (Sigadoc): anexar decisão, marcar REVOGADO, remover da lista. Sem notificação automática. Sem integração Sigadoc nesta entrega.',
      assigneeRole: 'Autoridade / Analista PROCON',
      bpmnRuleList: [
        'Apuração não ocorre neste sistema',
        'Sem notificação de revogação no sistema',
        'Sem módulo de denúncia nesta entrega',
      ],
      linkedFormId: FORM_REVOGACAO,
      bpmnFormConfirmNavigateStepId: 'step-nen-lista',
    },
    {
      id: 'step-nen-lista',
      title: '13. Classe / lista de selos',
      type: 'class',
      linkedFormId: FORM_ESTABELECIMENTO,
      classPresentationTitle: 'Estabelecimentos com Selo',
      classPresentationDescription:
        'Registro atualizado em deferimento, expiração, cancelamento e revogação. MVP via analytics/relatório (API pública fase futura).',
      classPresentationRequirements:
        'Consultar vigentes, a vencer, cancelados e revogados; exportar; abrir cancelamento/revogação conforme perfil.',
      classPresentationStoryList: [
        'Como PROCON, quero listar estabelecimentos com selo vigente.',
        'Como autoridade, quero revogar um selo anexando a decisão do Sigadoc.',
      ],
      classPresentationRuleList: [
        'Status: VIGENTE | EXPIRADO | CANCELADO A PEDIDO | REVOGADO',
        'Revogado/cancelado sai da lista pública',
      ],
      classMethodNavigateStepIds: {
        'nen-est-cancelar': 'step-nen-cancelamento',
        'nen-est-revogar': 'step-nen-revogacao',
      },
    },
    {
      id: 'step-nen-ws',
      title: '14. Workspace PROCON',
      type: 'workspace',
      linkedWorkspaceId: 'ws-nen-procon',
      workspacePresentationDescription:
        'Backoffice PROCON: solicitação, análise/decisão e pós-concessão (certificado, lista, renovação, cancelamento, revogação).',
    },
  ]

  return [
    {
      id: 'flow-nen-prototipo-completo',
      name: 'Protótipo completo — Selo Não é Não',
      metadata:
        'Fluxo ponta a ponta alinhado à documentação e FigJam. Regenerar: node scripts/build-nnseplag-v1.mjs',
      steps,
    },
  ]
}

function normalizeForm(form) {
  const out = { ...form }
  if (Array.isArray(out.sections)) {
    out.sections = out.sections.map((s) => ({
      id: s.id,
      title: s.title || s.name || s.id,
      icon: s.icon || 'description',
    }))
  }
  if (Array.isArray(out.methods)) {
    out.methods = out.methods.map((m) => {
      const name = m.name || m.label || m.id
      let kind = m.kind === 'menu' ? 'menu' : 'destaque'
      if (m.appearance === 'default') kind = 'menu'
      if (/cancelar|indeferir|revogar|salvar rascunho|filtrar|voltar/i.test(name)) kind = 'menu'
      return {
        id: m.id,
        name,
        icon: m.icon || 'play_arrow',
        kind,
      }
    })
  }
  if (Array.isArray(out.exampleValuePresets)) {
    out.exampleValuePresets = out.exampleValuePresets.map((p) => ({
      id: p.id,
      name: p.name || p.label || p.id,
      iconColor: p.iconColor || '#9d174d',
      fieldValues: p.fieldValues || {},
      ...(p.embeddedRowsByFieldId ? { embeddedRowsByFieldId: p.embeddedRowsByFieldId } : {}),
    }))
  }
  return out
}

ensureDir(subDir)
ensureDir(epicDir)

writeJson(path.join(subDir, 'subproject.json'), { name: 'Não é Não / Seplag' })
writeJson(path.join(epicDir, 'epic.json'), { name: 'Projeto Não é Não - Seplag v1.' })

const formList = forms().map(normalizeForm)
writeJson(path.join(epicDir, 'forms.json'), formList)
writeJson(path.join(epicDir, 'portals.json'), portals())
writeJson(path.join(epicDir, 'workspaces.json'), workspaces())
writeJson(path.join(epicDir, 'class-groups.json'), classGroups(formList))
writeJson(path.join(epicDir, 'flows.json'), flows())

fs.writeFileSync(
  path.join(epicDir, 'context.md'),
  `# Projeto Não é Não - Seplag v1.

Épico gerado a partir da documentação PROCON (selo) e do fluxo FigJam.

## Regenerar

\`\`\`bash
node scripts/build-nnseplag-v1.mjs
\`\`\`

## Escopo (10/09)
- 1 serviço: solicitação/concessão/renovação/cancelamento/revogação
- Sem denúncia/fiscalização no sistema
- Revogação = upload decisão + REVOGADO (sem notificar)
- Integrações: MT Login, JUCEMAT, Validador MT
`,
  'utf-8',
)

console.log(`Épico criado em ${epicDir}`)
console.log(`- ${formList.length} classes`)
console.log(`- ${portals().length} portal(is)`)
console.log(`- ${workspaces().length} workspace(s)`)
console.log(`- ${flows()[0].steps.length} etapas no protótipo`)
