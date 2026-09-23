import type { Complexidade, PeriodoMinimo, ProdutoParceiro } from './portalParceiroData'

/** CSV do parceiro (validação 17/08): sem custo, markup nem %. Inclui campos Protheus (21/08). */
export const HEADER = [
  'nome',
  'part_number',
  'tipo',
  'grupo',
  'vertical',
  'modelo_venda',
  'cobranca',
  'metrica',
  'valor_unitario',
  'periodo_minimo',
  'complexidade',
  'peso',
  'quantidade_metrica',
  'descricao',
  'codigo_siag',
  'codigo_protheus',
  'nome_cientifico',
  'tipo_protheus',
  'grupo_erp',
  'local_padrao',
  'grupo_tributario',
  'codigo_natureza',
  'origem',
  'imposto_renda',
  'calcula_inss',
  'retem_pis',
  'retem_cofins',
  'retem_csll',
  'conta_contabil',
].join(';')

function escapeCell(v: string | number | boolean | undefined): string {
  const s = v === undefined || v === null ? '' : String(v)
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function produtosToCsv(produtos: ProdutoParceiro[]): string {
  const rows = produtos.map((p) =>
    [
      p.identificador,
      p.partNumber ?? '',
      p.tipo,
      p.grupo ?? '',
      p.categoria ?? '',
      p.modeloVenda ?? '',
      p.cobranca ?? '',
      p.metrica,
      p.valorUnitario,
      p.periodoMinimo ?? '',
      p.complexidade ?? '',
      p.peso ?? '',
      p.quantidadeMetrica ?? '',
      p.descricaoSolucao ?? '',
      p.codigoSiag ?? '',
      p.codigoProtheus ?? '',
      p.nomeCientifico ?? '',
      p.tipoProtheus ?? '',
      p.grupoErp ?? '',
      p.localPadrao ?? '',
      p.grupoTributario ?? '',
      p.codigoNatureza ?? '',
      p.origem ?? '',
      p.impostoRenda ?? '',
      p.calculaInss ?? '',
      p.retemPis ?? '',
      p.retemCofins ?? '',
      p.retemCsll ?? '',
      p.contaContabil ?? '',
    ]
      .map(escapeCell)
      .join(';'),
  )
  return [HEADER, ...rows].join('\n')
}

function parseLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQ = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQ = true
    } else if (ch === ';' || ch === ',') {
      out.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur.trim())
  return out
}

function normTipo(raw: string): ProdutoParceiro['tipo'] {
  const t = raw.toLowerCase()
  if (t.includes('licen')) return 'Licença'
  return 'Serviço'
}

function normCx(raw: string): Complexidade {
  const map: Record<string, Complexidade> = {
    'muito baixa': 'Muito Baixa',
    baixa: 'Baixa',
    média: 'Média',
    media: 'Média',
    alta: 'Alta',
    'muito alta': 'Muito Alta',
  }
  return map[raw.toLowerCase()] ?? (raw as Complexidade) ?? ''
}

function parseNum(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === '') return undefined
  const s = String(raw).trim().replace(/\s/g, '')
  const n = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s)
  return Number.isFinite(n) ? n : undefined
}

export function parseProdutosCsv(
  text: string,
): { ok: true; produtos: ProdutoParceiro[] } | { ok: false; erro: string } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return { ok: false, erro: 'CSV vazio. Use o template oficial (cabeçalho + linhas).' }

  const header = parseLine(lines[0]).map((h) =>
    h
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_'),
  )

  const forbidden = ['custo', 'markup', 'distribuicao_parceiro', 'distribuicao_mti', '%_parceiro', '%_mti']
  if (forbidden.some((f) => header.includes(f))) {
    return {
      ok: false,
      erro: 'CSV do parceiro não pode incluir custo, markup nem percentuais (validação 17/08).',
    }
  }

  const idx = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n)
      if (i >= 0) return i
    }
    return -1
  }

  const iNome = idx('nome', 'produto', 'produto_catalogo', 'identificador')
  if (iNome < 0) return { ok: false, erro: 'Coluna obrigatória ausente: nome' }

  const produtos: ProdutoParceiro[] = []
  for (let li = 1; li < lines.length; li++) {
    const cols = parseLine(lines[li])
    const get = (i: number) => (i >= 0 ? cols[i] ?? '' : '')
    const nome = get(iNome)
    if (!nome) continue
    const tipo = normTipo(get(idx('tipo')))
    produtos.push({
      id: crypto.randomUUID(),
      identificador: nome,
      tipo,
      metrica: get(idx('metrica')) || (tipo === 'Licença' ? 'USN' : 'UST'),
      valorUnitario: parseNum(get(idx('valor_unitario', 'valor'))) ?? 0,
      status: 'Rascunho',
      partNumber: get(idx('part_number', 'sku')) || undefined,
      grupo: get(idx('grupo')) || undefined,
      categoria: get(idx('vertical', 'categoria')) || undefined,
      modeloVenda: get(idx('modelo_venda', 'modelo')) || undefined,
      cobranca: get(idx('cobranca', 'tipo_cobranca')) || undefined,
      periodoMinimo: (get(idx('periodo_minimo')) as PeriodoMinimo) || undefined,
      complexidade: normCx(get(idx('complexidade'))),
      peso: parseNum(get(idx('peso'))),
      quantidadeMetrica: parseNum(get(idx('quantidade_metrica', 'qtd_metrica'))),
      descricaoSolucao: get(idx('descricao', 'descricao_solucao')) || undefined,
      codigoSiag: get(idx('codigo_siag', 'siag')) || undefined,
      codigoProtheus: get(idx('codigo_protheus', 'protheus')) || undefined,
      nomeCientifico: get(idx('nome_cientifico')) || undefined,
      tipoProtheus: get(idx('tipo_protheus')) || undefined,
      grupoErp: get(idx('grupo_erp')) || undefined,
      localPadrao: get(idx('local_padrao')) || undefined,
      grupoTributario: get(idx('grupo_tributario')) || undefined,
      codigoNatureza: get(idx('codigo_natureza')) || undefined,
      origem: get(idx('origem')) || undefined,
      impostoRenda: get(idx('imposto_renda')) || undefined,
      calculaInss: get(idx('calcula_inss')) || undefined,
      retemPis: get(idx('retem_pis')) || undefined,
      retemCofins: get(idx('retem_cofins')) || undefined,
      retemCsll: get(idx('retem_csll')) || undefined,
      contaContabil: get(idx('conta_contabil')) || undefined,
    })
  }

  if (produtos.length === 0) return { ok: false, erro: 'Nenhuma linha de produto válida.' }
  return { ok: true, produtos }
}

export function csvTemplate(): string {
  return [
    HEADER,
    'Elaborar plano de projeto;;Serviço;Análise e Modelagem de Processos;Automação e Processos;Por serviço;Mensal;UST;15000;12 meses;Média;;1;Escopo de planejamento;;',
    'Licença plataforma;;Licença;Análise e Modelagem de Processos;;Perpétuo;Única;USN;45000;12 meses;;;;Licença perpétua;;',
  ].join('\n')
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function produtosToPdfHtml(
  produtos: ProdutoParceiro[],
  meta: { catalogo: string; versao: string; parceria: string },
): string {
  const rows = produtos
    .map(
      (p) =>
        `<tr><td>${p.identificador}</td><td>${p.tipo}</td><td>${p.grupo ?? ''}</td><td>${p.metrica}</td><td>${p.valorUnitario}</td><td>${p.periodoMinimo ?? ''}</td></tr>`,
    )
    .join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${meta.catalogo}</title>
  <style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px;font-size:12px}th{background:#003366;color:#fff}</style>
  </head><body>
  <h1>${meta.catalogo} v${meta.versao}</h1>
  <p>Parceria: ${meta.parceria}</p>
  <table><thead><tr><th>Produto</th><th>Tipo</th><th>Grupo</th><th>Métrica</th><th>Valor</th><th>Período mín.</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <p><small>Exportação portal parceiro — sem custo/markup/% (MTI complementa no backoffice).</small></p>
  </body></html>`
}
