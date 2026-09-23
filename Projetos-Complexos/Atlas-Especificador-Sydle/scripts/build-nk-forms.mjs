import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '../data/subprojects/financeiro/epics/criacao-do-cronograma/forms.json')

function monthVals(seed) {
  const m = []
  for (let i = 0; i < 12; i++) m.push(Math.round((seed + i * 137) * 1000 + i * 500))
  return m
}

function rowFromVals(cod, nd, vals) {
  const [jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez] = vals
  return {
    'nk-d-cod': cod,
    'nk-d-nd': nd,
    jan,
    fev,
    mar,
    abr,
    mai,
    jun,
    jul,
    ago,
    set,
    out,
    nov,
    dez,
  }
}

const empenhoPresets = []
for (let i = 1; i <= 10; i++) {
  const n = String(i).padStart(2, '0')
  empenhoPresets.push({
    id: `nk-emp-p${n}`,
    name: `Empenho exemplo ${i}`,
    iconColor: i % 2 ? '#0ea5e9' : '#6366f1',
    fieldValues: {
      'nk-emp-cod': `EMP-NK-${n}`,
      'nk-emp-resumo': `Nota de empenho / compromisso ${i} — vínculo com dotação e contrato (cenário ${i}).`,
    },
  })
}

const contrPresets = []
for (let i = 1; i <= 10; i++) {
  const n = String(i).padStart(2, '0')
  contrPresets.push({
    id: `nk-ct-p${n}`,
    name: `Contrato exemplo ${i}`,
    iconColor: i % 2 ? '#059669' : '#d97706',
    fieldValues: {
      'nk-ct-num': `${2024 + (i % 3)}.${String(i).padStart(3, '0')}`,
      'nk-ct-obj': `Objeto contratual ${i} — fornecimento / serviço contínuo com vigência plurianual (demonstração ${i}).`,
    },
  })
}

const MESES_CRONO = [
  { id: 'jan', label: 'Jan', nome: 'janeiro' },
  { id: 'fev', label: 'Fev', nome: 'fevereiro' },
  { id: 'mar', label: 'Mar', nome: 'março' },
  { id: 'abr', label: 'Abr', nome: 'abril' },
  { id: 'mai', label: 'Mai', nome: 'maio' },
  { id: 'jun', label: 'Jun', nome: 'junho' },
  { id: 'jul', label: 'Jul', nome: 'julho' },
  { id: 'ago', label: 'Ago', nome: 'agosto' },
  { id: 'set', label: 'Set', nome: 'setembro' },
  { id: 'out', label: 'Out', nome: 'outubro' },
  { id: 'nov', label: 'Nov', nome: 'novembro' },
  { id: 'dez', label: 'Dez', nome: 'dezembro' },
]

const embFields = [
  {
    id: 'nk-d-cod',
    label: 'Dotação (UG / PT / ND / fonte)',
    type: 'text',
    size: 'medium',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'highlight',
    spec:
      'Identificação legível da dotação: unidade gestora, programa de trabalho (ou projeto/atividade), natureza e fonte, como consta na programação orçamentária e no vínculo com o instrumento. Serve para rastreabilidade entre LOA, empenho e esta linha do cronograma.',
  },
  {
    id: 'nk-d-nd',
    label: 'Natureza da despesa (ND)',
    type: 'text',
    size: 'small',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    spec:
      'Código da natureza da despesa (e opcionalmente o rótulo) no plano de contas aplicável, garantindo alinhamento contábil e com o empenho. Deve ser consistente com a classificação usada no empenho e na contabilidade da UG.',
  },
  ...MESES_CRONO.map(({ id, label, nome }) => ({
    id,
    label,
    type: 'decimal',
    size: 'small',
    currency: true,
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    spec: `Valor em reais (R$) previsto para o mês de ${nome} nesta dotação: competência de desembolso ou reconhecimento da despesa. A soma dos doze meses desta linha, com as demais linhas do exercício, deve respeitar limites da dotação e do instrumento (Lei 14.133/2021, LRF, LOA).`,
  })),
]

const embFieldsRo = embFields.map((f) => ({ ...f, readOnly: true }))

const demoRows2024 = [
  rowFromVals('339039 — Material de consumo', '339039', monthVals(12)),
  rowFromVals('449052 — Serviços de TI', '449052', monthVals(55)),
]
const demoRows2025 = [
  rowFromVals('339039 — Material de consumo', '339039', monthVals(20)),
  rowFromVals('449052 — Serviços de TI', '449052', monthVals(66)),
  rowFromVals('449061 — Outros serviços de terceiros', '449061', monthVals(33)),
]
const demoRows2026 = [
  rowFromVals('339039 — Material de consumo', '339039', monthVals(8)),
]

const anoOptions = ['2024', '2025', '2026']

/** Cada linha do campo multi-embutido = um exercício (subformulário). */
function exerciseInstance(year, innerRows) {
  return {
    'nk-ex-ano': year,
    emb_dotacoes: { embeddedDemoInstances: innerRows },
  }
}

const validacaoPresetDemo = {
  id: 'nk-val-preset-demo',
  name: 'Validação — mesmo cenário cadastrado',
  fieldValues: {
    'nk-id-instrumento': 'Contrato nº 45/2024 — Pregão eletrônico 12/2024',
    'nk-id-ug': 'UG 120101 — Secretaria executiva',
    'nk-id-processo': 'SEI 00045.012345/2024-11',
    'nk-lei-nota':
      'Compatível com Lei 14.133/2021, LC 101/2000 (LRF) e LOA/CLO vigentes; dotações autorizadas no instrumento e na programação orçamentária.',
    'nk-val-decisao': 'Aprovar',
  },
  embeddedRowsByFieldId: {
    emb_exercicios_val: [
      exerciseInstance('2024', demoRows2024.map((r) => ({ ...r }))),
      exerciseInstance('2025', demoRows2025.map((r) => ({ ...r }))),
      exerciseInstance('2026', demoRows2026.map((r) => ({ ...r }))),
    ],
  },
}

const forms = [
  {
    id: 'form-nk-classe-empenho',
    name: 'Classe — Empenho',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    fields: [
      {
        id: 'nk-emp-cod',
        label: 'Identificador do empenho',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'highlight',
        spec: 'Objetos da classe Empenho. Use os cenários na listagem do workspace.',
      },
      {
        id: 'nk-emp-resumo',
        label: 'Resumo',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        spec:
          'Descrição sintética do empenho de exemplo: objeto, fornecedor ou finalidade, e vínculo com contrato/dotação. Usado no workspace para distinguir cenários de demonstração sem confundir com empenhos reais de produção.',
      },
    ],
    exampleValuePresets: empenhoPresets,
    activeExamplePresetId: 'nk-emp-p01',
  },
  {
    id: 'form-nk-classe-contrato',
    name: 'Classe — Contrato',
    sectionLayout: 'none',
    defaultCanvasMode: 'read',
    methods: [
      {
        id: 'meth-nk-cronograma',
        name: 'Criar cronograma',
        icon: 'calendar_month',
        kind: 'destaque',
      },
    ],
    fields: [
      {
        id: 'nk-ct-num',
        label: 'Nº / ano do contrato',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'highlight',
        spec:
          'Identificador do contrato no padrão institucional (número, ano, modalidade) para localizar o instrumento no workspace. O método «Criar cronograma» usa este contexto para amarrar o fluxo ao contrato de referência.',
      },
      {
        id: 'nk-ct-obj',
        label: 'Objeto',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        spec: 'Abra um contrato de exemplo e use «Criar cronograma».',
      },
    ],
    exampleValuePresets: contrPresets,
    activeExamplePresetId: 'nk-ct-p01',
  },
  {
    id: 'form-nk-embed-dota-mes',
    name: 'Linha — Dotação × meses (edição)',
    sectionLayout: 'none',
    fields: embFields,
  },
  {
    id: 'form-nk-embed-dota-mes-ro',
    name: 'Linha — Dotação × meses (somente leitura)',
    sectionLayout: 'none',
    fields: embFieldsRo,
  },
  {
    id: 'form-nk-bloco-exercicio',
    name: 'Subformulário — um exercício orçamentário',
    sectionLayout: 'none',
    fields: [
      {
        id: 'nk-ex-ano',
        label: 'Exercício orçamentário (LOA / competência)',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        options: anoOptions,
        spec: 'Cada instância deste subformulário representa um exercício financeiro (adicione uma linha por ano no campo pai).',
      },
      {
        id: 'emb_dotacoes',
        label: 'Dotações — valores mensais (R$)',
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'highlight',
        embeddedDisplay: 'table',
        linkedFormId: 'form-nk-embed-dota-mes',
        spec:
          'Tabela de dotações com decomposição mensal (Jan–Dez) em reais. Cada linha repete a estrutura UG/PT/ND/fonte e os valores por mês. Inclua uma linha por dotação relevante ao exercício selecionado; linhas adicionais representam rateio entre fontes ou naturezas distintas.',
      },
    ],
  },
  {
    id: 'form-nk-bloco-exercicio-ro',
    name: 'Subformulário — exercício (conferência)',
    sectionLayout: 'none',
    fields: [
      {
        id: 'nk-ex-ano',
        label: 'Exercício orçamentário (LOA / competência)',
        type: 'textOptions',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        options: anoOptions,
        spec:
          'Exercício financeiro (ano da LOA) em modo conferência. Deve coincidir com o cadastrado; não editável para preservar integridade do parecer.',
      },
      {
        id: 'emb_dotacoes',
        label: 'Dotações — valores mensais (R$)',
        type: 'embeddedReference',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: true,
        relevance: 'highlight',
        embeddedDisplay: 'table',
        linkedFormId: 'form-nk-embed-dota-mes-ro',
        spec:
          'Mesma estrutura do cadastro, em somente leitura: validador confere dotações e valores mensais sem alterar números nesta etapa.',
      },
    ],
  },
  {
    id: 'form-nk-cadastro-cronograma',
    name: 'Cadastro do cronograma (LOA / contratos públicos)',
    sectionLayout: 'accordion',
    sections: [
      { id: 'sec-nk-ident', title: 'Instrumento e processo' },
      { id: 'sec-nk-lei', title: 'Base legal e compatibilidade orçamentária' },
      { id: 'sec-nk-crono', title: 'Cronograma por exercício financeiro' },
    ],
    fields: [
      {
        id: 'nk-id-instrumento',
        label: 'Instrumento contratual',
        type: 'text',
        size: 'large',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nk-ident',
        spec:
          'Nome ou referência completa do instrumento (contrato, termo aditivo objeto do cronograma). Deve permitir localização inequívoca no sistema de gestão contratual e amarração com empenhos.',
      },
      {
        id: 'nk-id-ug',
        label: 'Unidade gestora / UG',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nk-ident',
        spec:
          'Unidade gestora responsável pela execução orçamentária do instrumento (código e nome conforme SOF/planejamento). Define âmbito da programação da despesa no SIAFI ou equivalente.',
      },
      {
        id: 'nk-id-processo',
        label: 'Processo SEI / administrativo',
        type: 'text',
        size: 'medium',
        readOnly: false,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nk-ident',
        spec:
          'Número do processo eletrônico ou administrativo que instrui o cronograma (SEI, grifo etc.). Opcional no protótipo; recomendado em produção para auditoria e tramitação.',
      },
      {
        id: 'nk-lei-nota',
        label: 'Declaração de conformidade (Lei 14.133/2021, LC 101/2000, LOA)',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nk-lei',
        spec:
          'Indique aderência ao planejamento da despesa pública. No campo seguinte, adicione um subformulário por exercício (ex.: 2024, 2025, 2026); em cada um, informe as dotações e a repartição mensal.',
      },
      {
        id: 'emb_exercicios_multi',
        label: 'Exercícios — referência embutida múltipla (cada item = um exercício)',
        type: 'embeddedReference',
        size: 'large',
        readOnly: false,
        required: false,
        multiple: true,
        relevance: 'highlight',
        embeddedDisplay: 'form',
        linkedFormId: 'form-nk-bloco-exercicio',
        sectionId: 'sec-nk-crono',
        spec:
          'Um único campo com várias instâncias do subformulário de exercício. Adicione uma linha por ano-orçamentário; dentro de cada uma, escolha o exercício e preencha a tabela de dotações × meses.',
      },
    ]
  },
  {
    id: 'form-nk-teste-cronograma',
    name: 'Validação do cronograma',
    sectionLayout: 'accordion',
    defaultCanvasMode: 'edit',
    sections: [
      { id: 'sec-nk-ident', title: 'Instrumento e processo' },
      { id: 'sec-nk-lei', title: 'Base legal e compatibilidade orçamentária' },
      { id: 'sec-nk-crono', title: 'Cronograma por exercício (conferência)' },
      { id: 'sec-nk-dec', title: 'Decisão' },
    ],
    fields: [
      {
        id: 'nk-id-instrumento',
        label: 'Instrumento contratual',
        type: 'text',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nk-ident',
        spec:
          'Cópia somente leitura do instrumento informado no cadastro; base para o validador citar o objeto da análise.',
      },
      {
        id: 'nk-id-ug',
        label: 'Unidade gestora / UG',
        type: 'text',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nk-ident',
        spec:
          'UG fixada no cadastro; conferência de que o cronograma está no âmbito correto da execução.',
      },
      {
        id: 'nk-id-processo',
        label: 'Processo SEI / administrativo',
        type: 'text',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'common',
        sectionId: 'sec-nk-ident',
        spec:
          'Referência de processo trazida do cadastro para rastreio na validação.',
      },
      {
        id: 'nk-lei-nota',
        label: 'Declaração de conformidade (Lei 14.133/2021, LC 101/2000, LOA)',
        type: 'text',
        size: 'large',
        textLong: true,
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nk-lei',
        spec:
          'Texto de aderência legal e orçamentária declarado pelo cadastrante; o validador verifica se permanece plausível face ao cronograma exibido.',
      },
      {
        id: 'emb_exercicios_val',
        label: 'Exercícios — conferência (somente leitura)',
        type: 'embeddedReference',
        size: 'large',
        readOnly: true,
        required: false,
        multiple: true,
        relevance: 'highlight',
        embeddedDisplay: 'form',
        linkedFormId: 'form-nk-bloco-exercicio-ro',
        sectionId: 'sec-nk-crono',
        spec:
          'Réplica do cronograma por exercício: um subformulário por ano LOA, cada um com tabela dotação × meses. Usado exclusivamente para revisão e decisão.',
      },
      {
        id: 'nk-val-decisao',
        label: 'Parecer sobre o cronograma',
        type: 'textOptions',
        size: 'medium',
        readOnly: false,
        required: true,
        multiple: false,
        relevance: 'highlight',
        sectionId: 'sec-nk-dec',
        options: ['Aprovar', 'Rejeitar'],
        spec:
          'Decisão formal da validação: «Aprovar» segue para encerramento; «Rejeitar» sinaliza inconsistências ou descumprimento de regras (em produção costuma acionar retorno ao cadastro).',
      },
    ],
    exampleValuePresets: [validacaoPresetDemo],
    activeExamplePresetId: 'nk-val-preset-demo',
  },
]

fs.writeFileSync(outPath, JSON.stringify(forms, null, 2) + '\n', 'utf-8')
console.log('Wrote', outPath)
