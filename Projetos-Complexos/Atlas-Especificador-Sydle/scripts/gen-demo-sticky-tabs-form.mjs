import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const lorem = () =>
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. '.repeat(
    4,
  )

const sections = [
  { id: 'sec-demo-a', title: 'Alfa — secção longa', icon: 'looks_one' },
  { id: 'sec-demo-b', title: 'Bravo — secção longa', icon: 'looks_two' },
  { id: 'sec-demo-c', title: 'Charlie — secção longa', icon: 'looks_3' },
  { id: 'sec-demo-d', title: 'Delta — secção longa', icon: 'looks_4' },
  { id: 'sec-demo-e', title: 'Echo — secção longa', icon: 'looks_5' },
]

const sizes = ['small', 'medium', 'large', 'small']
const fields = []

for (let si = 0; si < sections.length; si++) {
  const sec = sections[si]
  const sid = sec.id
  const letter = String.fromCharCode(65 + si)
  fields.push({
    id: `demo-html-${sid}`,
    type: 'html',
    label: 'Intro',
    size: 'large',
    readOnly: false,
    required: false,
    multiple: false,
    relevance: 'common',
    htmlContent: `<p style="margin:0 0 0.5rem;font-size:0.78rem;line-height:1.5;color:#475569;"><strong>Secção ${letter}</strong> — role o miolo: a linha de <strong>abas</strong> deve ficar colada ao topo da área rolável (sticky).</p><p style="margin:0;font-size:0.78rem;line-height:1.5;color:#64748b;">${lorem()}</p>`,
    sectionId: sid,
  })
  for (let i = 0; i < 20; i++) {
    const long = i % 4 === 3
    fields.push({
      id: `demo-${sid}-f${String(i + 1).padStart(2, '0')}`,
      type: 'text',
      label: `Campo ${i + 1}${long ? ' (texto longo)' : ''}`,
      size: sizes[i % 4],
      readOnly: false,
      required: false,
      multiple: false,
      relevance: i === 0 ? 'highlight' : 'common',
      textLong: long,
      demoValue: long
        ? `Exemplo de texto longo — ${letter} — campo ${i + 1}.\n\n`.repeat(4)
        : `Demo ${letter}-${i + 1}`,
      sectionId: sid,
    })
  }
  for (let j = 0; j < 8; j++) {
    fields.push({
      id: `demo-${sid}-n${j}`,
      type: 'number',
      label: `Número ${j + 1}`,
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      demoValue: (si + 1) * 100 + j,
      sectionId: sid,
    })
  }
}

const form = {
  id: 'form-demo-sticky-tabs',
  name: 'Demo — Abas grandes (validar sticky)',
  sectionLayout: 'tabs',
  defaultCanvasMode: 'read',
  sections,
  fields,
  methods: [
    { id: 'demo-m-rascunho', name: 'Rascunho', icon: 'save', kind: 'destaque' },
    { id: 'demo-m-menu', name: 'Mais ações', icon: 'more_horiz', kind: 'menu' },
  ],
}

const formsPath = path.join(
  __dirname,
  '..',
  'data',
  'subprojects',
  'compras',
  'epics',
  'formalizacao-contratual',
  'forms.json',
)

const raw = fs.readFileSync(formsPath, 'utf8')
const arr = JSON.parse(raw)
if (arr.some((f) => f.id === form.id)) {
  console.error('Form already exists:', form.id)
  process.exit(1)
}
arr.unshift(form)
fs.writeFileSync(formsPath, JSON.stringify(arr, null, 2) + '\n', 'utf8')
console.log('Inserted', form.id, 'at start of', formsPath, '—', form.fields.length, 'fields')
