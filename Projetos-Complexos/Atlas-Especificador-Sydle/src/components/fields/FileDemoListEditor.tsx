import type { FieldDemoValue, FileDemoItem } from '../../types'
import { filesFromDemo } from '../../utils/fieldDemoValue'

interface Props {
  value: FieldDemoValue | undefined
  onChange: (next: FieldDemoValue | undefined) => void
}

function normalizeCommit(list: FileDemoItem[]): FieldDemoValue | undefined {
  const kept = list.filter((x) => x.name.trim() || x.kind.trim())
  return kept.length > 0 ? kept : undefined
}

export default function FileDemoListEditor({ value, onChange }: Props) {
  const list = filesFromDemo(value)

  function patchRow(index: number, patch: Partial<FileDemoItem>) {
    const next = list.map((row, i) => (i === index ? { ...row, ...patch } : row))
    onChange(normalizeCommit(next))
  }

  function removeRow(index: number) {
    const next = list.filter((_, i) => i !== index)
    onChange(normalizeCommit(next))
  }

  function addRow() {
    onChange([...list, { name: '', kind: '' }])
  }

  return (
    <div className="acc__file-demo-list">
      {list.length === 0 ? (
        <p className="acc__nested-hint acc__file-demo-empty">Nenhum arquivo neste cenário.</p>
      ) : (
        <ul className="acc__file-demo-items">
          {list.map((row, index) => (
            <li key={`file-demo-${index}`} className="acc__file-demo-row">
              <input
                type="text"
                className="acc__input"
                placeholder="Nome do arquivo"
                aria-label={`Arquivo ${index + 1} — nome`}
                value={row.name}
                onChange={(e) => patchRow(index, { name: e.target.value })}
              />
              <input
                type="text"
                className="acc__input acc__file-demo-kind"
                placeholder="Tipo (ex.: pdf)"
                aria-label={`Arquivo ${index + 1} — tipo`}
                value={row.kind}
                onChange={(e) => patchRow(index, { kind: e.target.value })}
              />
              <button
                type="button"
                className="acc__file-demo-remove"
                aria-label={`Remover arquivo ${index + 1}`}
                onClick={() => removeRow(index)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="sidebar__add-btn acc__file-demo-add" onClick={addRow}>
        <span className="sidebar__add-icon">+</span>
        Adicionar arquivo
      </button>
    </div>
  )
}
