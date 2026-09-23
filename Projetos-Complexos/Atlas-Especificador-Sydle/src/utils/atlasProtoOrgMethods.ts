import type { EmbeddedDemoRow, FormDef, FormExampleValuePreset } from '../types'
import { getActiveExamplePreset } from './formExamplePresets'

const FORM_ORGANIZACAO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PORTAL_ONBOARDING_ORG = 'form-patlasv4-proto-portal-onboarding-org'
const FORM_TDOC = 'form-patlasv4-proto-tipo-documento'
const FORM_CAT_ETAPA = 'form-patlasv4-proto-cat-etapa-documentacional'
const METHOD_VALIDAR_CNPJ = 'patlasv4proto-uo-meth-validar-cnpj'
const METHOD_PORTAL_ORG_VALIDAR_CNPJ = 'patlasv4proto-portal-org-meth-validar-cnpj'

export const FIELD_ETAPAS_SELECAO = 'patlasv4proto-uo-etapas-selecao'
export const FIELD_ETAPAS_INCLUIDAS = 'patlasv4proto-uo-etapas-documentacionais'

/** Etapa de Documentação (catálogo): multi-seleção de grupos + lista incluída. */
export const FIELD_CAT_ETAPA_GRUPOS_SELECAO = 'patlasv4proto-catetapa-grupos-selecao'
export const FIELD_CAT_ETAPA_LISTA_DOCS = 'patlasv4proto-catetapa-grupos'

export const ETAPAS_DOCUMENTACIONAIS = [
  'Habilitação documental',
  'Pré-rito parceria',
  'Execução da parceria',
] as const

const GRUPO_ETAPA: Record<string, string> = {
  'Habilitação Jurídica': 'Habilitação documental',
  'Qualificação Técnica': 'Habilitação documental',
  'Qualificação Econômica e Financeira': 'Habilitação documental',
  'Compliance (adendo)': 'Habilitação documental',
  'Pré-rito parceria': 'Pré-rito parceria',
  'Documentos de execução': 'Execução da parceria',
}

const FALLBACK_TIPOS: Record<string, string[]> = {
  'Documentos de execução': [
    'Contrato de Parceria',
    'Plano de Negócio',
    'Plano de Operação',
    'Papel Timbrado',
    'Logo Marca',
  ],
  'Pré-rito parceria': [
    'Contrato de Parceria',
    'Plano de Negócio',
    'Plano de Operação',
    'Papel Timbrado',
    'Logo Marca',
  ],
  'Compliance (adendo)': [
    'Política de compliance / anticorrupção',
    'Declaração de conflito de interesses',
  ],
}

export interface DadosReceitaCnpj {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  naturezaJuridica: string
  inscricaoMunicipal: string
  inscricaoEstadual: string
  cnae: string
}

/** Mock Receita Federal / SERPRO — protótipo. */
export const RECEITA_CNPJ_MOCK: Record<string, DadosReceitaCnpj> = {
  '12345678000190': {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'EloGroup Tecnologia Ltda.',
    nomeFantasia: 'EloGroup',
    naturezaJuridica: '206-2 — Sociedade Empresária Limitada',
    inscricaoMunicipal: '1.234.567-8',
    inscricaoEstadual: '123.456.789.110',
    cnae: '6201-5/01 — Desenvolvimento de programas de computador sob encomenda',
  },
  '03507382000106': {
    cnpj: '03.507.382/0001-06',
    razaoSocial: 'Empresa Mato-grossense de Tecnologia da Informação',
    nomeFantasia: 'MTI',
    naturezaJuridica: '203-8 — Sociedade de Economia Mista',
    inscricaoMunicipal: '9876543',
    inscricaoEstadual: 'Isento',
    cnae: '6201-5/01 — Desenvolvimento de programas de computador sob encomenda',
  },
}

export function normalizeCnpjDigits(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

export function lookupReceitaCnpj(cnpj: string): DadosReceitaCnpj | null {
  const key = normalizeCnpjDigits(cnpj)
  return RECEITA_CNPJ_MOCK[key] ?? null
}

export function applyDadosReceitaToOrgFields(
  dados: DadosReceitaCnpj,
  setValue: (key: string, value: string) => void,
): void {
  setValue('patlasv4proto-uo-cnpj', dados.cnpj)
  setValue('mqgzalmsd6b805', dados.razaoSocial)
  setValue('mqh1rbjlh7gf7u', dados.nomeFantasia)
  setValue('mqh1xpb25qx8tu', dados.naturezaJuridica)
  setValue('patlasv4proto-uo-inscricao-municipal', dados.inscricaoMunicipal)
  setValue('patlasv4proto-uo-inscricao-estadual', dados.inscricaoEstadual)
  setValue('patlasv4proto-uo-cnae', dados.cnae)
  setValue('patlasv4proto-uo-nome', dados.nomeFantasia || dados.razaoSocial)
}

export function runValidarCnpjProtoOrg(
  getValue: (key: string) => string | undefined,
  setValue: (key: string, value: string) => void,
): boolean {
  const atual = getValue('patlasv4proto-uo-cnpj')?.trim()
  const informado = prompt(
    'Informe o CNPJ para consulta na Receita Federal (protótipo):',
    atual || '12.345.678/0001-90',
  )
  if (informado == null) return false
  const cnpj = informado.trim()
  if (normalizeCnpjDigits(cnpj).length !== 14) {
    alert('CNPJ inválido — informe 14 dígitos.')
    return false
  }
  const dados = lookupReceitaCnpj(cnpj)
  if (!dados) {
    alert(
      'CNPJ não encontrado na base mock do protótipo. Use 12.345.678/0001-90 ou 03.507.382/0001-06.',
    )
    return false
  }
  applyDadosReceitaToOrgFields(dados, setValue)
  alert(
    'CNPJ validado com sucesso.\n\n' +
      'Razão social, inscrições e CNAE preenchidos a partir da consulta Receita Federal (protótipo).',
  )
  return true
}

export function runAtlasProtoOrgMethod(
  form: FormDef,
  methodId: string,
  getValue: (key: string) => string | undefined,
  setValue?: (key: string, value: string) => void,
): boolean {
  const isOrgForm = form.id === FORM_ORGANIZACAO || form.id === FORM_PORTAL_ONBOARDING_ORG
  const isValidarCnpj =
    methodId === METHOD_VALIDAR_CNPJ || methodId === METHOD_PORTAL_ORG_VALIDAR_CNPJ
  if (!isOrgForm || !isValidarCnpj) return false
  if (!setValue) {
    alert('Validar CNPJ requer modo de edição com valores em tempo de execução.')
    return true
  }
  runValidarCnpjProtoOrg(getValue, setValue)
  return true
}

function tiposPorGrupoFromCatalog(epicForms: FormDef[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const g of Object.keys(GRUPO_ETAPA)) out[g] = []
  const tdoc = epicForms.find((f) => f.id === FORM_TDOC)
  for (const p of tdoc?.exampleValuePresets ?? []) {
    const fv = p.fieldValues ?? {}
    if (fv['patlasv4proto-tdoc-categoria'] !== 'Organização') continue
    if (fv['patlasv4proto-tdoc-ativo'] === false) continue
    const grupo = fv['mqlh5j3aabnkci']
    const nome = fv['patlasv4proto-tdoc-nome']
    if (typeof grupo !== 'string' || typeof nome !== 'string') continue
    if (!(grupo in out)) continue
    if (!out[grupo].includes(nome)) out[grupo].push(nome)
  }
  return out
}

/** Estrutura da etapa no catálogo `(05.00) Etapa documentacional`. */
function gruposTiposFromCatEtapa(
  epicForms: FormDef[],
  etapaNome: string,
): { grupo: string; tipos: string[] }[] | null {
  const cat = epicForms.find((f) => f.id === FORM_CAT_ETAPA)
  const preset = (cat?.exampleValuePresets ?? []).find((p) => {
    const nome = p.fieldValues?.['patlasv4proto-catetapa-nome']
    const ativo = p.fieldValues?.['patlasv4proto-catetapa-ativo']
    return nome === etapaNome && ativo !== false
  })
  if (!preset) return null
  const grupoRows = preset.embeddedRowsByFieldId?.['patlasv4proto-catetapa-grupos'] ?? []
  if (!grupoRows.length) return null
  const out: { grupo: string; tipos: string[] }[] = []
  for (const row of grupoRows) {
    const grupo = row['patlasv4proto-catetapagrp-grupo']
    if (typeof grupo !== 'string' || !grupo.trim()) continue
    const wrap = row['patlasv4proto-catetapagrp-tipos']
    const tipoRows =
      wrap && typeof wrap === 'object' && 'embeddedDemoInstances' in wrap
        ? ((wrap as { embeddedDemoInstances: EmbeddedDemoRow[] }).embeddedDemoInstances ?? [])
        : []
    const tipos: string[] = []
    for (const tr of tipoRows) {
      const t = tr['patlasv4proto-catetapatipo-tipo']
      if (typeof t === 'string' && t.trim() && !tipos.includes(t)) tipos.push(t)
    }
    out.push({ grupo, tipos })
  }
  return out.length ? out : null
}

function buildEtapaRow(
  etapa: string,
  ordem: number,
  tiposMap: Record<string, string[]>,
  epicForms: FormDef[],
): EmbeddedDemoRow {
  const fromCat = gruposTiposFromCatEtapa(epicForms, etapa)
  const gruposComTipos =
    fromCat ??
    Object.entries(GRUPO_ETAPA)
      .filter(([, e]) => e === etapa)
      .map(([g]) => {
        let tipos = [...(tiposMap[g] ?? [])]
        if (tipos.length === 0 && FALLBACK_TIPOS[g]) tipos = [...FALLBACK_TIPOS[g]]
        return { grupo: g, tipos }
      })

  const grupoRows: EmbeddedDemoRow[] = gruposComTipos.map(({ grupo: g, tipos }) => {
    let lista = [...tipos]
    if (lista.length === 0) {
      lista = [...(tiposMap[g] ?? [])]
      if (lista.length === 0 && FALLBACK_TIPOS[g]) lista = [...FALLBACK_TIPOS[g]]
    }
    const tipoRows: EmbeddedDemoRow[] = lista.map((t) => ({
      mqlh6yafch5jzb: g,
      'patlasv4proto-uodoc-tipo': t,
      'patlasv4proto-uodoc-status-validacao': 'Pendente',
    }))
    return {
      'patlasv4proto-uogrpetapa-grupo': g,
      'patlasv4proto-uogrpetapa-progresso': `0/${tipoRows.length || '—'}`,
      'patlasv4proto-uogrpetapa-tipos': { embeddedDemoInstances: tipoRows },
    }
  })
  const total = grupoRows.reduce((acc, g) => {
    const tipos = g['patlasv4proto-uogrpetapa-tipos']
    if (tipos && typeof tipos === 'object' && 'embeddedDemoInstances' in tipos) {
      return (
        acc +
        ((tipos as { embeddedDemoInstances: unknown[] }).embeddedDemoInstances?.length ?? 0)
      )
    }
    return acc
  }, 0)
  return {
    'patlasv4proto-uoetapa-nome': etapa,
    'patlasv4proto-uoetapa-ordem': ordem,
    'patlasv4proto-uoetapa-ativo': true,
    'patlasv4proto-uoetapa-progresso': `0/${total || '—'}`,
    'patlasv4proto-uoetapa-grupos': { embeddedDemoInstances: grupoRows },
  }
}

/** Interpreta o resumo do canvas (`A / B`) ou array do preset. */
export function parseEtapasSelecionadas(
  runtimeSummary: string | undefined,
  preset: FormExampleValuePreset | undefined,
): string[] {
  const fromRuntime = (runtimeSummary ?? '')
    .split(' / ')
    .map((s) => s.trim())
    .filter(Boolean)
  if (fromRuntime.length) return fromRuntime
  const fv = preset?.fieldValues?.[FIELD_ETAPAS_SELECAO]
  if (Array.isArray(fv)) return fv.map(String).filter(Boolean)
  if (typeof fv === 'string' && fv.trim()) return [fv.trim()]
  return []
}

function nomesEtapasCatalogo(epicForms: FormDef[]): string[] {
  const cat = epicForms.find((f) => f.id === FORM_CAT_ETAPA)
  const fromCat = (cat?.exampleValuePresets ?? [])
    .filter((p) => p.fieldValues?.['patlasv4proto-catetapa-ativo'] !== false)
    .map((p) => p.fieldValues?.['patlasv4proto-catetapa-nome'])
    .filter((n): n is string => typeof n === 'string' && !!n.trim())
  if (fromCat.length) return fromCat
  return [...ETAPAS_DOCUMENTACIONAIS]
}

/** Interpreta chips de Grupos de documentos na Etapa de Documentação. */
export function parseGruposSelecionadosEtapa(
  runtimeSummary: string | undefined,
  preset: FormExampleValuePreset | undefined,
): string[] {
  const fromRuntime = (runtimeSummary ?? '')
    .split(' / ')
    .map((s) => s.trim())
    .filter(Boolean)
  if (fromRuntime.length) return fromRuntime
  const fv = preset?.fieldValues?.[FIELD_CAT_ETAPA_GRUPOS_SELECAO]
  if (Array.isArray(fv)) return fv.map(String).filter(Boolean)
  if (typeof fv === 'string' && fv.trim()) return [fv.trim()]
  return []
}

function buildGrupoNaEtapaRow(
  grupo: string,
  tiposMap: Record<string, string[]>,
): EmbeddedDemoRow {
  let tipos = [...(tiposMap[grupo] ?? [])]
  if (tipos.length === 0 && FALLBACK_TIPOS[grupo]) tipos = [...FALLBACK_TIPOS[grupo]]
  const tipoRows: EmbeddedDemoRow[] = tipos.map((t) => ({
    'patlasv4proto-catetapatipo-tipo': t,
    'patlasv4proto-catetapatipo-obrigatorio': true,
  }))
  return {
    'patlasv4proto-catetapagrp-grupo': grupo,
    'patlasv4proto-catetapagrp-tipos': { embeddedDemoInstances: tipoRows },
  }
}

/**
 * Inclui na Lista de documentos da Etapa de Documentação os grupos selecionados,
 * com cada Tipo de Documento do catálogo MIPP (Obrigatório = Sim por padrão).
 * Não duplica grupo já presente.
 */
export function addSelectedGruposToCatEtapaPreset(
  form: FormDef,
  epicForms: FormDef[],
  selectedGrupos: string[],
): { form: FormDef; added: string[]; skipped: string[] } {
  const known = new Set(Object.keys(GRUPO_ETAPA))
  const valid = selectedGrupos.filter((g) => known.has(g))
  if (!valid.length) {
    return { form, added: [], skipped: [] }
  }
  const active = getActiveExamplePreset(form)
  if (!active) return { form, added: [], skipped: valid }

  const existing = [...(active.embeddedRowsByFieldId?.[FIELD_CAT_ETAPA_LISTA_DOCS] ?? [])]
  const existingNames = new Set(
    existing
      .map((r) => r['patlasv4proto-catetapagrp-grupo'])
      .filter((n): n is string => typeof n === 'string'),
  )
  const tiposMap = tiposPorGrupoFromCatalog(epicForms)
  const added: string[] = []
  const skipped: string[] = []
  for (const grupo of valid) {
    if (existingNames.has(grupo)) {
      skipped.push(grupo)
      continue
    }
    existing.push(buildGrupoNaEtapaRow(grupo, tiposMap))
    existingNames.add(grupo)
    added.push(grupo)
  }
  if (!added.length) return { form, added, skipped }

  const nextPreset: FormExampleValuePreset = {
    ...active,
    fieldValues: {
      ...(active.fieldValues ?? {}),
      [FIELD_CAT_ETAPA_GRUPOS_SELECAO]: valid,
    },
    embeddedRowsByFieldId: {
      ...(active.embeddedRowsByFieldId ?? {}),
      [FIELD_CAT_ETAPA_LISTA_DOCS]: existing,
    },
  }
  const presets = (form.exampleValuePresets ?? []).map((p) =>
    p.id === active.id ? nextPreset : p,
  )
  return {
    form: {
      ...form,
      exampleValuePresets: presets,
      activeExamplePresetId: active.id,
    },
    added,
    skipped,
  }
}

/**
 * Inclui no cenário ativo as etapas selecionadas (com grupos/documentos do catálogo).
 * Não duplica etapa já presente pelo nome.
 */
export function addSelectedEtapasToOrgPreset(
  form: FormDef,
  epicForms: FormDef[],
  selectedEtapas: string[],
): { form: FormDef; added: string[]; skipped: string[] } {
  const known = new Set(nomesEtapasCatalogo(epicForms))
  const valid = selectedEtapas.filter((e) => known.has(e))
  if (!valid.length) {
    return { form, added: [], skipped: [] }
  }
  const active = getActiveExamplePreset(form)
  if (!active) return { form, added: [], skipped: valid }

  const existing = [...(active.embeddedRowsByFieldId?.[FIELD_ETAPAS_INCLUIDAS] ?? [])]
  const existingNames = new Set(
    existing
      .map((r) => r['patlasv4proto-uoetapa-nome'])
      .filter((n): n is string => typeof n === 'string'),
  )
  const tiposMap = tiposPorGrupoFromCatalog(epicForms)
  const added: string[] = []
  const skipped: string[] = []
  let ordem = existing.length
  for (const etapa of valid) {
    if (existingNames.has(etapa)) {
      skipped.push(etapa)
      continue
    }
    ordem += 1
    existing.push(buildEtapaRow(etapa, ordem, tiposMap, epicForms))
    existingNames.add(etapa)
    added.push(etapa)
  }
  if (!added.length) return { form, added, skipped }

  const nextPreset: FormExampleValuePreset = {
    ...active,
    fieldValues: {
      ...(active.fieldValues ?? {}),
      [FIELD_ETAPAS_SELECAO]: valid,
    },
    embeddedRowsByFieldId: {
      ...(active.embeddedRowsByFieldId ?? {}),
      [FIELD_ETAPAS_INCLUIDAS]: existing,
    },
  }
  const presets = (form.exampleValuePresets ?? []).map((p) =>
    p.id === active.id ? nextPreset : p,
  )
  return {
    form: {
      ...form,
      exampleValuePresets: presets,
      activeExamplePresetId: active.id,
    },
    added,
    skipped,
  }
}

export const HTML_VALIDAR_CNPJ = `<div class="proto-validar-cnpj-wrap">
  <p class="proto-validar-cnpj-hint">Consulte a Receita Federal para preencher razão social, inscrições e CNAE.</p>
  <button type="button" class="btn-validar-cnpj" data-action="validar-cnpj">
    <span aria-hidden="true">✓</span> Validar CNPJ
  </button>
</div>
<style>
  .proto-validar-cnpj-wrap { margin: 0 0 4px; }
  .proto-validar-cnpj-hint { margin: 0 0 8px; font-size: 0.85rem; color: #64748b; }
  .btn-validar-cnpj {
    background-color: #6b6b6f;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .btn-validar-cnpj:hover { background-color: #565656; transform: translateY(-1px); }
  .btn-validar-cnpj:active { transform: translateY(0); }
</style>`

export const HTML_ADICIONAR_ETAPAS = `<div class="proto-add-etapas-wrap">
  <button type="button" class="btn-add-etapas" data-action="adicionar-etapas">
    <span aria-hidden="true">+</span> Adicionar
  </button>
</div>
<style>
  .proto-add-etapas-wrap { margin: 0 0 4px; display: flex; align-items: flex-end; min-height: 2.4rem; }
  .btn-add-etapas {
    background-color: #6b6b6f;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 6px 14px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .btn-add-etapas:hover { background-color: #565656; transform: translateY(-1px); }
  .btn-add-etapas:active { transform: translateY(0); }
</style>`
