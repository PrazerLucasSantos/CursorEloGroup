#!/usr/bin/env node
/**
 * Ajusta classes Contrato, Ordem de Serviço e Projeto:
 * - campos citados nas fontes (Granola/Luis F3) → mantêm label
 * - campos existentes fora das fontes → prefixo "validar · "
 * - campos faltantes citados → adiciona com prefixo "add · "
 * - métodos: mesma regra
 *
 * Uso: node scripts/patch-contrato-os-projeto-validar-add-21-09.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const CTR = 'form-patlasv4-proto-contrato'
const OS = 'form-patlasv4-proto-emissao-ordem-servico'
const PRJ = 'form-patlasv4-proto-projeto'

function stripPrefix(label) {
  return String(label || '')
    .replace(/^validar\s*[·•\-–:]?\s*/i, '')
    .replace(/^add\s*[·•\-–:]?\s*/i, '')
    .trim()
}

function setLabel(field, kind, baseLabel) {
  const base = stripPrefix(baseLabel || field.label)
  if (kind === 'keep') field.label = base
  else if (kind === 'validar') field.label = `validar · ${base}`
  else if (kind === 'add') field.label = `add · ${base}`
}

function setMethodName(m, kind, baseName) {
  const base = stripPrefix(baseName || m.name)
  if (kind === 'keep') m.name = base
  else if (kind === 'validar') m.name = `validar · ${base}`
  else if (kind === 'add') m.name = `add · ${base}`
}

function upsertField(form, field) {
  if (!form.fields) form.fields = []
  const i = form.fields.findIndex((f) => f.id === field.id)
  if (i >= 0) {
    form.fields[i] = { ...form.fields[i], ...field, label: field.label }
  } else {
    form.fields.push(field)
  }
}

function upsertMethod(form, method) {
  if (!form.methods) form.methods = []
  const i = form.methods.findIndex((m) => m.id === method.id)
  if (i >= 0) form.methods[i] = { ...form.methods[i], ...method }
  else form.methods.push(method)
}

function upsertSection(form, section) {
  if (!form.sections) form.sections = []
  const i = form.sections.findIndex((s) => s.id === section.id)
  if (i >= 0) form.sections[i] = { ...form.sections[i], ...section }
  else form.sections.push(section)
}

/** Contrato — citados nas fontes F3 (Luis/Granola + demc-ctr). */
const CTR_KEEP = new Set([
  'patlasv4proto-contrato-numero',
  'patlasv4proto-contrato-nome',
  'patlasv4proto-contrato-estado',
  'patlasv4proto-contrato-cliente',
  'patlasv4proto-contrato-parceiro',
  'patlasv4proto-contrato-data-inicio',
  'patlasv4proto-contrato-data-termino',
  'patlasv4proto-contrato-descricao',
  'patlasv4proto-contrato-ordens-servico',
  'patlasv4proto-contrato-produtos',
  'patlasv4proto-contrato-parceiros',
  'patlasv4proto-contrato-parceiros-alerta',
])

const CTR_METHODS_KEEP = new Set([
  'patlasv4proto-contrato-meth-criar',
  'patlasv4proto-shared-meth-enviar-assinatura',
])

/** OS — citados. */
const OS_KEEP = new Set([
  'patlasv4proto-os-numero',
  'patlasv4proto-os-tipo',
  'patlasv4proto-os-estado',
  'patlasv4proto-os-data-inicio-planejada',
  'patlasv4proto-os-contrato',
  'patlasv4proto-os-servico',
  'patlasv4proto-os-nome',
  'patlasv4proto-os-descricao',
  'patlasv4proto-os-valor',
])

const OS_METHODS_KEEP = new Set([
  'patlasv4proto-os-meth-criar',
  'patlasv4proto-shared-meth-enviar-assinatura',
])

/** Projeto — citados (homologação + vínculo + SN mínimo). */
const PRJ_KEEP = new Set([
  'patlasv4proto-projeto-nome',
  'patlasv4proto-projeto-os',
  'patlasv4proto-projeto-contrato',
  'patlasv4proto-projeto-responsavel',
  'patlasv4proto-projeto-status-geral',
  'patlasv4proto-projeto-data-prevista',
  'patlasv4proto-projeto-data-real',
  'patlasv4proto-projeto-hom-alerta',
  'patlasv4proto-projeto-hom-necessaria',
  'patlasv4proto-projeto-hom-status',
  'patlasv4proto-projeto-hom-responsavel',
  'patlasv4proto-projeto-hom-documento',
  'patlasv4proto-projeto-hom-data',
  'patlasv4proto-projeto-hom-justificativa',
  'patlasv4proto-projeto-raer-alerta',
  'patlasv4proto-projeto-raer-necessario',
  'patlasv4proto-projeto-raer-status',
  'patlasv4proto-projeto-raer-documento',
])

const PRJ_METHODS_KEEP = new Set([
  'patlasv4proto-shared-meth-enviar-assinatura',
  'patlasv4proto-projeto-meth-gerar-raer',
])

function patchContrato(form) {
  upsertSection(form, {
    id: 'sec-patlasv4proto-contrato-consumo-f3',
    title: 'Consumo F3 · saldo e saúde',
    icon: 'monitoring',
  })
  upsertSection(form, {
    id: 'sec-patlasv4proto-contrato-eventos-f3',
    title: 'Eventos / log F3',
    icon: 'history',
  })

  for (const field of form.fields || []) {
    if (CTR_KEEP.has(field.id)) setLabel(field, 'keep')
    else setLabel(field, 'validar')
  }

  // Tipo OS nas opções embutidas não se aplica aqui

  const adds = [
    {
      id: 'patlasv4proto-contrato-natureza',
      label: 'add · Natureza do contrato',
      type: 'textOptions',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'highlight',
      required: false,
      options: ['Próprio do cliente', 'Patrocinado (gestão)', 'Sem contrato'],
      spec: 'Fontes Luis: natureza imutável (serviço ≠ licenciamento/SN).',
    },
    {
      id: 'patlasv4proto-contrato-valor-global',
      label: 'add · Valor global',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
      spec: 'Valor contratado global (#03 faturar = contrato+saldo).',
    },
    {
      id: 'patlasv4proto-contrato-saldo-global',
      label: 'add · Saldo global',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'highlight',
      spec: 'Saldo exibido na demanda · condição de faturamento.',
    },
    {
      id: 'patlasv4proto-contrato-os-abertas',
      label: 'add · OS abertas',
      type: 'text',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
      spec: 'KPI citado: OS abertas / S aberto.',
    },
    {
      id: 'patlasv4proto-contrato-provisionado',
      label: 'add · Total provisionado',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-contrato-consumo',
      label: 'add · Consumo até o momento',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-contrato-pct-execucao',
      label: 'add · % execução contratual',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-contrato-execucao-acumulada',
      label: 'add · Execução acumulada / continuada',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-contrato-saude',
      label: 'add · Saúde do contrato',
      type: 'textOptions',
      size: 'small',
      sectionId: 'sec-patlasv4proto-contrato-consumo-f3',
      relevance: 'highlight',
      options: ['Saudável', 'Atenção', 'Crítico', 'Déficit projetado ≤25%', 'Crítico >25%'],
      spec: 'Saúde baseada nas OS · déficit projetado até 25% coberto; acima = crítico.',
    },
    {
      id: 'patlasv4proto-contrato-cat-versao',
      label: 'add · Versão do catálogo (vigente no contrato)',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'common',
      spec: 'Só versões homologadas no contrato podem ser consumidas.',
    },
    {
      id: 'patlasv4proto-contrato-objeto-n2',
      label: 'add · Objeto N2 do contrato',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'common',
      spec: 'N2 catálogo (não confundir com N2 gestor/fiscal da demanda).',
    },
    {
      id: 'patlasv4proto-contrato-patrocinador',
      label: 'add · Contrato patrocinador',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'common',
      linkedFormId: 'form-patlasv4-proto-contrato',
      spec: 'Natureza patrocinada · vínculo ao contrato do patrocinador.',
    },
    {
      id: 'patlasv4proto-contrato-org-patrocinadora',
      label: 'add · Organização patrocinadora',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-contrato-autorizacao-patrocinio',
      label: 'add · Autorização do patrocinador',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-contrato-sec-contrato',
      relevance: 'common',
      spec: 'Registro pós-qualificação (rito portal patrocinador ainda aberto).',
    },
    {
      id: 'patlasv4proto-contrato-eventos-log',
      label: 'add · Eventos do contrato (CCB · aditivo · vigência · cobrança)',
      type: 'text',
      size: 'large',
      sectionId: 'sec-patlasv4proto-contrato-eventos-f3',
      relevance: 'common',
      spec: 'Qualquer alteração gera log (fontes).',
    },
  ]

  for (const a of adds) {
    if ((form.fields || []).some((f) => f.id === a.id)) {
      const existing = form.fields.find((f) => f.id === a.id)
      setLabel(existing, 'add', stripPrefix(a.label).replace(/^add\s*[·•]?\s*/i, ''))
    } else {
      upsertField(form, {
        readOnly: false,
        required: false,
        multiple: false,
        ...a,
      })
    }
  }

  for (const m of form.methods || []) {
    if (CTR_METHODS_KEEP.has(m.id)) setMethodName(m, 'keep')
    else setMethodName(m, 'validar')
  }

  upsertMethod(form, {
    id: 'patlasv4proto-contrato-meth-registrar-aditivo',
    name: 'add · Registrar aditivo / evento',
    icon: 'history_edu',
    kind: 'menu',
    spec: 'Log de aditivo · CCB · pedido formal (fontes F3).',
  })
  upsertMethod(form, {
    id: 'patlasv4proto-contrato-meth-recalcular-saude',
    name: 'add · Recalcular saúde / saldo',
    icon: 'monitoring',
    kind: 'menu',
    spec: 'Atualiza KPIs de saldo · provisionado · consumo · saúde.',
  })

  form.metadata =
    (form.metadata || '') +
    ' · Campos F3 21/09: citados mantidos; extras «validar ·»; novos «add ·» (natureza, saldo, saúde, catálogo, patrocínio, eventos).'
}

function patchOs(form) {
  upsertSection(form, {
    id: 'sec-patlasv4proto-os-consumo-f3',
    title: 'Consumo F3 · saldo e execução',
    icon: 'monitoring',
  })
  upsertSection(form, {
    id: 'sec-patlasv4proto-os-sn-f3',
    title: 'ServiceNow / autorização',
    icon: 'cloud_sync',
  })
  upsertSection(form, {
    id: 'sec-patlasv4proto-os-eventos-f3',
    title: 'Eventos · sprints · aditivos',
    icon: 'event',
  })

  for (const field of form.fields || []) {
    if (OS_KEEP.has(field.id)) {
      setLabel(field, 'keep')
      if (field.id === 'patlasv4proto-os-tipo') {
        field.options = ['Global', 'Dedicada']
        field.spec =
          'OS Global (guarda-chuva · consumos parciais) × Dedicada (escopo da demanda). Fontes Luis #14.'
        field.relevance = 'highlight'
        field.label = 'Tipo OS (Global × Dedicada)'
      }
      if (field.id === 'patlasv4proto-os-data-inicio-planejada') {
        field.spec = (field.spec || '') + ' · Vigência OS ≤ vigência do contrato.'
      }
    } else {
      setLabel(field, 'validar')
    }
  }

  const adds = [
    {
      id: 'patlasv4proto-os-vig-fim',
      label: 'add · Vigência · fim',
      type: 'date',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'highlight',
      spec: 'Fim da OS não pode ultrapassar fim do contrato.',
    },
    {
      id: 'patlasv4proto-os-demanda',
      label: 'add · Demanda vinculada',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-orcamento',
      label: 'add · Orçamento vinculado',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-projeto',
      label: 'add · Projeto vinculado',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      linkedFormId: 'form-patlasv4-proto-projeto',
      relevance: 'common',
      spec: 'Serviço avulso OK sem projeto; com projeto → integração SN.',
    },
    {
      id: 'patlasv4proto-os-saldo',
      label: 'add · Saldo da OS',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'highlight',
    },
    {
      id: 'patlasv4proto-os-consumo',
      label: 'add · Consumo da OS',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-provisionado',
      label: 'add · Provisionado',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-saude',
      label: 'add · Saúde da OS',
      type: 'textOptions',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'highlight',
      options: ['Saudável', 'Atenção', 'Crítico'],
      spec: 'Saúde da OS distinta da saúde do contrato (OS nova).',
    },
    {
      id: 'patlasv4proto-os-assina-gerente-op',
      label: 'add · Assinatura · gerente de operação',
      type: 'boolean',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-sn-f3',
      relevance: 'highlight',
      spec: 'Caminho orçamento · E45.',
    },
    {
      id: 'patlasv4proto-os-execucao-autorizada',
      label: 'add · Autorização de execução',
      type: 'boolean',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-sn-f3',
      relevance: 'highlight',
    },
    {
      id: 'patlasv4proto-os-sn-status',
      label: 'add · ServiceNow',
      type: 'textOptions',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-sn-f3',
      relevance: 'highlight',
      options: [
        'Não enviado',
        'Enviado · aprovada e em atendimento',
        'Erro integração',
        'Encerrado',
      ],
    },
    {
      id: 'patlasv4proto-os-executor',
      label: 'add · Executor',
      type: 'textOptions',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-sn-f3',
      relevance: 'common',
      options: ['MTI', 'Parceiro'],
      spec: 'Campo SN de entrega (fontes).',
    },
    {
      id: 'patlasv4proto-os-epico',
      label: 'add · Épico (SN)',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-sn-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-sprint-datas',
      label: 'add · Datas de sprint',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-os-eventos-f3',
      relevance: 'common',
      spec: 'Sprints = compromisso de prazo · eventos de log na OS.',
    },
    {
      id: 'patlasv4proto-os-eventos',
      label: 'add · Eventos e aditivos da OS',
      type: 'text',
      size: 'large',
      sectionId: 'sec-patlasv4proto-os-eventos-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-os-qtd-autorizada',
      label: 'add · Quantidade autorizada',
      type: 'text',
      size: 'small',
      sectionId: 'sec-patlasv4proto-os-consumo-f3',
      relevance: 'common',
    },
  ]

  for (const a of adds) {
    if ((form.fields || []).some((f) => f.id === a.id)) {
      const existing = form.fields.find((f) => f.id === a.id)
      setLabel(existing, 'add', stripPrefix(a.label).replace(/^add\s*[·•]?\s*/i, ''))
    } else {
      upsertField(form, {
        readOnly: false,
        required: false,
        multiple: false,
        ...a,
      })
    }
  }

  for (const m of form.methods || []) {
    if (OS_METHODS_KEEP.has(m.id)) setMethodName(m, 'keep')
    else setMethodName(m, 'validar')
  }

  const methodAdds = [
    {
      id: 'patlasv4proto-os-meth-assinar-gerente',
      name: 'add · Assinar (gerente de operação)',
      icon: 'draw',
      kind: 'destaque',
      spec: 'Assinatura OS caminho orçamento.',
    },
    {
      id: 'patlasv4proto-os-meth-autorizar-sn',
      name: 'add · Autorizar execução → ServiceNow',
      icon: 'cloud_upload',
      kind: 'destaque',
      spec: 'Após quantitativos OK · status SN.',
    },
    {
      id: 'patlasv4proto-os-meth-consumo',
      name: 'add · Registrar consumo / saldo',
      icon: 'payments',
      kind: 'menu',
    },
    {
      id: 'patlasv4proto-os-meth-dilatar',
      name: 'add · Registrar dilatação de prazo',
      icon: 'schedule',
      kind: 'menu',
      spec: 'ACK tripartite · log na OS.',
    },
    {
      id: 'patlasv4proto-os-meth-complementar',
      name: 'add · Complementar / substituir OS',
      icon: 'swap_horiz',
      kind: 'menu',
      spec: 'Escopo fino = nova demanda nesta fase; complementar com ateste.',
    },
  ]
  for (const m of methodAdds) upsertMethod(form, m)

  form.metadata =
    (form.metadata || '') +
    ' · Campos F3 21/09: Tipo=Global×Dedicada; extras «validar ·»; novos «add ·» (saldo, SN, sprints, demanda).'
}

function patchProjeto(form) {
  upsertSection(form, {
    id: 'sec-patlasv4proto-projeto-sn-f3',
    title: 'ServiceNow · entrega',
    icon: 'cloud_sync',
  })

  for (const field of form.fields || []) {
    if (PRJ_KEEP.has(field.id)) setLabel(field, 'keep')
    else setLabel(field, 'validar')
  }

  // processo vinculado e indicadores RAER embutidos → validar (já no loop se não keep)
  // raer-indicadores / entregas / planos: fontes não detalharam → validar
  for (const id of [
    'patlasv4proto-projeto-raer-indicadores',
    'patlasv4proto-projeto-raer-entregas',
    'patlasv4proto-projeto-raer-planos',
    'patlasv4proto-projeto-processo',
  ]) {
    const f = (form.fields || []).find((x) => x.id === id)
    if (f) setLabel(f, 'validar')
  }

  const adds = [
    {
      id: 'patlasv4proto-projeto-demanda',
      label: 'add · Demanda vinculada',
      type: 'reference',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-projeto-vinculos',
      linkedFormId: 'form-patlasv4-proto-demanda-completa',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-projeto-descricao',
      label: 'add · Descrição',
      type: 'text',
      size: 'large',
      sectionId: 'sec-patlasv4proto-projeto-vinculos',
      relevance: 'common',
      spec: 'Campo SN de entrega.',
    },
    {
      id: 'patlasv4proto-projeto-epico',
      label: 'add · Épico',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-projeto-sn-f3',
      relevance: 'common',
      spec: 'Pacote SN: épico · descrição · projeto · status OS · executor · datas sprint.',
    },
    {
      id: 'patlasv4proto-projeto-executor',
      label: 'add · Executor',
      type: 'textOptions',
      size: 'small',
      sectionId: 'sec-patlasv4proto-projeto-sn-f3',
      options: ['MTI', 'Parceiro'],
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-projeto-status-os',
      label: 'add · Status da OS (espelho SN)',
      type: 'text',
      size: 'small',
      sectionId: 'sec-patlasv4proto-projeto-sn-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-projeto-sprint-datas',
      label: 'add · Datas de sprint',
      type: 'text',
      size: 'medium',
      sectionId: 'sec-patlasv4proto-projeto-sn-f3',
      relevance: 'common',
    },
    {
      id: 'patlasv4proto-projeto-sn-progresso',
      label: 'add · Progresso SN (0–100%)',
      type: 'number',
      size: 'small',
      sectionId: 'sec-patlasv4proto-projeto-sn-f3',
      relevance: 'common',
      spec: 'Atividades SN alimentam termo de homologação.',
    },
  ]

  for (const a of adds) {
    if ((form.fields || []).some((f) => f.id === a.id)) {
      const existing = form.fields.find((f) => f.id === a.id)
      setLabel(existing, 'add', stripPrefix(a.label).replace(/^add\s*[·•]?\s*/i, ''))
    } else {
      upsertField(form, {
        readOnly: false,
        required: false,
        multiple: false,
        ...a,
      })
    }
  }

  for (const m of form.methods || []) {
    if (PRJ_METHODS_KEEP.has(m.id)) setMethodName(m, 'keep')
    else setMethodName(m, 'validar')
  }

  upsertMethod(form, {
    id: 'patlasv4proto-projeto-meth-enviar-homologacao',
    name: 'add · Enviar termo de homologação',
    icon: 'verified',
    kind: 'destaque',
    spec: 'Pós-entrega · MTI envia ao cliente · 3 assinaturas L3.',
  })
  upsertMethod(form, {
    id: 'patlasv4proto-projeto-meth-sync-sn',
    name: 'add · Sincronizar progresso ServiceNow',
    icon: 'cloud_sync',
    kind: 'menu',
    spec: 'Consome API Atlas · atualiza 0–100% e termo.',
  })

  form.metadata =
    (form.metadata || '') +
    ' · Campos F3 21/09: homologação/RAER citados mantidos; processo/indicadores RAER «validar ·»; SN «add ·».'
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
  const ctr = forms.find((f) => f.id === CTR)
  const os = forms.find((f) => f.id === OS)
  const prj = forms.find((f) => f.id === PRJ)
  if (!ctr || !os || !prj) throw new Error('Forms Contrato/OS/Projeto não encontrados')

  patchContrato(ctr)
  patchOs(os)
  patchProjeto(prj)

  fs.writeFileSync(FORMS, JSON.stringify(forms, null, 2) + '\n')

  const summary = (f) => {
    const labels = (f.fields || []).map((x) => x.label)
    const keep = labels.filter((l) => !/^validar/i.test(l) && !/^add/i.test(l)).length
    const val = labels.filter((l) => /^validar/i.test(l)).length
    const add = labels.filter((l) => /^add/i.test(l)).length
    const meth = (f.methods || []).map((m) => m.name)
    const mk = meth.filter((l) => !/^validar/i.test(l) && !/^add/i.test(l)).length
    const mv = meth.filter((l) => /^validar/i.test(l)).length
    const ma = meth.filter((l) => /^add/i.test(l)).length
    return `${f.name}: campos keep=${keep} validar=${val} add=${add} · métodos keep=${mk} validar=${mv} add=${ma}`
  }
  console.log('OK')
  console.log(summary(ctr))
  console.log(summary(os))
  console.log(summary(prj))
}

main()
