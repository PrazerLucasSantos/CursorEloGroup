#!/usr/bin/env node
/**
 * Converte detalhe da demanda (acordeão) → modal Carta Consulta (abas + Sim/Não).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(root, 'src/portalCliente/DemandasPage.tsx')
let s = fs.readFileSync(file, 'utf8')

const oldAcc = `/** Acordeão Sydle — mesmo visual do cadastro org / formulário MTI (sem cards). */
function DemandaAccordion({
  id,
  title,
  icon,
  openIds,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: string
  openIds: string[]
  onToggle: (id: string) => void
  children: ReactNode
}) {
  const open = openIds.includes(id)
  return (
    <div className={\`sy-accordion__item\${open ? ' sy-accordion__item--open' : ''}\`}>
      <button
        type="button"
        className="sy-accordion__trigger"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined" aria-hidden>
          {icon}
        </span>
        <span className="sy-accordion__title">{title}</span>
        <span className="material-symbols-outlined sy-accordion__chevron" aria-hidden>
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open ? <div className="sy-accordion__panel">{children}</div> : null}
    </div>
  )
}`

const newAcc = `const DEMANDA_DETAIL_TABS = [
  { id: 'acoes', title: 'Ações' },
  { id: 'andamento', title: 'Andamento' },
  { id: 'identificacao', title: 'Dados da Demanda' },
  { id: 'necessidade', title: 'Necessidade' },
  { id: 'fila', title: 'Fila' },
  { id: 'parceiro', title: 'Parceiro' },
  { id: 'analise', title: 'Análise' },
  { id: 'atendimento', title: 'Atendimento' },
  { id: 'assinaturas', title: 'Assinaturas' },
  { id: 'entregavel', title: 'Homologação' },
  { id: 'os-orc', title: 'OS / Orçamento' },
  { id: 'historico', title: 'Histórico' },
] as const

/** Painel de aba — layout modal Carta Consulta / Sydle. */
function DemandaTabPanel({
  id,
  activeId,
  children,
}: {
  id: string
  activeId: string
  children: ReactNode
}) {
  if (activeId !== id) return null
  return (
    <div
      className="sy-carta-tabpanel"
      role="tabpanel"
      id={\`dem-tab-\${id}\`}
      aria-labelledby={\`dem-tab-btn-\${id}\`}
    >
      {children}
    </div>
  )
}

/** Controle Sim/Não (segmentado) — revela campos da ação abaixo. */
function SySimNao({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean) => void
  required?: boolean
}) {
  return (
    <div className="sy-sim-nao-field">
      <span className="sy-dem-label">
        {label}
        {required ? <span className="pc-req"> *</span> : null}
      </span>
      <div className="sy-sim-nao" role="group" aria-label={label}>
        <button
          type="button"
          className={\`sy-sim-nao__btn\${value === true ? ' is-on' : ''}\`}
          aria-pressed={value === true}
          onClick={() => onChange(true)}
        >
          Sim
        </button>
        <button
          type="button"
          className={\`sy-sim-nao__btn\${value === false ? ' is-on' : ''}\`}
          aria-pressed={value === false}
          onClick={() => onChange(false)}
        >
          Não
        </button>
      </div>
    </div>
  )
}`

if (!s.includes('function DemandaAccordion')) {
  console.error('DemandaAccordion not found')
  process.exit(1)
}
s = s.replace(oldAcc, newAcc)

s = s.replace(
  `  const [detailAccOpen, setDetailAccOpen] = useState<string[]>([
    'andamento',
    'identificacao',
    'necessidade',
  ])`,
  `  const [detailTab, setDetailTab] = useState<string>('acoes')`,
)

const toggleFn = `  function toggleDetailAcc(id: string) {
    setDetailAccOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
`
if (s.includes('toggleDetailAcc')) {
  s = s.replace(toggleFn, '')
}

s = s.replace(
  `  function abrirDetalhe(id: string) {
    setSelecionadaId(id)
    setPainel('detalhe')
    setCriando(false)
    setAcaoAtiva(null)`,
  `  function abrirDetalhe(id: string) {
    setSelecionadaId(id)
    setPainel('detalhe')
    setCriando(false)
    setAcaoAtiva(null)
    setDetailTab('acoes')`,
)

// Convert DemandaAccordion openings to DemandaTabPanel
s = s.replace(
  /<DemandaAccordion\r?\n\s+id="([^"]+)"\r?\n\s+title="[^"]*"\r?\n\s+icon="[^"]*"\r?\n\s+openIds=\{detailAccOpen\}\r?\n\s+onToggle=\{toggleDetailAcc\}\r?\n\s*>/g,
  '<DemandaTabPanel id="$1" activeId={detailTab}>',
)
s = s.replace(/<\/DemandaAccordion>/g, '</DemandaTabPanel>')

fs.writeFileSync(file, s)
console.log('OK DemandasPage patched helpers + tab panels')
