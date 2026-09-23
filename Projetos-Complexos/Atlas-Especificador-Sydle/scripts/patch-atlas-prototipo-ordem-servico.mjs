#!/usr/bin/env node
/**
 * Ordem de Serviço — campos conforme tela de referência.
 * Uso: node scripts/patch-atlas-prototipo-ordem-servico.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM = 'form-patlasv4-proto-emissao-ordem-servico'
const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

const SEC_DET = 'sec-patlasv4proto-os-detalhes'
const SEC_ANOT = 'sec-patlasv4proto-os-anotacoes'

function f(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId: opts.sectionId ?? SEC_DET,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.textLong ? { textLong: true } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function buildOsForm() {
  return {
    id: FORM,
    name: 'Ordem de Serviço',
    sectionLayout: 'tabs',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Ordem de Serviço. Abas Detalhes (dados gerais, portfólio/programa) e Anotações (watch list e notas internas).',
    sections: [
      { id: SEC_DET, title: 'Detalhes', icon: 'description' },
      { id: SEC_ANOT, title: 'Anotações', icon: 'sticky_note_2' },
    ],
    fields: [
      // Coluna esquerda
      f('patlasv4proto-os-numero', 'Número', 'text', {
        readOnly: true,
        relevance: 'identity',
        size: 'small',
        spec: 'Gerado pelo sistema. Ex.: ORSR0002026.',
      }),
      f('patlasv4proto-os-primario', 'Primário', 'reference', {
        linkedFormId: FORM,
        options: ['ORSR0002026'],
        spec: 'OS primária quando esta for derivada ou vinculada.',
        hidden: true,
      }),
      f('patlasv4proto-os-tipo', 'Tipo OS', 'textOptions', {
        required: true,
        relevance: 'highlight',
        options: ['Cliente', 'Parceiro', 'MTI', 'Interno'],
      }),
      f('patlasv4proto-os-prioridade', 'Prioridade', 'textOptions', {
        size: 'small',
        options: [
          'Nenhum(a)',
          '1 - Crítico(a)',
          '2 - Alto(a)',
          '3 - Moderado(a)',
          '4 - Baixo(a)',
          '5 - Planejamento',
        ],
      }),
      f('patlasv4proto-os-estado', 'Estado', 'textOptions', {
        size: 'small',
        options: ['Aberto', 'Em Andamento', 'Paralisado', 'Concluído', 'Cancelado'],
      }),
      f('patlasv4proto-os-data-inicio-planejada', 'Data de início planejada', 'date', {
        size: 'small',
      }),
      f('patlasv4proto-os-prazo-requested-by', 'Prazo(requested_by)', 'date', {
        size: 'small',
        spec: 'Prazo solicitado pelo demandante.',
      }),

      // Coluna direita
      f('patlasv4proto-os-contrato', 'Contrato', 'reference', {
        linkedFormId: FORM_CONTRATO,
        options: ['076/2025/SEPLAG', '163/2025/PMC'],
      }),
      f('patlasv4proto-os-servico', 'Serviço', 'reference', {
        options: [
          'CSPS - Plataforma de Simplificação',
          'Desenvolvimento de software',
          'Suporte técnico',
        ],
        spec: 'Catálogo de serviços vinculado ao contrato.',
      }),
      f('patlasv4proto-os-departamento', 'Departamento', 'reference', {
        linkedFormId: FORM_UO,
        options: ['UGGDI - UNIDADE DE GESTAO DE GOVERNANCA DIGITAL E INOVACAO'],
      }),
      f('patlasv4proto-os-gerente-demandas', 'Gerente de demandas', 'reference', {
        linkedFormId: FORM_PESSOA,
        options: ['Robson Silva Dolores Dias', 'Lucas Santos'],
      }),
      f('patlasv4proto-os-valor', 'Valor R$', 'number', {
        size: 'small',
        spec: 'Valor total da OS em reais.',
      }),

      // Portfólio / Programa / Objetivo (layout SN: Portfólio + Programa à esquerda, Objetivo à direita)
      f('patlasv4proto-os-portfolio', 'Portfólio', 'reference', {
        options: [
          'Portfólio Digital de Governo',
          'Portfólio Infraestrutura e Nuvem',
          'Portfólio Relacionamento com o Cliente',
        ],
        spec: 'Portfólio de demandas (lookup). Filtra programas disponíveis.',
      }),
      f('patlasv4proto-os-objetivo-primario', 'Objetivo primário', 'reference', {
        options: [
          'Ampliar capacidade de atendimento digital',
          'Integrar sistemas legados ao ecossistema MTI',
          'Reduzir tempo de resposta ao cidadão',
        ],
        spec: 'Objetivo estratégico primário vinculado à demanda.',
      }),
      f('patlasv4proto-os-programa', 'Programa', 'reference', {
        options: [
          'Programa Simplifica MT',
          'Programa CGTD — Centro de Gestão de Tecnologia Digital',
          'Programa Integração de Dados',
        ],
        spec: 'Programa dentro do portfólio selecionado.',
      }),

      // Largura total
      f('patlasv4proto-os-nome', 'Nome', 'text', {
        required: true,
        size: 'large',
        relevance: 'highlight',
        spec: 'Título completo da ordem de serviço.',
      }),
      f('patlasv4proto-os-descricao', 'Descrição', 'text', {
        required: true,
        size: 'large',
        textLong: true,
        spec: 'Escopo e entregas da ordem de serviço (texto rico).',
      }),

      // Aba Anotações
      f('patlasv4proto-os-watch-list', 'Participantes da lista de observação', 'reference', {
        sectionId: SEC_ANOT,
        multiple: true,
        linkedFormId: FORM_PESSOA,
        options: ['Robson Silva Dolores Dias', 'Felipe Oliveira Costa', 'Lucas Santos'],
        spec: 'Usuários notificados sobre atualizações desta OS (watch list).',
      }),
      f('patlasv4proto-os-work-notes-list', 'Lista de anotações de trabalho', 'reference', {
        sectionId: SEC_ANOT,
        multiple: true,
        linkedFormId: FORM_PESSOA,
        options: ['Robson Silva Dolores Dias', 'Felipe Oliveira Costa'],
        spec: 'Usuários com visibilidade das anotações de trabalho internas.',
      }),
      f('patlasv4proto-os-work-notes', 'Anotações de trabalho', 'text', {
        sectionId: SEC_ANOT,
        size: 'large',
        textLong: true,
        spec: 'Notas internas visíveis apenas à equipe de atendimento (work notes). Não expostas ao solicitante.',
      }),
    ],
    methods: [
      {
        id: 'patlasv4proto-os-meth-atualizar',
        name: 'Atualizar',
        icon: 'refresh',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-salvar',
        name: 'Salvar',
        icon: 'save',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-examinar',
        name: 'Examinar',
        icon: 'search',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-qualificar',
        name: 'Qualificar',
        icon: 'fact_check',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-adiar',
        name: 'Adiar',
        icon: 'schedule',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-redefinir-rascunho',
        name: 'Redefinir para rascunho',
        icon: 'edit_note',
        kind: 'destaque',
      },
      {
        id: 'patlasv4proto-os-meth-excluir',
        name: 'Excluir',
        icon: 'delete',
        kind: 'destaque',
      },
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-emissao-de-ordem-de-servico-mti',
        name: 'OS SEPLAG 00064/2026',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-os-numero': 'ORSR0002026',
          'patlasv4proto-os-tipo': 'Cliente',
          'patlasv4proto-os-prioridade': '3 - Moderado(a)',
          'patlasv4proto-os-estado': 'Aberto',
          'patlasv4proto-os-data-inicio-planejada': '17/06/2026',
          'patlasv4proto-os-prazo-requested-by': '17/07/2026',
          'patlasv4proto-os-contrato': '076/2025/SEPLAG',
          'patlasv4proto-os-servico': 'CSPS - Plataforma de Simplificação',
          'patlasv4proto-os-departamento':
            'UGGDI - UNIDADE DE GESTAO DE GOVERNANCA DIGITAL E INOVACAO',
          'patlasv4proto-os-gerente-demandas': 'Robson Silva Dolores Dias',
          'patlasv4proto-os-valor': 98918.4,
          'patlasv4proto-os-portfolio': 'Portfólio Digital de Governo',
          'patlasv4proto-os-programa': 'Programa CGTD — Centro de Gestão de Tecnologia Digital',
          'patlasv4proto-os-objetivo-primario': 'Integrar sistemas legados ao ecossistema MTI',
          'patlasv4proto-os-watch-list': 'Robson Silva Dolores Dias, Felipe Oliveira Costa',
          'patlasv4proto-os-work-notes-list': 'Robson Silva Dolores Dias',
          'patlasv4proto-os-work-notes':
            'Demanda priorizada pelo CGTD. Aguardando definição de ambiente de homologação.',
          'patlasv4proto-os-nome':
            'ORDEM DE SERVIÇO 00064/2026/CGTD/SEPLAG - Delivery - Integração entre a Base de conhecimento do Chatbot e os dados que alimentam o Portal da UNEMAT.',
          'patlasv4proto-os-descricao':
            '- Realizar diagnóstico sobre as categorias de informações e documentos a serem importados;\n- Desenvolver fluxo do processo para integração dos sistemas;\n- Desenvolver formulários e conexões do serviço de forma a viabilizar a integração entre os sistemas;',
        },
      },
      {
        id: 'patlasv4proto-p-emissao-de-ordem-de-servico-parceiro',
        name: 'Exemplo Parceiro',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-os-numero': 'ORSR0002027',
          'patlasv4proto-os-tipo': 'Parceiro',
          'patlasv4proto-os-prioridade': '2 - Alto(a)',
          'patlasv4proto-os-estado': 'Aberto',
          'patlasv4proto-os-contrato': '163/2025/PMC',
          'patlasv4proto-os-servico': 'Desenvolvimento de software',
          'patlasv4proto-os-gerente-demandas': 'Lucas Santos',
          'patlasv4proto-os-nome': 'ORDEM DE SERVIÇO — Parceiro EloGroup',
        },
      },
      {
        id: 'patlasv4proto-p-emissao-de-ordem-de-servico-cliente',
        name: 'Exemplo Cliente',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-os-numero': 'ORSR0002028',
          'patlasv4proto-os-tipo': 'Cliente',
          'patlasv4proto-os-prioridade': '4 - Baixo(a)',
          'patlasv4proto-os-estado': 'Em Andamento',
          'patlasv4proto-os-contrato': '076/2025/SEPLAG',
          'patlasv4proto-os-nome': 'ORDEM DE SERVIÇO — Suporte SEPLAG',
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-emissao-de-ordem-de-servico-mti',
  }
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const idx = forms.findIndex((x) => x.id === FORM)
  if (idx < 0) {
    console.error('Formulário Ordem de Serviço não encontrado')
    process.exit(1)
  }
  forms[idx] = buildOsForm()
  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ Ordem de Serviço — abas Detalhes e Anotações')
  console.log('✓ Campos: Portfólio, Programa, Objetivo primário, watch list e anotações de trabalho')
}

main()
