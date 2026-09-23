/**
 * Back-office real = Projeto Atlas (Explorer), NÃO portal HTML.
 * Completa class-groups, flow, presets e corrige textos que dizem que MTI tem portal.
 *
 * Uso: node scripts/patch-bo-atlas-demanda-f3.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')

const METHOD_FORMS = [
  'form-patlasv4-proto-metodo-demanda-ver-andamento',
  'form-patlasv4-proto-metodo-demanda-pre-analise',
  'form-patlasv4-proto-metodo-demanda-qualificar',
  'form-patlasv4-proto-metodo-demanda-iniciar-analise',
  'form-patlasv4-proto-metodo-demanda-via-contrato',
  'form-patlasv4-proto-metodo-demanda-assinar-atendimento',
  'form-patlasv4-proto-metodo-demanda-orcamento',
  'form-patlasv4-proto-metodo-demanda-parceiro-iniciar',
  'form-patlasv4-proto-metodo-demanda-parceiro-declarar',
  'form-patlasv4-proto-metodo-demanda-validar-parceiro',
  'form-patlasv4-proto-metodo-demanda-autorizar-sn',
  'form-patlasv4-proto-metodo-demanda-encerrar-termo',
  'form-patlasv4-proto-metodo-demanda-ajuste-termo',
  'form-patlasv4-proto-metodo-demanda-devolver',
  'form-patlasv4-proto-metodo-demanda-recusar',
  'form-patlasv4-proto-metodo-demanda-autorizar',
]

const F3_DEFAULTS = {
  'patlasv4proto-demanda-fila-regra': 'Consumo · gerente + titular da parceria',
  'patlasv4proto-demanda-sn-status': 'Não enviado',
  'patlasv4proto-demanda-raer-status': 'Não iniciado',
  'patlasv4proto-demanda-sla-status': 'No prazo',
}

function main() {
  const cgPath = path.join(EPIC, 'class-groups.json')
  const flowsPath = path.join(EPIC, 'flows.json')
  const formsPath = path.join(EPIC, 'forms.json')
  const wsPath = path.join(EPIC, 'workspaces.json')

  const cg = JSON.parse(fs.readFileSync(cgPath, 'utf8'))
  const demGroup = cg.groups.find((g) => g.id === 'grp-atlas-demanda')
  if (demGroup) demGroup.name = '[Atlas] Demanda · BO F3'

  for (const id of METHOD_FORMS) {
    cg.assignments[id] = 'grp-atlas-demanda-met'
  }
  cg.assignments['form-patlasv4-proto-demanda'] = 'grp-atlas-demanda'
  cg.memberOrderByGroup['grp-atlas-demanda'] = ['form-patlasv4-proto-demanda']
  cg.memberOrderByGroup['grp-atlas-demanda-met'] = [...METHOD_FORMS]
  fs.writeFileSync(cgPath, JSON.stringify(cg, null, 2) + '\n')

  const forms = JSON.parse(fs.readFileSync(formsPath, 'utf8'))
  const dem = forms.find((f) => f.id === 'form-patlasv4-proto-demanda')
  if (!dem) throw new Error('form Demanda ausente')
  dem.metadata =
    'Classe Demanda no back-office Projeto Atlas (Explorer). MTI NÃO tem portal — só cliente/parceiro no portal. Fontes F3: Discovery 09/09 + call 11/09 · demanda-o-que-foi-dito-e-regras.md (R1–R20).'

  for (const p of dem.exampleValuePresets ?? []) {
    p.fieldValues = { ...F3_DEFAULTS, ...p.fieldValues }
    // Fila por tipo quando ainda genérico
    if (p.fieldValues['patlasv4proto-demanda-tipo'] === 'Suporte') {
      p.fieldValues['patlasv4proto-demanda-fila-regra'] =
        p.fieldValues['patlasv4proto-demanda-fila-regra'] ||
        'Suporte · grupo/classe de serviço'
    }
  }
  dem.activeExamplePresetId = dem.activeExamplePresetId || 'patlasv4proto-p-demanda-f3-consumo-fila'
  fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2) + '\n')

  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const flow = flows.find((f) => f.id === 'flow-proto-demanda-mti')
  if (!flow) throw new Error('flow-proto-demanda-mti ausente')

  flow.name = 'Demanda — Fluxo F3 (back-office Projeto Atlas)'
  flow.metadata =
    'Back-office = Projeto Atlas (Explorer/classe Demanda). MTI não tem portal. Fontes: Discovery 09/09 + call 11/09 · R1–R20.'

  const navExtra = {
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-parceiro-iniciar':
      'step-mti-parceiro-iniciar',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-parceiro-declarar':
      'step-mti-parceiro-declarar',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-validar-parceiro':
      'step-mti-validar-parceiro',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-assinar-atendimento':
      'step-mti-assinar-atendimento',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-autorizar-sn':
      'step-mti-autorizar-sn',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-encerrar-termo':
      'step-mti-encerrar-termo',
    'pkg-fase-3-demanda::cls-mapa-demanda::method-demanda-ajuste-termo':
      'step-mti-encerrar-termo',
  }

  for (const step of flow.steps ?? []) {
    if (step.id === 'step-mti-workspace-fila') {
      step.assigneeRoleDetail =
        'Analista MTI no back-office Projeto Atlas (Explorer). Pacote Fase 3 · Demanda F3 → classe Demanda. Não é portal.'
      step.workspaceMethodNavigateStepIds = {
        ...(step.workspaceMethodNavigateStepIds || {}),
        ...navExtra,
      }
    }
    if (step.id === 'step-mti-registro') {
      step.classPresentationTitle = 'Demanda — registro no Projeto Atlas (BO)'
      step.classPresentationDescription =
        'Back-office Sydle: Status e andamento, Identificação, Necessidade, Fila e responsáveis (R16), Parceiro, Análise, Atendimento, Assinaturas, Entregável/RAER, OS/Orçamento/ServiceNow (R17), Histórico. Métodos no painel.'
    }
    if (step.id === 'step-mti-contexto-chegada') {
      step.htmlContent = `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px;color:#0f172a;line-height:1.55;font-size:14px">
  <h2 style="margin:0 0 8px;color:#0F3D4C">Antes do back-office (Projeto Atlas)</h2>
  <ol style="margin:0;padding-left:18px">
    <li><strong>Portal</strong> (somente cliente ou parceiro): tipo Consumo|Suporte → solução-first → tooltip contrato + KPIs → descrição (+obs/anexo + chat IA) → Enviar. <em>MTI não abre demanda no portal.</em></li>
    <li><strong>MTI</strong> abre/opera demanda no <strong>Projeto Atlas</strong> (Explorer · classe Demanda).</li>
    <li><strong>Hierarquia do cliente</strong> (opcional): demandante N2 só abre; gestor/fiscal pode aprovar, devolver ou recusar antes da MTI.</li>
    <li>Registro no Projeto Atlas: «Aguardando pré-análise MTI» (ou «Aguardando análise» se dispensar pré-filtro).</li>
  </ol>
  <p style="margin:12px 0 0;padding:10px;background:#eff6ff;border-left:4px solid #1D5FA8">Este fluxo modela as ações da MTI no Explorer — back-office, não portal.</p>
</div>`
    }
    if (step.id === 'step-mti-visao') {
      step.htmlContent = `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:920px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#0F3D4C;font-size:22px">Demanda no back-office — Projeto Atlas</h1>
  <p style="margin:0 0 12px;color:#475569">O <strong>back-office da MTI é o Projeto Atlas</strong> (workspace Explorer + classe Demanda). <strong>MTI não tem portal</strong> — portal é só cliente/parceiro.</p>
  <h2 style="margin:16px 0 8px;font-size:16px">Premissa F3 (09/09 + 11/09)</h2>
  <ul style="margin:0;padding-left:18px">
    <li>Demanda <strong>pós-contrato</strong> (consumo/suporte).</li>
    <li>Portal (cliente/parceiro): formulário em etapas → envia.</li>
    <li>MTI: recebe no Atlas → pré-análise → qualifica/roteia → analisa → parecer · ServiceNow · termo+RAER.</li>
  </ul>
  <h2 style="margin:16px 0 8px;font-size:16px">Regras fechadas</h2>
  <ul style="margin:0;padding-left:18px">
    <li><strong>Recusar / devolver:</strong> somente MTI.</li>
    <li><strong>IA sugere; MTI decide</strong> na qualificação.</li>
    <li>Parceiro: inicia/efetiva e declara — sem recusar/devolver.</li>
    <li>R16 fila · R17 Atlas→SN · R18 termo+RAER.</li>
  </ul>
</div>`
    }
  }
  fs.writeFileSync(flowsPath, JSON.stringify(flows, null, 2) + '\n')

  const ws = JSON.parse(fs.readFileSync(wsPath, 'utf8'))
  for (const w of ws) {
    for (const pkg of w.packages ?? []) {
      if (pkg.id === 'pkg-fase-3-demanda') {
        pkg.name = 'Fase 3 · Demanda F3 (BO Atlas)'
        const cls = pkg.classes?.[0]
        if (cls) {
          cls.linkedFormExamplePresetIds = [
            'preset-dem-mti-pre-analise',
            'preset-dem-mti-qualificar',
            'preset-dem-mti-em-analise',
            'patlasv4proto-p-demanda-aguardando-assinatura',
            'patlasv4proto-p-demanda-validacao-mti',
            'patlasv4proto-p-demanda-f3-consumo-fila',
            'patlasv4proto-p-demanda-f3-suporte',
            'patlasv4proto-p-demanda-f3-sn',
            'patlasv4proto-p-demanda-f3-homolog-raer',
          ]
        }
      }
    }
  }
  fs.writeFileSync(wsPath, JSON.stringify(ws, null, 2) + '\n')

  console.log('OK: BO Projeto Atlas · Demanda F3 (class-groups, forms, flow, workspace)')
}

main()
