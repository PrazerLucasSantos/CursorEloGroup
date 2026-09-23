export type SpecSegment = { kind: 'text'; text: string } | { kind: 'bold'; text: string } | { kind: 'code'; text: string }

function mergeAdjacentText(segments: SpecSegment[]): SpecSegment[] {
  const out: SpecSegment[] = []
  for (const s of segments) {
    const last = out[out.length - 1]
    if (s.kind === 'text' && last?.kind === 'text') {
      out[out.length - 1] = { kind: 'text', text: last.text + s.text }
    } else {
      out.push(s)
    }
  }
  return out
}

/** Blocos separados por linha em branco (como parágrafos em Markdown). */
export function splitSpecMarkdownBlocks(text: string): string[] {
  return text.trimEnd().split(/\n(?:[ \t]*\n)+/)
}

/**
 * Reconhece na linha: `**negrito**` e `` `código` ``.
 * Texto sem fechamento correspondente permanece literal.
 */
export function parseSpecMarkdownLine(line: string): SpecSegment[] {
  if (line.length === 0) return []
  const segments: SpecSegment[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '`') {
      const close = line.indexOf('`', i + 1)
      if (close !== -1) {
        segments.push({ kind: 'code', text: line.slice(i + 1, close) })
        i = close + 1
        continue
      }
    }
    if (line[i] === '*' && line[i + 1] === '*') {
      const close = line.indexOf('**', i + 2)
      if (close !== -1) {
        segments.push({ kind: 'bold', text: line.slice(i + 2, close) })
        i = close + 2
        continue
      }
    }
    let j = i + 1
    while (j < line.length) {
      if (line[j] === '`') break
      if (line[j] === '*' && line[j + 1] === '*') break
      j += 1
    }
    segments.push({ kind: 'text', text: line.slice(i, j) })
    i = j
  }
  return mergeAdjacentText(segments)
}

export function segmentsToHtml(segments: SpecSegment[], escHtml: (s: string) => string): string {
  return segments
    .map((s) => {
      if (s.kind === 'text') return escHtml(s.text)
      if (s.kind === 'bold') return `<strong>${escHtml(s.text)}</strong>`
      return `<code>${escHtml(s.text)}</code>`
    })
    .join('')
}

/** HTML do detalhamento para export (parágrafos + quebras simples). */
export function specMarkdownToExportHtml(text: string, escHtml: (s: string) => string): string {
  const blocks = splitSpecMarkdownBlocks(text)
  const body = blocks
    .map((block) => {
      const lines = block.split('\n')
      const inner = lines.map((ln) => segmentsToHtml(parseSpecMarkdownLine(ln), escHtml)).join('<br />\n')
      return `            <p class="canvas__spec-text canvas__spec-md-p">${inner}</p>`
    })
    .join('\n')
  return `          <div class="canvas__spec-markdown-root">\n${body}\n          </div>`
}
