#!/usr/bin/env node
import fs from 'node:fs'

const atlas = fs.readFileSync('src/utils/demandaAtlasLive.ts', 'utf8')
const demData = fs.readFileSync('src/portalCliente/portalClienteDemandaData.ts', 'utf8')
const forms = JSON.parse(
  fs.readFileSync(
    'data/subprojects/atlas-prototipo/epics/projeto-atlas-prototipacao/forms.json',
    'utf8',
  ),
)
const form = forms.find((f) => f.id === 'form-patlasv4-proto-demanda-completa')

const start = atlas.indexOf('export function demandaToAtlasFieldValues')
const end = atlas.indexOf('\nexport function', start + 10)
const body = atlas.slice(start, end)

const mapped = new Map()
for (const m of body.matchAll(/\[f\(prefix,\s*'([^']+)'\)\]:\s*([^,\n]+(?:\n\s+[^,\n]+)*)/g)) {
  mapped.set(m[1], m[2].replace(/\s+/g, ' ').trim())
}

const storeRefs = [...new Set([...body.matchAll(/d\.([a-zA-Z0-9_]+)/g)].map((m) => m[1]))]
const block = demData.match(/export interface Demanda \{([\s\S]*?)\n\}/)[1]
const demFields = [...block.matchAll(/([a-zA-Z][a-zA-Z0-9_]*)\??:/g)].map((m) => m[1])

const HINT = {
  anexos: { atlas: 'anexos', risk: 'alto', note: 'file[] do portal não vira FieldDemoValue de arquivo' },
  catalogos: { atlas: 'catalogos', risk: 'alto', note: 'existe no store e no form (ref), mas NÃO está no fv' },
  itensCatalogo: { atlas: 'itens', risk: 'médio', note: 'texto de itens não mapeado' },
  gerenteParceria: { atlas: 'resp-gerente', risk: 'médio', note: 'preenchido na criação se parceiro' },
  responsavelTitular: { atlas: 'resp-titular', risk: 'médio', note: 'preenchido na criação' },
  substituto1: { atlas: 'subst-1', risk: 'baixo', note: 'seed na criação' },
  substituto2: { atlas: 'subst-2', risk: 'baixo', note: 'seed na criação' },
  suporteGrupo: { atlas: 'suporte-grupo', risk: 'médio', note: 'quando Tipo=Suporte' },
  suporte24x7: { atlas: 'suporte-24x7', risk: 'médio', note: 'boolean na criação suporte' },
  assinaturaSolicitante: { atlas: 'assina-solicitante', risk: 'médio', note: 'gestor/fiscal já mapeados; solicitante falta' },
  entregavel: { atlas: 'entregavel-desc', risk: 'médio', note: 'após parceiro declarar' },
  orcamentoAssinadoGerenteArea: { atlas: 'orc-assinatura-gerente-area', risk: 'médio', note: 'boolean orçamento' },
  osAssinadaGerenteOperacao: { atlas: 'OS embedded', risk: 'baixo', note: 'via ref-oses' },
  motivoUltimaAcao: { atlas: 'motivo / motivo-rejeicao', risk: 'médio', note: 'devolução/recusa' },
  homologAjuste: { atlas: 'homolog-ajuste', risk: 'baixo', note: 'flag ajuste termo' },
  homologAjustePor: { atlas: 'homolog-ajuste-por', risk: 'baixo', note: 'Cliente|MTI' },
  serviceNowStatus: { atlas: '—', risk: 'baixo', note: 'sem campo flat correspondente' },
  serviceNowEm: { atlas: '—', risk: 'baixo', note: 'sem campo flat' },
  serviceNowId: { atlas: '—', risk: 'baixo', note: 'sem campo flat' },
  atualizadoEm: { atlas: '—', risk: 'info', note: 'metadado de store' },
  osVinculada: { atlas: 'ref-oses', risk: 'ok', note: 'embedded OS' },
  numeroContrato: { atlas: 'ref-contrato', risk: 'ok', note: 'embedded contrato' },
  orcamento: { atlas: 'orc-numero', risk: 'parcial', note: 'número mapeado; itens não' },
  valoresContrato: { atlas: 'via-valores', risk: 'ok', note: 'já mapeado' },
  necAtendimento: { atlas: 'nec', risk: 'ok', note: 'já mapeado' },
  definirPagamento: { atlas: 'forma-pagamento', risk: 'ok', note: 'já mapeado' },
  contatoNumero: { atlas: 'contato-numero', risk: 'ok', note: 'corrigido' },
}

console.log('## A) Store Demanda → Atlas (sem mapeamento no fv)\n')
for (const k of demFields) {
  if (storeRefs.includes(k)) continue
  if (['id', 'historico', 'criadoEm'].includes(k)) continue
  // nested used specially
  if (body.includes(`d.${k}`) || body.includes(`${k}?`)) continue
  const h = HINT[k] || { atlas: '?', risk: '?', note: '' }
  console.log(`- **${k}** → \`${h.atlas}\` | risco **${h.risk}** | ${h.note}`)
}

// Form fields on Dados da Demanda without map
console.log('\n## B) Aba Dados da Demanda / abertura sem valor no fv\n')
for (const f of form.fields.filter((x) => x.sectionId === 'sec-demc-identificacao')) {
  const suf = f.id.replace('patlasv4proto-demc-', '')
  if (mapped.has(suf)) continue
  if (f.type === 'embeddedReference') {
    console.log(`- **${f.label}** (\`${suf}\`, embedded) — via contratoEmbeddedRow se numeroContrato`)
    continue
  }
  console.log(`- **${f.label}** (\`${suf}\`, ${f.type}) — sem mapeamento store`)
}

// Option mismatches
const SAMPLE = {
  'fila-regra': [
    'Parceiro notificado · fila parceria',
    'Suporte · grupo/classe de serviço',
    'Consumo · gerente + titular da parceria',
  ],
  'contrato-natureza': ['Próprio do cliente', 'Patrocinado (gestão)', 'Sem contrato'],
  'sla-exec-status': ['Não iniciado', 'Em execução', 'No prazo', 'Estourado', 'Dilatado'],
  'forma-pagamento': ['Indenização', 'Nova contratação', 'Desistiu', 'Ainda não definido'],
  'situacao-definir-pagar': ['Definido', 'Ainda não definido'],
  'homolog-status': [
    'Não iniciado',
    'Em elaboração',
    'Aguardando assinatura',
    'Ajuste solicitado',
    'Assinado',
    'Recusado',
  ],
  'raer-status': ['Não iniciado', 'Em elaboração', 'Vinculado ao termo', 'Concluído'],
  'parceiro-nome': ['EloGroup', 'Parceiro Cloud MT'],
  produto: ['MTI HOST', 'MTI LAB', 'MTI Soluções', 'Outros', 'MTI CLOUD — Serviços em nuvem'],
}

console.log('\n## C) Risco de valor fora das opções do form (textOptions/reference)\n')
for (const f of form.fields.filter((x) => x.type === 'textOptions' || x.type === 'reference')) {
  const suf = f.id.replace('patlasv4proto-demc-', '')
  if (!mapped.has(suf) && !SAMPLE[suf]) continue
  const opts = f.options || []
  const samples = SAMPLE[suf] || []
  if (f.type === 'textOptions' && opts.length && samples.length) {
    const missing = samples.filter((s) => !opts.includes(s))
    if (missing.length) {
      console.log(
        `- **${f.label}** (\`${suf}\`): store/portal usa valor(es) fora das options → ${missing.map((x) => `"${x}"`).join(', ')}`,
      )
      console.log(`  options do form: ${opts.slice(0, 6).join(' | ')}${opts.length > 6 ? '…' : ''}`)
    }
  }
  if (f.type === 'reference' && samples.length) {
    console.log(
      `- **${f.label}** (\`${suf}\`, ref→${(f.linkedFormId || '').split('-').slice(-1)}): valores vivos ${samples.slice(0, 4).join(', ')} — após fix de normalize, **exibem**; catálogo demo pode não listar todos`,
    )
  }
}

console.log('\n## D) Já mapeados (ok após fix de referência)\n')
for (const [suf, expr] of mapped) {
  console.log(`- \`${suf}\` ← ${expr.slice(0, 80)}`)
}
