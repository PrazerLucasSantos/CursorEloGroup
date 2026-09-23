#!/usr/bin/env node
/**
 * Smoke sem import TS: valida mapa methodId→ação e cobertura demc/demcli/dempar.
 * Uso: node scripts/smoke-demanda-metodos-status.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const forms = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json'),
    'utf8',
  ),
)

const MAP = {
  'ver-andamento': 'ver_andamento',
  'pre-analise': 'iniciar_analise',
  qualificar: 'qualificar',
  'iniciar-analise': 'iniciar_analise',
  'via-contrato': 'via_contrato',
  'assinar-atendimento': 'assinar_atendimento',
  orcamento: 'enviar_orcamento',
  'enviar-proposta-orcamento': 'enviar_proposta_orcamento',
  'assinar-orcamento': 'assinar_orcamento',
  'devolver-orcamento': 'devolver_orcamento_ajuste',
  'aceitar-orcamento': 'aceitar_orcamento',
  'recusar-orcamento': 'recusar_orcamento',
  'parceiro-iniciar': 'parceiro_iniciar',
  'parceiro-declarar': 'parceiro_declarar',
  'validar-parceiro': 'validar_parceiro',
  'autorizar-sn': 'autorizar_servicenow',
  'encerrar-termo': 'encerrar_termo_raer',
  'ajuste-termo': 'solicitar_ajuste_termo',
  devolver: 'devolver_correcao',
  recusar: 'recusar',
  'sem-cobertura': 'sem_cobertura',
  'conferir-quantitativos': 'conferir_quantitativos',
  'devolver-quantitativos': 'devolver_quantitativos',
  'assinar-os': 'assinar_os_orcamento',
  dilacao: 'solicitar_dilacao',
  'aceitar-dilacao': 'aceitar_dilacao',
  'recusar-dilacao': 'recusar_dilacao',
  'mti-executar': 'mti_executar_declarar',
  'recusar-termo': 'recusar_termo',
  'regenerar-termo': 'regenerar_termo',
  'restituir-n2': 'restituir_n2',
  'cadastrar-cargos': 'cadastrar_cargos',
  reaproveitar: 'reaproveitar_como_nova',
  'autorizacao-patrocinio': 'registrar_autorizacao_patrocinio',
  'definir-pagamento': 'definir_pagamento',
  'aprovar-n2': 'aprovar_gestor',
  'devolver-n2': 'devolver_gestor',
  'recusar-n2': 'recusar_gestor',
  'assinar-homologacao': 'assinar_homologacao',
  'ajustar-enviar': 'ajustar_enviar',
}

function strip(id) {
  return id
    .replace(/^method-demc-/, '')
    .replace(/^method-demanda-/, '')
    .replace(/^method-demcli-/, '')
    .replace(/^method-dempar-/, '')
}

const MTI_REQUIRED = [
  'iniciar_analise',
  'qualificar',
  'via_contrato',
  'enviar_orcamento',
  'sem_cobertura',
  'devolver_correcao',
  'recusar',
  'registrar_autorizacao_patrocinio',
  'validar_parceiro',
  'solicitar_ajuste_termo',
  'recusar_termo',
  'assinar_os_orcamento',
  'conferir_quantitativos',
  'devolver_quantitativos',
  'autorizar_servicenow',
  'mti_executar_declarar',
  'solicitar_dilacao',
  'encerrar_termo_raer',
  'enviar_proposta_orcamento',
  'assinar_orcamento',
  'aceitar_dilacao',
  'recusar_dilacao',
  'cadastrar_cargos',
  'reaproveitar_como_nova',
  'regenerar_termo',
]

const CLI_REQUIRED = [
  'aprovar_gestor',
  'devolver_gestor',
  'recusar_gestor',
  'assinar_atendimento',
  'aceitar_orcamento',
  'recusar_orcamento',
  'devolver_orcamento_ajuste',
  'assinar_homologacao',
  'definir_pagamento',
  'ajustar_enviar',
  'restituir_n2',
  'reaproveitar_como_nova',
  'solicitar_ajuste_termo',
  'recusar_termo',
  'solicitar_dilacao',
  'aceitar_dilacao',
  'recusar_dilacao',
  'cadastrar_cargos',
]

const PAR_REQUIRED = [
  'via_contrato',
  'enviar_orcamento',
  'devolver_correcao',
  'recusar',
  'parceiro_iniciar',
  'parceiro_declarar',
  'enviar_proposta_orcamento',
  'assinar_orcamento',
  'devolver_orcamento_ajuste',
  'solicitar_dilacao',
  'aceitar_dilacao',
  'recusar_dilacao',
]

let fail = 0

function checkForm(formId, required) {
  const form = forms.find((f) => f.id === formId)
  if (!form) {
    console.error('MISSING FORM', formId)
    fail++
    return
  }
  const mapped = new Set()
  for (const m of form.methods ?? []) {
    const acao = MAP[strip(m.id)]
    if (!acao) {
      console.error('SEM MAPA', formId, m.id)
      fail++
      continue
    }
    mapped.add(acao)
  }
  for (const a of required) {
    if (!mapped.has(a)) {
      console.error(`FALTA método p/ ação «${a}» em ${formId}`)
      fail++
    }
  }
  console.log(`OK · ${formId}: ${(form.methods ?? []).length} métodos · ${mapped.size} ações`)
}

checkForm('form-patlasv4-proto-demanda-completa', MTI_REQUIRED)
checkForm('form-patlasv4-proto-demanda-portal-cliente', CLI_REQUIRED)
checkForm('form-patlasv4-proto-demanda-portal-parceiro', PAR_REQUIRED)

// Wiring: formMethodActions deve chamar executeDemandaFormMethod
const actionsSrc = fs.readFileSync(
  path.join(__dirname, '../src/utils/formMethodActions.ts'),
  'utf8',
)
if (!actionsSrc.includes('executeDemandaFormMethod')) {
  console.error('formMethodActions NÃO wire demanda')
  fail++
} else {
  console.log('OK · formMethodActions wire demanda')
}

const canvasSrc = fs.readFileSync(
  path.join(__dirname, '../src/components/FormCanvas.tsx'),
  'utf8',
)
if (!canvasSrc.includes('demandaMethodExecuteOnConfirm')) {
  console.error('FormCanvas sem confirmar método Demanda')
  fail++
} else {
  console.log('OK · FormCanvas confirma método Demanda')
}

if (fail) {
  console.error(`FAIL · ${fail}`)
  process.exit(1)
}
console.log('PASS · métodos Demanda × portais coerentes')
