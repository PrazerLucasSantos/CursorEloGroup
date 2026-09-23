#!/usr/bin/env node
/**
 * Contrato — 12 abas (tela de gestão contratual) + formulários embutidos.
 * Uso: node scripts/patch-atlas-prototipo-contrato-detalhes.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM = 'form-patlasv4-proto-contrato'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_OS = 'form-patlasv4-proto-emissao-ordem-servico'
const FORM_OS_LINHA = 'form-patlasv4-proto-contrato-ordem-servico'
const FORM_PRODUTO = 'form-patlasv4-proto-contrato-produto-contratado'

const SEC_DET = 'sec-patlasv4proto-contrato-detalhes'
const SEC_CONTRATO = 'sec-patlasv4proto-contrato-sec-contrato'
const SEC_FIN = 'sec-patlasv4proto-contrato-sec-financeiro'
const SEC_REN = 'sec-patlasv4proto-contrato-sec-renovacao'
const SEC_OS = 'sec-patlasv4proto-contrato-ordem-servico'
const SEC_PROD = 'sec-patlasv4proto-contrato-produtos-contratados'

const CONTRATO_REF = '163/2025/PMC'

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
    ...(sectionId ? { sectionId } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
  }
}

function emb(id, label, linkedFormId, sectionId, opts = {}) {
  return {
    id,
    label,
    type: 'embeddedReference',
    size: opts.size ?? 'large',
    readOnly: false,
    required: false,
    multiple: true,
    relevance: 'common',
    sectionId,
    linkedFormId,
    embeddedDisplay: opts.embeddedDisplay ?? 'table',
    ...(opts.spec ? { spec: opts.spec } : {}),
  }
}

function buildChildForms() {
  const osLineFields = [
    f('patlasv4proto-ctos-numero', 'Número', 'reference', null, {
      readOnly: true,
      relevance: 'identity',
      size: 'small',
      linkedFormId: FORM_OS,
      options: ['ORSR0002026', 'ORSR0002027', 'ORSR0002028'],
    }),
    f('patlasv4proto-ctos-tipo', 'Tipo OS', 'textOptions', null, {
      size: 'small',
      options: ['Cliente', 'Parceiro', 'MTI', 'Interno'],
    }),
    f('patlasv4proto-ctos-nome', 'Nome', 'text', null, { size: 'large' }),
    f('patlasv4proto-ctos-data-inicio', 'Data de início planejada', 'date', null, {
      size: 'small',
    }),
    f('patlasv4proto-ctos-servico', 'Serviço', 'reference', null, {
      options: [
        'CSPS - Plataforma de Simplificação',
        'Desenvolvimento de software',
        'Suporte técnico',
      ],
    }),
    f('patlasv4proto-ctos-departamento', 'Departamento', 'reference', null, {
      linkedFormId: FORM_UO,
      options: ['UGGDI - UNIDADE DE GESTAO DE GOVERNANCA DIGITAL E INOVACAO'],
    }),
    f('patlasv4proto-ctos-gerente', 'Gerente de demandas', 'reference', null, {
      linkedFormId: FORM_PESSOA,
      options: ['Robson Silva Dolores Dias', 'Felipe Oliveira Costa'],
    }),
    f('patlasv4proto-ctos-valor', 'Valor', 'number', null, { size: 'small' }),
    f('patlasv4proto-ctos-criacao-em', 'Criação em', 'date', null, {
      size: 'small',
      readOnly: true,
    }),
    f('patlasv4proto-ctos-criacao-de', 'Criação de', 'reference', null, {
      linkedFormId: FORM_PESSOA,
      readOnly: true,
      options: ['Robson Silva Dolores Dias', 'Felipe Oliveira Costa'],
    }),
    f('patlasv4proto-ctos-atualizacao-em', 'Atualização em', 'date', null, {
      size: 'small',
      readOnly: true,
    }),
    f('patlasv4proto-ctos-atualizacao-de', 'Atualização de', 'reference', null, {
      linkedFormId: FORM_PESSOA,
      readOnly: true,
      options: ['Robson Silva Dolores Dias', 'Felipe Oliveira Costa'],
    }),
  ]

  const produtoFields = [
    f('patlasv4proto-ctpc-produto-oferta', 'Produto/Oferta', 'reference', null, {
      required: true,
      relevance: 'identity',
      options: [
        'CSPS - Plataforma de Simplificação',
        'Oferta PMC Cloud',
        'Licença Microsoft 365',
        'Suporte Premium',
      ],
    }),
    f('patlasv4proto-ctpc-numero', 'Número', 'text', null, { size: 'small' }),
    f('patlasv4proto-ctpc-empresa-cliente', 'Empresa/Cliente', 'reference', null, {
      linkedFormId: FORM_UO,
      options: [
        'Secretaria de Estado de Planejamento e Gestão',
        'Empresa Mato-grossense de Tecnologia da Informação',
        'EloGroup',
      ],
    }),
    f('patlasv4proto-ctpc-quantidade', 'Quantidade', 'number', null, {
      size: 'small',
      required: true,
    }),
  ]

  return [
    {
      id: FORM_OS_LINHA,
      name: 'CT — Ordem de Serviço',
      sectionLayout: 'none',
      metadata: 'Linha embutida — Ordens de serviço vinculadas ao contrato.',
      fields: osLineFields,
    },
    {
      id: FORM_PRODUTO,
      name: 'CT — Produto contratado',
      sectionLayout: 'none',
      metadata: 'Linha embutida — Produtos e ofertas contratados.',
      fields: produtoFields,
    },
  ]
}

function buildContratoForm() {
  return {
    id: FORM,
    name: 'Contrato',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Contrato. Aba Detalhes (Contrato, Financeiro, Renovação), Ordens de Serviço e Produtos contratados.',
    sections: [
      { id: SEC_DET, title: 'Detalhes', icon: 'description' },
      { id: SEC_CONTRATO, title: 'Contrato', icon: 'assignment', parentSectionId: SEC_DET },
      { id: SEC_FIN, title: 'Financeiro', icon: 'payments', parentSectionId: SEC_DET },
      { id: SEC_REN, title: 'Renovação', icon: 'autorenew', parentSectionId: SEC_DET },
      { id: SEC_OS, title: 'Ordem de Serviço', icon: 'build' },
      { id: SEC_PROD, title: 'Produtos contratados', icon: 'inventory_2' },
    ],
    fields: [
      // —— Detalhes > Contrato ——
      f('patlasv4proto-contrato-modelo', 'Modelo de contrato', 'textOptions', SEC_CONTRATO, {
        options: ['Padrão MTI', 'Simplificado', 'Parceiro', 'Cliente'],
      }),
      f('patlasv4proto-contrato-estado', 'Estado do contrato', 'textOptions', SEC_CONTRATO, {
        size: 'small',
        relevance: 'highlight',
        options: [
          'Aprovação',
          'Cancelado',
          'Elaboração',
          'Em revisão',
          'Emitido',
          'Paralisado',
          'Revisado',
          'Solicitação de Finalização',
          'Vigente',
        ],
      }),
      f('patlasv4proto-contrato-fornecedor', 'Fornecedor', 'reference', SEC_CONTRATO, {
        linkedFormId: FORM_UO,
        options: [
          'Empresa Mato-grossense de Tecnologia da Informação',
          'EloGroup',
          'Secretaria de Estado de Planejamento e Gestão',
        ],
      }),
      f('patlasv4proto-contrato-subestado', 'Subestado', 'textOptions', SEC_CONTRATO, {
        size: 'small',
        options: [
          'Aguardando análise',
          'Em elaboração',
          'Em aprovação',
          'Vigente',
          'Encerrado',
        ],
      }),
      f('patlasv4proto-contrato-numero', 'Número do contrato', 'text', SEC_CONTRATO, {
        required: true,
        relevance: 'identity',
        spec: 'Identificador único do contrato. Ex.: 163/2025/PMC.',
      }),
      f('patlasv4proto-contrato-administrador', 'Administrador de contrato', 'reference', SEC_CONTRATO, {
        linkedFormId: FORM_PESSOA,
        options: ['Lucas Santos', 'João Analista MTI'],
      }),
      f('patlasv4proto-contrato-nome', 'Nome', 'text', SEC_CONTRATO, {
        size: 'large',
        spec: 'Título ou denominação do contrato.',
      }),
      f('patlasv4proto-contrato-aprovador', 'Aprovador', 'reference', SEC_CONTRATO, {
        linkedFormId: FORM_PESSOA,
        options: ['Lucas Santos', 'Maria Consultora Parceira'],
      }),
      f('patlasv4proto-contrato-primario', 'Contrato primário', 'reference', SEC_CONTRATO, {
        linkedFormId: FORM,
        options: [CONTRATO_REF, '055/2023/SEPLAG'],
        spec: 'Contrato pai quando este for aditivo ou derivado.',
      }),
      f('patlasv4proto-contrato-responsavel-negocio', 'Responsável pelo negócio', 'reference', SEC_CONTRATO, {
        linkedFormId: FORM_PESSOA,
        options: ['Lucas Santos', 'Carlos Gestor Cliente'],
      }),
      f('patlasv4proto-contrato-data-inicio', 'Data de início', 'date', SEC_CONTRATO, { size: 'small' }),
      f('patlasv4proto-contrato-data-termino', 'Data de término', 'date', SEC_CONTRATO, { size: 'small' }),
      f('patlasv4proto-contrato-descricao', 'Descrição', 'text', SEC_CONTRATO, {
        size: 'large',
        textLong: true,
      }),

      // —— Detalhes > Financeiro ——
      f('patlasv4proto-contrato-termos-pagamento-faturas', 'Termos de pagamento das faturas', 'textOptions', SEC_FIN, {
        options: ['Net 30', 'Net 45', 'Net 60', 'À vista', 'Nenhum(a)'],
      }),
      f('patlasv4proto-contrato-conta-fornecedor', 'Conta do fornecedor', 'text', SEC_FIN, {
        spec: 'Conta bancária do fornecedor para pagamentos.',
      }),
      f('patlasv4proto-contrato-programacao-pagamento', 'Programação de pagamento', 'textOptions', SEC_FIN, {
        options: [
          'Diariamente',
          'Semanalmente',
          'A cada 2 semanas',
          'Mensalmente',
          'A cada 2 meses',
          'Trimestralmente',
          'Semestralmente',
          'Anualmente',
        ],
      }),
      f('patlasv4proto-contrato-numero-oc', 'Número da OC', 'text', SEC_FIN, {
        size: 'small',
        spec: 'Ordem de compra vinculada.',
      }),
      f('patlasv4proto-contrato-valor-pagamento', 'Valor de pagamento', 'number', SEC_FIN, {
        size: 'small',
        spec: 'Valor em BRL (R$).',
      }),
      f('patlasv4proto-contrato-centro-custos', 'Centro de custos', 'textOptions', SEC_FIN, {
        options: ['CC-001 — Projetos', 'CC-002 — Infraestrutura', 'CC-003 — Governança'],
      }),
      f('patlasv4proto-contrato-impostos-aplicaveis', 'Impostos aplicáveis', 'textOptions', SEC_FIN, {
        options: ['Nenhum(a)', 'Isento', 'Vendas'],
      }),
      f('patlasv4proto-contrato-tem-tabela-valores', 'Tem tabela de valores', 'boolean', SEC_FIN, {
        size: 'small',
      }),
      f('patlasv4proto-contrato-taxa-imposto-efetiva', 'Taxa de imposto efetiva', 'number', SEC_FIN, {
        size: 'small',
        spec: 'Percentual efetivo. Ex.: 7,75.',
      }),
      f('patlasv4proto-contrato-custo-imposto', 'Custo do imposto', 'number', SEC_FIN, {
        size: 'small',
        readOnly: true,
        spec: 'Calculado automaticamente. Valor em BRL (R$).',
      }),
      f('patlasv4proto-contrato-custo-total', 'Custo total', 'number', SEC_FIN, {
        size: 'small',
        readOnly: true,
        relevance: 'highlight',
        spec: 'Calculado automaticamente. Valor total em BRL (R$).',
      }),

      // —— Detalhes > Renovação ——
      f('patlasv4proto-contrato-renovar-automaticamente', 'Renovar automaticamente', 'boolean', SEC_REN, {
        size: 'small',
      }),
      f('patlasv4proto-contrato-renovacao-opcoes', 'Opções', 'textOptions', SEC_REN, {
        options: ['Nenhum(a)', '1 ano', '2 anos', '3 anos'],
      }),
      f('patlasv4proto-contrato-data-inicio-renovacao', 'Data de início da renovação', 'date', SEC_REN, {
        size: 'small',
      }),
      f('patlasv4proto-contrato-data-termino-renovacao', 'Data de término da renovação', 'date', SEC_REN, {
        size: 'small',
      }),
      f('patlasv4proto-contrato-tipo-ajuste-custo', 'Tipo de ajuste de custo', 'textOptions', SEC_REN, {
        options: ['Nenhum(a)', 'Fixo', 'Manual', 'CPI'],
      }),
      f('patlasv4proto-contrato-valor-ajuste-custo', 'Valor de ajuste de custo', 'number', SEC_REN, {
        size: 'small',
      }),
      f('patlasv4proto-contrato-percentual-ajuste-custo', 'Porcentagem de ajuste de custo', 'number', SEC_REN, {
        size: 'small',
        spec: 'Percentual de reajuste na renovação.',
      }),

      emb('patlasv4proto-contrato-ordens-servico', 'Ordens de Serviço', FORM_OS_LINHA, SEC_OS, {
        spec: 'OS vinculadas ao contrato. Colunas: Número, Tipo, Nome, início, Serviço, Departamento, Gerente, Valor, auditoria.',
      }),
      emb('patlasv4proto-contrato-produtos', 'Produtos contratados', FORM_PRODUTO, SEC_PROD, {
        spec: 'Produtos e ofertas do contrato com quantidade e empresa/cliente.',
      }),
    ],
    methods: [
      {
        id: 'patlasv4proto-contrato-meth-criar',
        name: 'Criar contrato',
        icon: 'add_box',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-contrato-meth-enviar-revisao',
        name: 'Enviar para Revisão',
        icon: 'send',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-contrato-meth-salvar',
        name: 'Salvar',
        icon: 'save',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-contrato-meth-cancelar',
        name: 'Cancelar',
        icon: 'cancel',
        kind: 'destaque',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-contrato-mti',
        name: 'Contrato PMC 163/2025',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-contrato-modelo': 'Padrão MTI',
          'patlasv4proto-contrato-estado': 'Vigente',
          'patlasv4proto-contrato-fornecedor':
            'Empresa Mato-grossense de Tecnologia da Informação',
          'patlasv4proto-contrato-subestado': 'Vigente',
          'patlasv4proto-contrato-numero': CONTRATO_REF,
          'patlasv4proto-contrato-administrador': 'Lucas Santos',
          'patlasv4proto-contrato-nome': 'Prestação de serviços de tecnologia — PMC',
          'patlasv4proto-contrato-aprovador': 'Lucas Santos',
          'patlasv4proto-contrato-responsavel-negocio': 'Carlos Gestor Cliente',
          'patlasv4proto-contrato-data-inicio': '01/01/2025',
          'patlasv4proto-contrato-data-termino': '31/12/2028',
          'patlasv4proto-contrato-descricao': 'Contrato de prestação de serviços de TI para PMC.',
          'patlasv4proto-contrato-programacao-pagamento': 'Mensalmente',
          'patlasv4proto-contrato-valor-pagamento': 0,
          'patlasv4proto-contrato-impostos-aplicaveis': 'Vendas',
          'patlasv4proto-contrato-tem-tabela-valores': true,
          'patlasv4proto-contrato-taxa-imposto-efetiva': 7.75,
          'patlasv4proto-contrato-custo-imposto': 0,
          'patlasv4proto-contrato-custo-total': 0,
          'patlasv4proto-contrato-renovar-automaticamente': true,
          'patlasv4proto-contrato-renovacao-opcoes': 'Nenhum(a)',
          'patlasv4proto-contrato-tipo-ajuste-custo': 'Nenhum(a)',
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-contrato-ordens-servico': [
            {
              'patlasv4proto-ctos-numero': 'ORSR0002026',
              'patlasv4proto-ctos-tipo': 'Cliente',
              'patlasv4proto-ctos-nome':
                'ORDEM DE SERVIÇO 00064/2026/CGTD/SEPLAG - Delivery - Integração Chatbot/Portal UNEMAT',
              'patlasv4proto-ctos-data-inicio': '17/06/2026',
              'patlasv4proto-ctos-servico': 'CSPS - Plataforma de Simplificação',
              'patlasv4proto-ctos-departamento':
                'UGGDI - UNIDADE DE GESTAO DE GOVERNANCA DIGITAL E INOVACAO',
              'patlasv4proto-ctos-gerente': 'Robson Silva Dolores Dias',
              'patlasv4proto-ctos-valor': 98918.4,
              'patlasv4proto-ctos-criacao-em': '10/06/2026',
              'patlasv4proto-ctos-criacao-de': 'Robson Silva Dolores Dias',
              'patlasv4proto-ctos-atualizacao-em': '17/06/2026',
              'patlasv4proto-ctos-atualizacao-de': 'Felipe Oliveira Costa',
            },
          ],
          'patlasv4proto-contrato-produtos': [
            {
              'patlasv4proto-ctpc-produto-oferta': 'CSPS - Plataforma de Simplificação',
              'patlasv4proto-ctpc-numero': '001',
              'patlasv4proto-ctpc-empresa-cliente': 'Secretaria de Estado de Planejamento e Gestão',
              'patlasv4proto-ctpc-quantidade': 1,
            },
            {
              'patlasv4proto-ctpc-produto-oferta': 'Suporte Premium',
              'patlasv4proto-ctpc-numero': '002',
              'patlasv4proto-ctpc-empresa-cliente': 'Secretaria de Estado de Planejamento e Gestão',
              'patlasv4proto-ctpc-quantidade': 120,
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-contrato-parceiro',
        name: 'Contrato Parceiro EloGroup',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-contrato-modelo': 'Parceiro',
          'patlasv4proto-contrato-estado': 'Vigente',
          'patlasv4proto-contrato-fornecedor': 'EloGroup',
          'patlasv4proto-contrato-subestado': 'Vigente',
          'patlasv4proto-contrato-numero': 'PAR-2024-001',
          'patlasv4proto-contrato-nome': 'Parceria comercial EloGroup',
          'patlasv4proto-contrato-data-inicio': '01/01/2024',
          'patlasv4proto-contrato-data-termino': '31/12/2025',
          'patlasv4proto-contrato-programacao-pagamento': 'Trimestralmente',
          'patlasv4proto-contrato-impostos-aplicaveis': 'Isento',
        },
        embeddedRowsByFieldId: {},
      },
      {
        id: 'patlasv4proto-p-contrato-cliente',
        name: 'Contrato Cliente SEPLAG',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-contrato-modelo': 'Cliente',
          'patlasv4proto-contrato-estado': 'Elaboração',
          'patlasv4proto-contrato-subestado': 'Em aprovação',
          'patlasv4proto-contrato-numero': '055/2023/SEPLAG',
          'patlasv4proto-contrato-nome': 'Contrato de licenciamento SEPLAG',
          'patlasv4proto-contrato-data-inicio': '01/03/2025',
          'patlasv4proto-contrato-data-termino': '28/02/2026',
        },
        embeddedRowsByFieldId: {},
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-contrato-mti',
  }
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = formDef
  else forms.push(formDef)
}

function updateClassGroups() {
  const groupsPath = path.join(
    __dirname,
    '../data/subprojects/atlas-v4/epics/atlas-prototipo/class-groups.json',
  )
  const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'))
  const ctGroup = 'grp-patlasv4-proto-ct-linhas'
  groups.assignments[FORM_OS_LINHA] = ctGroup
  groups.assignments[FORM_PRODUTO] = ctGroup
  const order = groups.memberOrderByGroup[ctGroup] ?? []
  for (const id of [FORM_OS_LINHA, FORM_PRODUTO]) {
    if (!order.includes(id)) order.push(id)
  }
  groups.memberOrderByGroup[ctGroup] = order
  fs.writeFileSync(groupsPath, `${JSON.stringify(groups, null, 2)}\n`, 'utf8')
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  for (const child of buildChildForms()) upsertForm(forms, child)
  upsertForm(forms, buildContratoForm())
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  updateClassGroups()
  console.log('✓ Contrato — abas: Detalhes, Ordem de Serviço, Produtos contratados')
  console.log('✓ Contrato — linhas embutidas CT — Ordem de Serviço e CT — Produto contratado')
}

main()
