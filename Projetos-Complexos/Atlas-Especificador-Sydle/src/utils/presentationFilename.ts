/** Normaliza texto para segmentos de nome de ficheiro (minúsculas, hífens, sem acentos). */
export function slugifyForExportFilenameSegment(raw: string): string {
  let s = raw.trim()
  if (!s) return ''
  s = s.replace(/ç/g, 'c').replace(/Ç/g, 'c')
  s = s.normalize('NFD').replace(/\p{M}/gu, '')
  s = s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
  return s
}

/** Sugestão predefinida: `apresentacao-{nome-do-fluxo-normalizado}`. */
export function defaultExportBasename(flowName: string): string {
  const slug = slugifyForExportFilenameSegment(flowName)
  return slug ? `apresentacao-${slug}` : 'apresentacao'
}

/** Aplica as mesmas regras ao valor introduzido pelo utilizador (remove `.json` se existir). */
export function sanitizeExportBasename(input: string): string {
  let s = input.trim().replace(/\.json$/i, '')
  s = slugifyForExportFilenameSegment(s)
  return s || 'apresentacao'
}

/** Nome final do arquivo no disco (com extensão). */
export function toExportJsonFilename(basename: string): string {
  return `${sanitizeExportBasename(basename)}.json`
}

const STEM_SAFE = /[^a-zA-Z0-9._\-]/g

function stemFromPresentationJsonBasename(jsonBasename: string): string {
  const name = jsonBasename.trim().replace(/\\/g, '/').split('/').pop() ?? ''
  const stem = name.replace(/\.json$/i, '') || 'apresentacao'
  const safe = stem.replace(STEM_SAFE, '_')
  return safe || 'apresentacao'
}

/** Nome do .zip em `exports/zips/`, alinhado ao script `zip-presentation-export.mjs`. */
export function zipFilenameFromPresentationJson(jsonBasename: string): string {
  return `${stemFromPresentationJsonBasename(jsonBasename)}.zip`
}

/** Caminho relativo do ZIP (ex.: `exports/zips/apresentacao-meu-fluxo.zip`). */
export function zipRelativeExportPathFromPresentationJson(jsonBasename: string): string {
  return `exports/zips/${zipFilenameFromPresentationJson(jsonBasename)}`
}
