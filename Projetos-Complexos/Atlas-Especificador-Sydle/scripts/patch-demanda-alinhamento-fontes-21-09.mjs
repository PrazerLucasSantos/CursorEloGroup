#!/usr/bin/env node
/**
 * Demanda Completa — alinhamento às fontes diretas (Granola + ASR 15–17/09).
 *
 * - Corrige visibility rules Próprio/Patrocinado (match exato)
 * - Separa OS: tipo vínculo × modelo Global/Dedicada
 * - Métodos: assinar-os, devolver-quantitativos, autorizacao-patrocinio
 * - Qualificar: natureza da cobertura
 * - Specs/mapa/status sem T56 / OS “obrigatória”
 * - RAER marcado como stub
 *
 * Uso: node scripts/patch-demanda-alinhamento-fontes-21-09.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const FORM_ID = 'form-patlasv4-proto-demanda-completa'
const OS_FORM_ID = 'form-patlasv4-proto-demc-os'
const QUAL_METHOD = 'form-patlasv4-proto-metodo-demc-qualificar'
const AND_METHOD = 'form-patlasv4-proto-metodo-demc-ver-andamento'

const MAPA =
  'Abertura (só descrição obrig. · Luis 17/09) → N2 gestor∥fiscal (sempre Consumo) → ' +
  'Qualificação MTI (cobertura/parceiro) → [parceiro parecer →] deliberação MTI → ' +
  'Via contrato ([patrocínio pós-qualif.] → assinaturas) | Orçamento → OS (Global|Dedicada) → ' +
  'Autorizar → SN (Atlas→SN) → Execução → Termo (+RAER stub) → fronteira PV'

function upsertField(form, field) {
  const i = form.fields.findIndex((f) => f.id === field.id)
  if (i >= 0) form.fields[i] = { ...form.fields[i], ...field }
  else form.fields.push(field)
}

function upsertMethod(form, method) {
  if (!form.methods) form.methods = []
  const i = form.methods.findIndex((m) => m.id === method.id)
  if (i >= 0) form.methods[i] = { ...form.methods[i], ...method }
  else form.methods.push(method)
}

function upsertRule(form, rule) {
  if (!form.fieldVisibilityRules) form.fieldVisibilityRules = []
  const i = form.fieldVisibilityRules.findIndex((r) => r.id === rule.id)
  if (i >= 0) form.fieldVisibilityRules[i] = { ...form.fieldVisibilityRules[i], ...rule }
  else form.fieldVisibilityRules.push(rule)
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
  const dem = forms.find((x) => x.id === FORM_ID)
  if (!dem) throw new Error(`Form ${FORM_ID} não encontrado`)

  dem.metadata =
    'Demanda Completa F3 · alinhado fontes Granola/ASR 15–17/09 (patch 21/09). ' +
    'Consumo: N2 gestor∥fiscal → MTI BO → (parceiro propositivo) → deliberação → ' +
    'via contrato|orçamento|sem cobertura → OS Global|Dedicada → SN Atlas→SN → termo L02/L03. ' +
    'Suporte=BACKLOG. OS NÃO pré-condição de faturamento (#03). RAER=stub até docs Luis. ' +
    'Patrocínio assina após qualificação.'

  // Status options — incluir patrocinador
  const st = dem.fields.find((f) => f.id === 'patlasv4proto-demc-status')
  if (st?.options && !st.options.includes('Aguardando autorização patrocinador')) {
    const idx = st.options.indexOf('Aguardando assinatura do atendimento')
    if (idx >= 0) st.options.splice(idx, 0, 'Aguardando autorização patrocinador')
    else st.options.push('Aguardando autorização patrocinador')
  }

  // Tipo OS Global×Dedicada na Demanda (separado do vínculo)
  upsertField(dem, {
    size: 'small',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'highlight',
    id: 'patlasv4proto-demc-tipo-os',
    label: 'Modelo OS (Global × Dedicada)',
    type: 'textOptions',
    sectionId: 'sec-demc-os-orc',
    options: ['Global', 'Dedicada'],
    spec:
      'Função: Modelo da OS — Global (guarda-chuva, consumos parciais) × Dedicada (exato do pedido).\n' +
      'Regra (Luis 17/09): modelar em OS e no produto (pacote|individual). ' +
      'Faturamento (#03): OS NÃO é pré-condição — exige contrato com saldo.\n' +
      'Fonte: Discovery Atlas 17 Setembro.',
  })

  upsertField(dem, {
    size: 'small',
    readOnly: true,
    required: false,
    multiple: false,
    relevance: 'common',
    id: 'patlasv4proto-demc-patrocinio-autorizado',
    label: 'Patrocínio autorizado',
    type: 'boolean',
    sectionId: 'sec-demc-andamento',
    spec:
      'Função: Flag de autorização do patrocinador (contrato de gestão).\n' +
      'Regra (Luis 17/09): ocorre DEPOIS da qualificação MTI e ANTES das assinaturas do atendimento.\n' +
      'Fonte: Discovery Atlas 17 Setembro.',
  })

  // Visibility rules — match EXATO das opções
  upsertRule(dem, {
    id: 'rule-demc-ref-contrato-proprio',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-demc-contrato-natureza',
    sourceKind: 'textOptions',
    expectedOptionText: 'Próprio do cliente',
    action: 'show',
    targetFieldIds: ['patlasv4proto-demc-ref-contrato'],
  })
  upsertRule(dem, {
    id: 'rule-demc-ref-contrato-patrocinado',
    operator: 'eq',
    sourceFieldId: 'patlasv4proto-demc-contrato-natureza',
    sourceKind: 'textOptions',
    expectedOptionText: 'Patrocinado (gestão)',
    action: 'show',
    targetFieldIds: [
      'patlasv4proto-demc-ref-contrato',
      'patlasv4proto-demc-patrocinio-autorizado',
    ],
  })

  // Spec tipo suporte
  const tipo = dem.fields.find((f) => f.id === 'patlasv4proto-demc-tipo')
  if (tipo) {
    tipo.spec =
      'Função: Tipo da demanda: Consumo ou Suporte.\n' +
      'Regra: Consumo = tronco F3. Suporte = BACKLOG F3 (Luis 17/09 — fora desta fase). ' +
      'Opção Suporte permanece só para referência; abertura de Suporte bloqueada no motor (SUPORTE_BACKLOG_F3).'
  }

  // Métodos novos / rótulos
  upsertMethod(dem, {
    id: 'method-demc-assinar-os',
    name: 'Assinar OS (gerente de operação)',
    icon: 'draw',
    kind: 'destaque',
    spec:
      'Caminho orçamento (9/11): gerente de operação assina a OS antes de autorizar execução/SN. ' +
      'Via contrato: após assinaturas do atendimento, MTI só autoriza (não reassina OS).',
  })
  upsertMethod(dem, {
    id: 'method-demc-devolver-quantitativos',
    name: 'Quantitativos NÃO conferem → devolve DEMANDA',
    icon: 'undo',
    kind: 'menu',
    spec: 'L7: devolução por quantitativo devolve a DEMANDA (não só a OS).',
  })
  upsertMethod(dem, {
    id: 'method-demc-autorizacao-patrocinio',
    name: 'Registrar autorização do patrocinador',
    icon: 'verified_user',
    kind: 'destaque',
    spec:
      'Luis 17/09: autorização do contrato de gestão/patrocínio ocorre após a qualificação MTI ' +
      'e antes das assinaturas do atendimento.',
  })

  const encerrar = dem.methods?.find((m) => m.id === 'method-demc-encerrar-termo')
  if (encerrar) {
    encerrar.name = 'Encerrar atendimento · gerar termo (+ RAER stub)'
    encerrar.spec =
      'Gera termo de homologação. RAER vinculado no mesmo evento como STUB — ' +
      'campos Hire/RAER finos aguardam docs Luis (não inventar). L02/L03 aplicam-se ao termo.'
  }

  const via = dem.methods?.find((m) => m.id === 'method-demc-via-contrato')
  if (via) {
    via.spec =
      'Deliberação definitiva MTI. Com parceiro notificado: só após Proposta parceiro. ' +
      'Se Patrocinado (gestão) e ainda sem autorização → status Aguardando autorização patrocinador.'
  }

  // Classe OS embutida — separar modelo Global×Dedicada do tipo de vínculo
  const osForm = forms.find((x) => x.id === OS_FORM_ID)
  if (osForm) {
    const osTipo = osForm.fields?.find((f) => f.id === 'patlasv4proto-demc-os-tipo')
    if (osTipo) {
      osTipo.label = 'Tipo de vínculo'
      osTipo.options = ['Via contrato', 'Via orçamento', 'OS existente', 'OS digital']
      osTipo.spec =
        'Função: Como a OS se relaciona à demanda (via contrato / orçamento / existente / digital).\n' +
        'Regra: Distinto do modelo Global × Dedicada (campo Modelo OS).'
    }
    upsertField(osForm, {
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      id: 'patlasv4proto-demc-os-modelo',
      label: 'Modelo OS',
      type: 'textOptions',
      sectionId: osTipo?.sectionId || 'sec-demc-os-ident',
      options: ['Global', 'Dedicada'],
      spec:
        'Função: OS Global (guarda-chuva) × Dedicada (Luis 17/09).\n' +
        'Regra: Faturamento não exige OS — exige contrato+saldo (#03).',
    })
  }

  // Método qualificar — natureza cobertura
  const qual = forms.find((x) => x.id === QUAL_METHOD)
  if (qual) {
    upsertField(qual, {
      id: 'patlasv4proto-mdem-qual-natureza',
      label: 'Natureza da cobertura',
      type: 'textOptions',
      size: 'medium',
      readOnly: false,
      required: true,
      multiple: false,
      relevance: 'highlight',
      options: ['Próprio do cliente', 'Patrocinado (gestão)', 'Sem contrato'],
      spec:
        'Luis 17/09: MTI define na qualificação se há contrato próprio, gestão/patrocínio ou sem cobertura. ' +
        'Patrocínio assina depois desta etapa.',
    })
    const alert = qual.fields?.find((f) => f.type === 'alert')
    if (alert) {
      alert.alertMessage =
        'Qualificação MTI (Luis 17/09): definir solução, catálogo, parceiro(s) e natureza da cobertura. ' +
        'Com parceiro → notifica e aguarda parecer antes da deliberação definitiva. Sem IA nesta fase.'
    }
  }

  // Mapa andamento
  const and = forms.find((x) => x.id === AND_METHOD)
  if (and) {
    const mapa = and.fields?.find((f) => f.id === 'patlasv4proto-mdem-and-mapa')
    if (mapa) {
      mapa.alertMessage = MAPA
    }
    and.metadata =
      'Método Demanda Completa · Ver andamento. Fontes: Granola/ASR 15–17/09. ' +
      'MTI = Projeto Atlas BO (não portal). N2 = gestor∥fiscal. Parceiro = propositivo. ' +
      'L02 termo recusado / demanda concluída. L03 regenera + reassina. T4 OS ≠ bloqueio faturamento.'
  }

  fs.writeFileSync(FORMS, JSON.stringify(forms, null, 2) + '\n')
  console.log('OK · patch-demanda-alinhamento-fontes-21-09')
  console.log('  - visibility Próprio do cliente / Patrocinado (gestão)')
  console.log('  - campos tipo-os + patrocinio-autorizado')
  console.log('  - métodos assinar-os / devolver-quantitativos / autorizacao-patrocinio')
  console.log('  - OS modelo Global×Dedicada separado do vínculo')
  console.log('  - qualificar + mapa + specs L02/L03/RAER stub')
}

main()
