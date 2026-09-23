/**
 * Corrige gaps da auditoria F3 no BO Projeto Atlas · Demanda.
 * - R9: remove presets parceiro devolver/recusar
 * - R4: deduplica campos SLA
 * - R10: padroniza status via contrato → assinatura do atendimento
 * - Limpa metadata do flow-proto-demanda-parceiro
 *
 * Uso: node scripts/fix-bo-demanda-auditoria-f3.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORM = 'form-patlasv4-proto-demanda'

const REMOVE_PRESETS = new Set([
  'patlasv4proto-p-demanda-parceiro-devolvida',
  'patlasv4proto-p-demanda-parceiro-recusada',
])

const MAPA_F3 =
  'Abertura (SLA demanda) → [Hierarquia N2?] → Pré-análise MTI → Gateway → ' +
  'Fila: Consumo=gerente+titular parceria | Suporte=grupo/classe (24×7) → ' +
  'A) Parceiro efetivar→declarar→validar MTI → B) Via contrato detalhar→assinaturas→execução+OS → ' +
  'C) Orçamento→OS→gerente operação → Autorizar execução→ServiceNow «aprovada e em atendimento» → ' +
  'Encerrar→Termo homologação+RAER→assinaturas → Fins'

function main() {
  const formsPath = path.join(EPIC, 'forms.json')
  const flowsPath = path.join(EPIC, 'flows.json')
  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((f) => f.id === FORM)
  if (!dem) throw new Error('form Demanda ausente')

  // --- R4: dedupe SLA fields (keep first occurrence; enrich spec from second) ---
  const seen = new Set()
  const deduped = []
  for (const f of dem.fields) {
    if (seen.has(f.id)) {
      // merge better specs into first if first lacks detail
      const first = deduped.find((x) => x.id === f.id)
      if (first && f.spec && (!first.spec || first.spec.length < f.spec.length)) {
        first.spec = f.spec
      }
      if (f.id === 'patlasv4proto-demanda-sla-inicio') {
        first.label = 'SLA demanda · iniciado em'
        first.spec =
          'Na abertura da demanda o tempo declarado já conta (consumo e suporte).'
      }
      if (f.id === 'patlasv4proto-demanda-sla-prazo') {
        first.spec =
          first.spec ||
          'Vem do contrato/catálogo/OS (ex.: 24h infra, 21 dias serviço).'
      }
      if (f.id === 'patlasv4proto-demanda-sla-status') {
        first.label = 'Status do SLA (demanda)'
      }
      continue
    }
    seen.add(f.id)
    deduped.push(f)
  }
  const before = dem.fields.length
  dem.fields = deduped
  console.log(`SLA/fields: ${before} → ${dem.fields.length}`)

  // --- R10: alert "Aguardando autorização" = só caminho orçamento (não via contrato) ---
  const alertAuth = dem.fields.find(
    (f) => f.id === 'patlasv4proto-demanda-alert-status-aguardando-autorizacao',
  )
  if (alertAuth) {
    alertAuth.alertTitle = 'Aguardando autorização (pós-orçamento)'
    alertAuth.alertMessage =
      'Caminho orçamento: cliente autoriza OS após aceitar proposta.\n\n' +
      'Estágio 8/9\n8a. Autorização pós-orçamento\n→ Cliente autoriza → OS / gerente operação\n' +
      'Autorizar · Não autorizar\n\n' +
      'Não confundir com via contrato (R10): lá o status é «Aguardando assinatura do atendimento».'
  }

  // --- R9: remove illegal presets ---
  const presetsBefore = dem.exampleValuePresets?.length ?? 0
  dem.exampleValuePresets = (dem.exampleValuePresets ?? []).filter(
    (p) => !REMOVE_PRESETS.has(p.id),
  )
  console.log(`Presets: ${presetsBefore} → ${dem.exampleValuePresets.length}`)

  // --- R10 + limpeza: via-contrato preset ---
  const via = dem.exampleValuePresets.find(
    (p) => p.id === 'patlasv4proto-p-demanda-parceiro-via-contrato',
  )
  if (via) {
    via.name = 'Via contrato · aguarda assinaturas (R10)'
    via.fieldValues = {
      ...via.fieldValues,
      'patlasv4proto-demanda-status': 'Aguardando assinatura do atendimento',
      'patlasv4proto-demanda-desc-atendimento':
        'Escopo via contrato CTR-2025-0142. Detalhado; aguarda assinaturas gestor/fiscal/solicitante (R10).',
      'patlasv4proto-demanda-ultima-acao':
        'Via contrato · detalhou → aguarda assinaturas (não inicia execução)',
      'patlasv4proto-demanda-andamento-status-leitura':
        'Aguardando assinatura do atendimento',
      'patlasv4proto-demanda-andamento-etapa': '5b. Via contrato — assinaturas',
      'patlasv4proto-demanda-andamento-proximo':
        'Gestor, fiscal e solicitante assinam ou devolvem',
      'patlasv4proto-demanda-andamento-caminhos':
        'Assinar → atendimento+OS · Devolver → correção',
      'patlasv4proto-demanda-andamento-timeline':
        'Estágio 5 de 9 · 5b. Via contrato — assinaturas',
      'patlasv4proto-demanda-andamento-mapa': MAPA_F3,
      'patlasv4proto-demanda-assina-gestor': false,
      'patlasv4proto-demanda-assina-fiscal': false,
      'patlasv4proto-demanda-assina-solicitante': false,
      'patlasv4proto-demanda-sla-exec-status': 'Não iniciado',
    }
  }

  // --- limpar próximos passos que sugerem parceiro devolver/recusar ---
  for (const p of dem.exampleValuePresets) {
    const fv = p.fieldValues
    if (!fv) continue
    fv['patlasv4proto-demanda-andamento-mapa'] = MAPA_F3
    if (
      typeof fv['patlasv4proto-demanda-andamento-proximo'] === 'string' &&
      fv['patlasv4proto-demanda-andamento-proximo'].includes('Devolver') &&
      p.id.includes('parceiro') &&
      !p.id.includes('validacao')
    ) {
      fv['patlasv4proto-demanda-andamento-proximo'] =
        'Parceiro efetivar/declarar · MTI via contrato/orçamento · Devolver/Recusar só MTI'
    }
    if (p.id === 'patlasv4proto-p-demanda-parceiro-em-analise') {
      fv['patlasv4proto-demanda-andamento-proximo'] =
        'Parceiro: iniciar/efetivar · MTI: via contrato | orçamento | devolver | recusar'
      fv['patlasv4proto-demanda-andamento-caminhos'] =
        'Parceiro efetivar · Parecer MTI (R8/R9)'
      fv['patlasv4proto-demanda-ultima-acao'] =
        'Parceiro visualiza · pode iniciar/efetivar (sem devolver/recusar)'
    }
  }

  // mapa do alert principal
  const mapa = dem.fields.find((f) => f.id === 'patlasv4proto-demanda-andamento-mapa')
  if (mapa) {
    mapa.alertMessage = MAPA_F3
    mapa.alertTitle = 'Fluxo Demanda F3 (fontes 11/09)'
  }

  if (REMOVE_PRESETS.has(dem.activeExamplePresetId)) {
    dem.activeExamplePresetId = 'patlasv4proto-p-demanda-f3-consumo-fila'
  }

  fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n')

  // --- flows ---
  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const parc = flows.find((f) => f.id === 'flow-proto-demanda-parceiro')
  if (parc) {
    parc.name = 'Demanda — Fluxo do Parceiro F3 (iniciar/efetivar)'
    parc.metadata =
      'F3 · call 11/09. Parceiro só após notificação. Pode: iniciar/efetivar + declarar atendida (+ complementar orçamento). NÃO pode: devolver nem recusar (só MTI). Validação final = MTI. Preferir também flow-proto-demanda-mti para o rito completo no BO Atlas.'
    parc.description =
      'Parceiro inicia/efetiva e declara atendida; MTI valida. Sem devolver/recusar (R9).'
    for (const s of parc.steps ?? []) {
      if (s.id === 'step-parc-fila') {
        s.bpmnDescription =
          'Portal do parceiro lista demandas notificadas. MTI opera no Projeto Atlas (sem portal).'
      }
      if (s.id === 'step-parc-visao') {
        s.bpmnDescription =
          'Só age se notificado. Ação = efetivar/iniciar atendimento («bater ponto»). Deliberação definitiva (devolver/recusar/validar) é da MTI.'
      }
    }
  }

  const mti = flows.find((f) => f.id === 'flow-proto-demanda-mti')
  if (mti) {
    for (const s of mti.steps ?? []) {
      if (s.id === 'step-mti-via-contrato') {
        s.bpmnOutputs = 'Status Aguardando assinatura do atendimento'
        s.bpmnDescription =
          'Detalha catálogo/NEC/valores/contabilidade. Envia para assinaturas (gestor/fiscal/solicitante). Não inicia execução nem SLA de execução ainda (R10).'
        s.bpmnRuleList = [
          'Via contrato ≠ início imediato',
          'Após detalhar → status «Aguardando assinatura do atendimento»',
          'SLA execução só após assinaturas (ou start parceiro)',
        ]
      }
    }
  }

  // limpar flow legado jul se ainda atribuir devolver ao parceiro no nome antigo
  const legado = flows.find(
    (f) =>
      f.id === 'flow-proto-demanda-completo' ||
      (typeof f.name === 'string' && f.name.includes('LEGADO')),
  )
  if (legado && typeof legado.metadata === 'string' && legado.metadata.includes('devolver')) {
    legado.metadata =
      'LEGADO 20/07 — NÃO USAR. Preferir flow-proto-demanda-mti (F3). Devolver/recusar = só MTI (R8/R9).'
  }

  fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n')
  console.log('OK: auditoria F3 aplicada (R9 presets, SLA dedupe, R10, flow parceiro)')
}

main()
