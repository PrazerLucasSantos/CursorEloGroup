import type { ReactNode } from 'react'
import { parseSpecMarkdownLine, splitSpecMarkdownBlocks } from '../utils/specMarkdown'

function lineToNodes(line: string, keyPrefix: string): ReactNode[] {
  const segs = parseSpecMarkdownLine(line)
  return segs.map((s, i) => {
    if (s.kind === 'text') return s.text
    if (s.kind === 'bold') return <strong key={`${keyPrefix}-b${i}`}>{s.text}</strong>
    return <code key={`${keyPrefix}-c${i}`}>{s.text}</code>
  })
}

/** Detalhamento (`spec`) em modo leitura: **negrito**, `` `código` ``, parágrafos por linha em branco. */
export default function FieldSpecMarkdown({ text }: { text: string }) {
  const blocks = splitSpecMarkdownBlocks(text)
  return (
    <div className="canvas__spec-markdown-root">
      {blocks.map((block, bi) => {
        const lines = block.split('\n')
        return (
          <p key={`md-p-${bi}`} className="canvas__spec-text canvas__spec-md-p">
            {lines.flatMap((line, li) =>
              [
                ...(li > 0 ? [<br key={`${bi}-br-${li}`} />] : []),
                ...lineToNodes(line, `${bi}-${li}`),
              ] as ReactNode[],
            )}
          </p>
        )
      })}
    </div>
  )
}
