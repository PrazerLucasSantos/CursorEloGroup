import type { ReactNode } from 'react'
import { PALETA_DASH } from './dashVizModes'

export type Slice = { label: string; value: number; color?: string }
export type SeriesRow = { label: string; values: number[] }

const W = 320
const H = 180
const PAD = { t: 12, r: 12, b: 36, l: 36 }

function maxOf(nums: number[]) {
  return Math.max(1, ...nums)
}

function colorAt(i: number, override?: string) {
  return override ?? PALETA_DASH[i % PALETA_DASH.length]
}

/** Métrica — cartão KPI. */
export function VizMetrica({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="pc-viz-metric">
      <span className="pc-viz-metric__value">{value}</span>
      <span className="pc-viz-metric__label">{label}</span>
      {hint ? <span className="pc-viz-metric__hint">{hint}</span> : null}
    </div>
  )
}

/** Pizza / Rosca */
export function VizPizza({
  slices,
  donut = false,
}: {
  slices: Slice[]
  donut?: boolean
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  const cx = 90
  const cy = 90
  const r = 70
  const ir = donut ? 40 : 0
  let angle = -Math.PI / 2
  const paths: ReactNode[] = []
  slices.forEach((sl, i) => {
    const sweep = (sl.value / total) * Math.PI * 2
    const a1 = angle
    const a2 = angle + sweep
    angle = a2
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const x2 = cx + r * Math.cos(a2)
    const y2 = cy + r * Math.sin(a2)
    const large = sweep > Math.PI ? 1 : 0
    if (ir <= 0) {
      paths.push(
        <path
          key={i}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
          fill={colorAt(i, sl.color)}
        />,
      )
    } else {
      const ix1 = cx + ir * Math.cos(a1)
      const iy1 = cy + ir * Math.sin(a1)
      const ix2 = cx + ir * Math.cos(a2)
      const iy2 = cy + ir * Math.sin(a2)
      paths.push(
        <path
          key={i}
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`}
          fill={colorAt(i, sl.color)}
        />,
      )
    }
  })
  return (
    <div className="pc-viz-pie-wrap">
      <svg viewBox="0 0 180 180" className="pc-viz-svg pc-viz-svg--pie" role="img">
        {paths}
        {donut ? (
          <text x={cx} y={cy + 5} textAnchor="middle" className="pc-viz-svg-center">
            {total}
          </text>
        ) : null}
      </svg>
      <ul className="pc-viz-legend">
        {slices.map((sl, i) => (
          <li key={sl.label}>
            <i style={{ background: colorAt(i, sl.color) }} />
            <span>
              {sl.label} · {sl.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AxisFrame({
  children,
  xLabels,
}: {
  children: ReactNode
  xLabels: string[]
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pc-viz-svg" role="img">
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ih} className="pc-viz-axis" />
      <line
        x1={PAD.l}
        y1={PAD.t + ih}
        x2={PAD.l + iw}
        y2={PAD.t + ih}
        className="pc-viz-axis"
      />
      {children}
      {xLabels.map((lb, i) => {
        const x =
          xLabels.length <= 1
            ? PAD.l + iw / 2
            : PAD.l + (i / (xLabels.length - 1)) * iw
        return (
          <text key={`${lb}-${i}`} x={x} y={H - 10} textAnchor="middle" className="pc-viz-tick">
            {lb.length > 8 ? `${lb.slice(0, 7)}…` : lb}
          </text>
        )
      })}
    </svg>
  )
}

/** Colunas / Barras simples */
export function VizColunas({
  items,
  horizontal = false,
}: {
  items: Slice[]
  horizontal?: boolean
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const max = maxOf(items.map((x) => x.value))
  if (horizontal) {
    const gap = 4
    const barH = Math.max(8, (ih - gap * (items.length - 1)) / Math.max(1, items.length))
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="pc-viz-svg" role="img">
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ih} className="pc-viz-axis" />
        <line
          x1={PAD.l}
          y1={PAD.t + ih}
          x2={PAD.l + iw}
          y2={PAD.t + ih}
          className="pc-viz-axis"
        />
        {items.map((it, i) => {
          const bw = (it.value / max) * iw
          const y = PAD.t + i * (barH + gap)
          return (
            <g key={it.label}>
              <rect
                x={PAD.l}
                y={y}
                width={bw}
                height={barH}
                rx={2}
                fill={colorAt(i, it.color)}
              />
              <text x={PAD.l - 4} y={y + barH / 2 + 3} textAnchor="end" className="pc-viz-tick">
                {it.label.length > 6 ? `${it.label.slice(0, 5)}…` : it.label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }
  const gap = 6
  const barW = Math.max(10, (iw - gap * (items.length - 1)) / Math.max(1, items.length))
  return (
    <AxisFrame xLabels={items.map((x) => x.label)}>
      {items.map((it, i) => {
        const bh = (it.value / max) * ih
        const x = PAD.l + i * (barW + gap)
        return (
          <rect
            key={it.label}
            x={x}
            y={PAD.t + ih - bh}
            width={barW}
            height={bh}
            rx={2}
            fill={colorAt(i, it.color)}
          />
        )
      })}
    </AxisFrame>
  )
}

/** Empilhadas / 100% / clusterizadas — colunas ou barras */
export function VizEmpilhadas({
  rows,
  seriesNames,
  mode,
  orientation = 'colunas',
}: {
  rows: SeriesRow[]
  seriesNames: string[]
  mode: 'empilhada' | 'pct' | 'cluster'
  orientation?: 'colunas' | 'barras'
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const nSeries = seriesNames.length

  if (orientation === 'barras') {
    const gap = 5
    const groupH = Math.max(14, (ih - gap * (rows.length - 1)) / Math.max(1, rows.length))
    return (
      <div className="pc-viz-with-legend">
        <svg viewBox={`0 0 ${W} ${H}`} className="pc-viz-svg" role="img">
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ih} className="pc-viz-axis" />
          <line
            x1={PAD.l}
            y1={PAD.t + ih}
            x2={PAD.l + iw}
            y2={PAD.t + ih}
            className="pc-viz-axis"
          />
          {rows.map((row, ri) => {
            const y0 = PAD.t + ri * (groupH + gap)
            const total = row.values.reduce((a, b) => a + b, 0) || 1
            if (mode === 'cluster') {
              const max = maxOf(row.values)
              const barH = groupH / nSeries - 1
              return row.values.map((v, si) => {
                const bw = (v / max) * iw
                return (
                  <rect
                    key={`${ri}-${si}`}
                    x={PAD.l}
                    y={y0 + si * (barH + 1)}
                    width={bw}
                    height={barH}
                    fill={colorAt(si)}
                  />
                )
              })
            }
            let x = PAD.l
            return row.values.map((v, si) => {
              const bw = mode === 'pct' ? (v / total) * iw : (v / maxOf(rows.flatMap((r) => r.values))) * iw
              const el = (
                <rect key={`${ri}-${si}`} x={x} y={y0} width={bw} height={groupH} fill={colorAt(si)} />
              )
              x += bw
              return el
            })
          })}
          {rows.map((row, ri) => (
            <text
              key={row.label}
              x={PAD.l - 4}
              y={PAD.t + ri * (groupH + gap) + groupH / 2 + 3}
              textAnchor="end"
              className="pc-viz-tick"
            >
              {row.label.length > 5 ? `${row.label.slice(0, 4)}…` : row.label}
            </text>
          ))}
        </svg>
        <Legend seriesNames={seriesNames} />
      </div>
    )
  }

  const gap = 8
  const groupW = Math.max(16, (iw - gap * (rows.length - 1)) / Math.max(1, rows.length))
  const globalMax =
    mode === 'cluster'
      ? maxOf(rows.flatMap((r) => r.values))
      : maxOf(rows.map((r) => r.values.reduce((a, b) => a + b, 0)))

  return (
    <div className="pc-viz-with-legend">
      <AxisFrame xLabels={rows.map((r) => r.label)}>
        {rows.map((row, ri) => {
          const x0 = PAD.l + ri * (groupW + gap)
          const total = row.values.reduce((a, b) => a + b, 0) || 1
          if (mode === 'cluster') {
            const barW = groupW / nSeries - 1
            return row.values.map((v, si) => {
              const bh = (v / globalMax) * ih
              return (
                <rect
                  key={`${ri}-${si}`}
                  x={x0 + si * (barW + 1)}
                  y={PAD.t + ih - bh}
                  width={barW}
                  height={bh}
                  fill={colorAt(si)}
                />
              )
            })
          }
          let y = PAD.t + ih
          return row.values.map((v, si) => {
            const bh = mode === 'pct' ? (v / total) * ih : (v / globalMax) * ih
            y -= bh
            return (
              <rect key={`${ri}-${si}`} x={x0} y={y} width={groupW} height={bh} fill={colorAt(si)} />
            )
          })
        })}
      </AxisFrame>
      <Legend seriesNames={seriesNames} />
    </div>
  )
}

function Legend({ seriesNames }: { seriesNames: string[] }) {
  return (
    <ul className="pc-viz-legend pc-viz-legend--inline">
      {seriesNames.map((n, i) => (
        <li key={n}>
          <i style={{ background: colorAt(i) }} />
          <span>{n}</span>
        </li>
      ))}
    </ul>
  )
}

/** Linhas / linhas clusterizadas */
export function VizLinhas({
  rows,
  seriesNames,
  clustered = false,
}: {
  rows: SeriesRow[]
  seriesNames: string[]
  clustered?: boolean
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const max = maxOf(rows.flatMap((r) => r.values))
  const n = Math.max(1, rows.length - 1)
  const seriesCount = clustered ? seriesNames.length : 1

  const linePath = (si: number) => {
    const pts = rows.map((row, ri) => {
      const x = PAD.l + (ri / n) * iw
      const y = PAD.t + ih - ((row.values[si] ?? 0) / max) * ih
      return `${x},${y}`
    })
    return `M ${pts.join(' L ')}`
  }

  return (
    <div className="pc-viz-with-legend">
      <AxisFrame xLabels={rows.map((r) => r.label)}>
        {Array.from({ length: seriesCount }, (_, si) => (
          <g key={si}>
            <path d={linePath(si)} fill="none" stroke={colorAt(si)} strokeWidth={2} />
            {rows.map((row, ri) => {
              const x = PAD.l + (ri / n) * iw
              const y = PAD.t + ih - ((row.values[si] ?? 0) / max) * ih
              return <circle key={ri} cx={x} cy={y} r={3} fill={colorAt(si)} />
            })}
          </g>
        ))}
      </AxisFrame>
      {clustered ? <Legend seriesNames={seriesNames} /> : null}
    </div>
  )
}

/** Área / áreas empilhadas / clusterizadas */
export function VizArea({
  rows,
  seriesNames,
  mode,
}: {
  rows: SeriesRow[]
  seriesNames: string[]
  mode: 'simples' | 'empilhada' | 'cluster'
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const n = Math.max(1, rows.length - 1)

  if (mode === 'simples') {
    const max = maxOf(rows.map((r) => r.values[0] ?? 0))
    const top = rows.map((row, ri) => {
      const x = PAD.l + (ri / n) * iw
      const y = PAD.t + ih - ((row.values[0] ?? 0) / max) * ih
      return `${x},${y}`
    })
    const base = `${PAD.l + iw},${PAD.t + ih} ${PAD.l},${PAD.t + ih}`
    return (
      <AxisFrame xLabels={rows.map((r) => r.label)}>
        <path
          d={`M ${top.join(' L ')} L ${base} Z`}
          fill={colorAt(0)}
          fillOpacity={0.35}
          stroke={colorAt(0)}
          strokeWidth={1.5}
        />
      </AxisFrame>
    )
  }

  if (mode === 'cluster') {
    const max = maxOf(rows.flatMap((r) => r.values))
    return (
      <div className="pc-viz-with-legend">
        <AxisFrame xLabels={rows.map((r) => r.label)}>
          {seriesNames.map((_, si) => {
            const top = rows.map((row, ri) => {
              const x = PAD.l + (ri / n) * iw
              const y = PAD.t + ih - ((row.values[si] ?? 0) / max) * ih
              return `${x},${y}`
            })
            const base = `${PAD.l + iw},${PAD.t + ih} ${PAD.l},${PAD.t + ih}`
            return (
              <path
                key={si}
                d={`M ${top.join(' L ')} L ${base} Z`}
                fill={colorAt(si)}
                fillOpacity={0.25}
                stroke={colorAt(si)}
                strokeWidth={1.2}
              />
            )
          })}
        </AxisFrame>
        <Legend seriesNames={seriesNames} />
      </div>
    )
  }

  // empilhada
  const totals = rows.map((r) => r.values.reduce((a, b) => a + b, 0))
  const max = maxOf(totals)
  const cum: number[][] = rows.map(() => [])
  seriesNames.forEach((_, si) => {
    rows.forEach((row, ri) => {
      const prev = si === 0 ? 0 : (cum[ri][si - 1] ?? 0)
      cum[ri][si] = prev + (row.values[si] ?? 0)
    })
  })

  return (
    <div className="pc-viz-with-legend">
      <AxisFrame xLabels={rows.map((r) => r.label)}>
        {[...seriesNames].reverse().map((_, revI) => {
          const si = seriesNames.length - 1 - revI
          const top = rows.map((_, ri) => {
            const x = PAD.l + (ri / n) * iw
            const y = PAD.t + ih - ((cum[ri][si] ?? 0) / max) * ih
            return `${x},${y}`
          })
          const bottom =
            si === 0
              ? rows.map((_, ri) => {
                  const x = PAD.l + ((rows.length - 1 - ri) / n) * iw
                  return `${x},${PAD.t + ih}`
                })
              : [...rows]
                  .reverse()
                  .map((_, rrev) => {
                    const ri = rows.length - 1 - rrev
                    const x = PAD.l + (ri / n) * iw
                    const y = PAD.t + ih - ((cum[ri][si - 1] ?? 0) / max) * ih
                    return `${x},${y}`
                  })
          return (
            <path
              key={si}
              d={`M ${top.join(' L ')} L ${bottom.join(' L ')} Z`}
              fill={colorAt(si)}
              fillOpacity={0.55}
              stroke={colorAt(si)}
              strokeWidth={1}
            />
          )
        })}
      </AxisFrame>
      <Legend seriesNames={seriesNames} />
    </div>
  )
}

/** Colunas + linha */
export function VizColunasLinhas({
  rows,
  seriesNames,
}: {
  rows: SeriesRow[]
  seriesNames: string[]
}) {
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const gap = 8
  const groupW = Math.max(16, (iw - gap * (rows.length - 1)) / Math.max(1, rows.length))
  const maxBar = maxOf(rows.map((r) => r.values[0] ?? 0))
  const maxLine = maxOf(rows.map((r) => r.values[1] ?? 0))
  const n = Math.max(1, rows.length - 1)

  return (
    <div className="pc-viz-with-legend">
      <AxisFrame xLabels={rows.map((r) => r.label)}>
        {rows.map((row, ri) => {
          const bh = ((row.values[0] ?? 0) / maxBar) * ih
          const x = PAD.l + ri * (groupW + gap)
          return (
            <rect
              key={ri}
              x={x}
              y={PAD.t + ih - bh}
              width={groupW}
              height={bh}
              fill={colorAt(0)}
              opacity={0.85}
            />
          )
        })}
        <path
          d={`M ${rows
            .map((row, ri) => {
              const x = PAD.l + (ri / n) * iw
              const y = PAD.t + ih - ((row.values[1] ?? 0) / maxLine) * ih
              return `${x},${y}`
            })
            .join(' L ')}`}
          fill="none"
          stroke={colorAt(1)}
          strokeWidth={2}
        />
        {rows.map((row, ri) => {
          const x = PAD.l + (ri / n) * iw
          const y = PAD.t + ih - ((row.values[1] ?? 0) / maxLine) * ih
          return <circle key={`c-${ri}`} cx={x} cy={y} r={3.5} fill={colorAt(1)} />
        })}
      </AxisFrame>
      <Legend seriesNames={seriesNames} />
    </div>
  )
}

/** Mapa de bolhas — fluxo por estágio */
export function VizMapaBolhas({ items }: { items: Slice[] }) {
  const max = maxOf(items.map((x) => x.value))
  const cols = 4
  return (
    <svg viewBox="0 0 320 180" className="pc-viz-svg" role="img">
      <rect x={0} y={0} width={320} height={180} fill="#f8fafc" rx={6} />
      {items.map((it, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const cx = 40 + col * 75
        const cy = 40 + row * 70
        const r = 8 + (it.value / max) * 22
        return (
          <g key={it.label}>
            <circle cx={cx} cy={cy} r={r} fill={colorAt(i)} fillOpacity={0.55} stroke={colorAt(i)} />
            <text x={cx} y={cy + 4} textAnchor="middle" className="pc-viz-bubble-val">
              {it.value}
            </text>
            <text x={cx} y={cy + r + 12} textAnchor="middle" className="pc-viz-tick">
              {it.label.length > 10 ? `${it.label.slice(0, 9)}…` : it.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Mapa de marcadores — pipeline */
export function VizMapaMarcadores({ items }: { items: Slice[] }) {
  const n = Math.max(1, items.length - 1)
  return (
    <svg viewBox="0 0 320 120" className="pc-viz-svg" role="img">
      <line x1={24} y1={48} x2={296} y2={48} className="pc-viz-axis" strokeWidth={2} />
      {items.map((it, i) => {
        const x = 24 + (i / n) * 272
        return (
          <g key={it.label}>
            <circle cx={x} cy={48} r={10} fill={colorAt(i)} stroke="#fff" strokeWidth={2} />
            <text x={x} y={52} textAnchor="middle" className="pc-viz-bubble-val">
              {it.value}
            </text>
            <text x={x} y={78} textAnchor="middle" className="pc-viz-tick">
              {it.label.length > 9 ? `${it.label.slice(0, 8)}…` : it.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function VizTabela({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | number)[][]
}) {
  return (
    <div className="pc-viz-table-wrap">
      <table className="pc-viz-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function VizCards({
  cards,
}: {
  cards: { title: string; subtitle?: string; badge?: string; meta?: string }[]
}) {
  return (
    <ul className="pc-viz-cards">
      {cards.map((c) => (
        <li key={c.title + (c.meta ?? '')}>
          <strong>{c.title}</strong>
          {c.badge ? <span className="pc-viz-cards__badge">{c.badge}</span> : null}
          {c.subtitle ? <p>{c.subtitle}</p> : null}
          {c.meta ? <em>{c.meta}</em> : null}
        </li>
      ))}
    </ul>
  )
}

export function VizPainel({
  titulo,
  modo,
  children,
}: {
  titulo: string
  modo: string
  children: ReactNode
}) {
  return (
    <article className="pc-viz-panel" data-modo={modo}>
      <header className="pc-viz-panel__head">
        <h3>{titulo}</h3>
        <span className="pc-viz-panel__modo">{modo}</span>
      </header>
      <div className="pc-viz-panel__body">{children}</div>
    </article>
  )
}
