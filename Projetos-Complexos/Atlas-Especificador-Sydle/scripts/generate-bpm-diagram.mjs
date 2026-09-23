#!/usr/bin/env node
/**
 * Gera diagrama BPM completo (Mermaid) com classes e campos do épico atlas-prototipo.
 * Uso: node scripts/generate-bpm-diagram.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC_DIR = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-prototipo')
const FORMS_PATH = path.join(EPIC_DIR, 'forms.json')
const WORKSPACES_PATH = path.join(EPIC_DIR, 'workspaces.json')
const CLASS_GROUPS_PATH = path.join(EPIC_DIR, 'class-groups.json')
const OUT_MD = path.join(__dirname, '../docs/entregaveis/markdown/Atlas_Prototipo_BPM_Completo.md')
const OUT_JSON = path.join(__dirname, '../docs/entregaveis/auxiliar/Atlas_Prototipo_BPM_Model.json')
const OUT_CANVAS = path.join(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle/canvases/atlas-prototipo-bpm.canvas.tsx',
)

function formById(forms, id) {
  return forms.find((f) => f.id === id)
}

function formName(forms, id) {
  return formById(forms, id)?.name ?? id
}

function mermaidId(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || 'node'
}

function typeShort(field) {
  if (field.type === 'reference') return 'ref'
  if (field.type === 'embeddedReference') return 'emb'
  if (field.type === 'textOptions') return 'opt'
  if (field.type === 'text' && field.textLong) return 'long'
  return field.type
}

function fieldLine(field) {
  const req = field.required ? '*' : ''
  const mult = field.multiple ? '[]' : ''
  const label = (field.label ?? field.id).replace(/"/g, "'").slice(0, 40)
  return `${req}${label}${mult} : ${typeShort(field)}`
}

function buildClassDiagramBlock(form, forms, opts = {}) {
  const lines = []
  const cid = mermaidId(form.id)
  lines.push(`    class ${cid} {`)
  const fields = (form.fields ?? []).filter((f) => !opts.skipHidden || !f.hidden)
  for (const f of fields) {
    lines.push(`        ${fieldLine(f)}`)
  }
  if (!fields.length) lines.push('        (sem campos)')
  lines.push('    }')
  return { cid, lines }
}

function collectRelations(form, forms) {
  const edges = []
  for (const f of form.fields ?? []) {
    if ((f.type === 'reference' || f.type === 'embeddedReference') && f.linkedFormId) {
      edges.push({
        from: form.id,
        to: f.linkedFormId,
        label: f.label ?? f.id,
        kind: f.type === 'embeddedReference' ? 'embedded' : 'reference',
        multiple: !!f.multiple,
      })
    }
  }
  return edges
}

function renderProcessBpm() {
  return `flowchart TB
    subgraph CAD["Cadastro base"]
        direction TB
        C1["Nível organizacional"]
        C2["Unidade organizacional"]
        C3["Pessoa"]
        C4["Servidor"]
        C5["Cargo"]
        C1 --> C2
        C3 --> C4
        C4 --> C5
        C2 --> C4
        C2 --> C5
    end

    subgraph CFG["Configuração e documentos"]
        direction TB
        V1["Versões de Processo"]
        V2["Versão — tipo de processo (linha)"]
        W1["Workflow de Assinatura"]
        T1["Template"]
        T2["Bloco reutilizável (linha)"]
        A1["Assinatura de Documentos"]
        D1["Documentos e Templates"]
        V1 --> V2
        T1 --> T2
        T1 --> W1
        A1 --> W1
        D1 --> T1
    end

    subgraph OP["Operação"]
        P0["Processos (instância)"]
        P0 --> P1["Dados do Processo"]
        P1 --> P2["Demanda / Evento"]
        P2 --> P3["Proposta"]
        P3 --> P4["Workflow / Assinaturas"]
        P4 --> P5["Documentos"]
        P5 --> P6["Contrato"]
        P6 --> P7["Produtos e Serviços"]
        P7 --> P8["Integrações e Registros"]
        P8 --> P9["Pós-venda / Kick-off"]
        P9 --> P10["Ordem de Serviço"]
        P10 --> P11["Homologação / RAER"]
        P11 --> P12["Histórico"]
    end

    subgraph FLX["Classes de fluxo (telas)"]
        F1["Proposta"]
        F2["Documentos"]
        F3["Contrato"]
        F4["Emissão de OS"]
        F5["Termo de Homologação"]
        F6["RAER"]
    end

    subgraph AUD["Auditoria"]
        AU["Auditoria"]
    end

    CAD --> CFG
    CFG --> OP
    V1 -.->|versão vigente| P1
    W1 -.->|etapas| P4
    D1 -.->|templates| P5
    P3 -.-> F1
    P5 -.-> F2
    P6 -.-> F3
    P10 -.-> F4
    P11 -.-> F5
    P11 -.-> F6
    OP --> AUD`
}

function renderRelationsDiagram(workspaceClasses, allEdges, forms) {
  const wsFormIds = new Set(workspaceClasses.map((c) => c.linkedFormId))
  const relevant = allEdges.filter((e) => wsFormIds.has(e.from) || wsFormIds.has(e.to))
  const nodeIds = new Set()
  const lines = ['```mermaid', 'flowchart LR']

  for (const cls of workspaceClasses) {
    const nid = mermaidId(cls.linkedFormId)
    nodeIds.add(cls.linkedFormId)
    lines.push(`    ${nid}["${cls.name.replace(/"/g, "'")}"]`)
  }

  const seen = new Set()
  for (const e of relevant) {
    const key = `${e.from}|${e.to}|${e.kind}`
    if (seen.has(key)) continue
    seen.add(key)
    const from = mermaidId(e.from)
    const to = mermaidId(e.to)
    const arrow = e.kind === 'embedded' ? '-.->|embutido|' : '-->|ref|'
    lines.push(`    ${from} ${arrow} ${to}`)
  }

  lines.push('```')
  return lines.join('\n')
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(WORKSPACES_PATH, 'utf8'))
  const classGroups = JSON.parse(fs.readFileSync(CLASS_GROUPS_PATH, 'utf8'))
  const ws = workspaces[0]

  const workspaceClasses = []
  for (const pkg of ws.packages) {
    for (const cls of pkg.classes) {
      workspaceClasses.push({ ...cls, packageId: pkg.id, packageName: pkg.name })
    }
  }

  const formToGroup = {}
  for (const [formId, groupId] of Object.entries(classGroups.assignments ?? {})) {
    const g = classGroups.groups.find((x) => x.id === groupId)
    formToGroup[formId] = g?.name ?? groupId
  }

  const allEdges = []
  for (const form of forms) {
    allEdges.push(...collectRelations(form, forms))
  }

  const model = {
    generatedAt: new Date().toISOString(),
    epic: ws.name,
    packages: ws.packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      classes: pkg.classes.map((cls) => {
        const form = formById(forms, cls.linkedFormId)
        return {
          id: cls.id,
          name: cls.name,
          formId: cls.linkedFormId,
          group: formToGroup[cls.linkedFormId] ?? '—',
          fields: (form?.fields ?? []).map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            required: !!f.required,
            multiple: !!f.multiple,
            sectionId: f.sectionId,
            linkedFormId: f.linkedFormId,
            hidden: !!f.hidden,
          })),
          sections: form?.sections ?? [],
        }
      }),
    })),
    embeddedForms: forms
      .filter((f) => formToGroup[f.id] === 'Linhas embutidas' || !workspaceClasses.some((c) => c.linkedFormId === f.id))
      .filter((f) => !workspaceClasses.some((c) => c.linkedFormId === f.id))
      .map((f) => ({
        id: f.id,
        name: f.name,
        group: formToGroup[f.id] ?? 'Linhas embutidas',
        fields: (f.fields ?? []).map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: !!field.required,
          multiple: !!field.multiple,
          linkedFormId: field.linkedFormId,
        })),
      })),
    edges: allEdges,
    processTabs: formById(forms, 'form-patlasv4-proto-processos')?.sections?.map((s) => s.title) ?? [],
  }

  const lines = []
  lines.push('# Atlas Protótipo — Diagrama BPM completo (classes e campos)')
  lines.push('')
  lines.push(
    `Documento gerado em ${new Date().toISOString().slice(0, 10)} a partir de \`atlas-prototipo/forms.json\`. **${forms.length} formulários**, **${forms.reduce((a, x) => a + (x.fields?.length ?? 0), 0)} campos**.`,
  )
  lines.push('')
  lines.push('## Índice')
  lines.push('')
  lines.push('1. [Visão BPM — fluxo de negócio](#1-visão-bpm--fluxo-de-negócio)')
  lines.push('2. [Mapa de referências entre classes](#2-mapa-de-referências-entre-classes)')
  lines.push('3. [Diagramas por pacote (classes + campos)](#3-diagramas-por-pacote-classes--campos)')
  lines.push('4. [Formulários embutidos (linhas)](#4-formulários-embutidos-linhas)')
  lines.push('5. [Legenda](#5-legenda)')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 1. Visão BPM — fluxo de negócio')
  lines.push('')
  lines.push('```mermaid')
  lines.push(renderProcessBpm())
  lines.push('```')
  lines.push('')
  lines.push('### Abas do processo operacional (classe Processos)')
  lines.push('')
  for (const [i, tab] of model.processTabs.entries()) {
    lines.push(`${i + 1}. ${tab}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 2. Mapa de referências entre classes')
  lines.push('')
  lines.push(renderRelationsDiagram(workspaceClasses, allEdges, forms))
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 3. Diagramas por pacote (classes + campos)')
  lines.push('')

  for (const pkg of ws.packages) {
    lines.push(`### ${pkg.name}`)
    lines.push('')
    lines.push('```mermaid')
    lines.push('classDiagram')
    lines.push('direction TB')
    const classIds = []
    const edgeLines = []

    for (const cls of pkg.classes) {
      const form = formById(forms, cls.linkedFormId)
      if (!form) continue
      const { cid, lines: clsLines } = buildClassDiagramBlock(form, forms)
      classIds.push({ cid, formId: form.id, name: cls.name })
      lines.push(...clsLines)
    }

    const pkgFormIds = new Set(pkg.classes.map((c) => c.linkedFormId))
    const seen = new Set()
    for (const e of allEdges) {
      if (!pkgFormIds.has(e.from)) continue
      const key = `${e.from}|${e.to}|${e.label}`
      if (seen.has(key)) continue
      seen.add(key)
      const from = mermaidId(e.from)
      const to = mermaidId(e.to)
      if (e.kind === 'embedded') {
        edgeLines.push(`    ${from} *-- ${to} : ${e.label.replace(/"/g, "'")}`)
      } else {
        edgeLines.push(`    ${from} --> ${to} : ${e.label.replace(/"/g, "'")}`)
      }
    }
    lines.push(...edgeLines)
    lines.push('```')
    lines.push('')

    for (const cls of pkg.classes) {
      const form = formById(forms, cls.linkedFormId)
      if (!form) continue
      lines.push(`#### ${cls.name}`)
      lines.push('')
      lines.push(`| Label | ID | Tipo | Obrig. | Múlt. | Destino |`)
      lines.push(`| --- | --- | --- | --- | --- | --- |`)
      for (const f of form.fields ?? []) {
        const dest =
          f.linkedFormId ? `${formName(forms, f.linkedFormId)}` : '—'
        lines.push(
          `| ${f.label ?? '—'} | \`${f.id}\` | ${typeShort(f)} | ${f.required ? 'Sim' : 'Não'} | ${f.multiple ? 'Sim' : 'Não'} | ${dest} |`,
        )
      }
      lines.push('')
    }
    lines.push('---')
    lines.push('')
  }

  lines.push('## 4. Formulários embutidos (linhas)')
  lines.push('')
  const embeddedIds = classGroups.memberOrderByGroup?.['grp-patlasv4-proto-embutido'] ?? []
  for (const fid of embeddedIds) {
    const form = formById(forms, fid)
    if (!form) continue
    if (workspaceClasses.some((c) => c.linkedFormId === fid)) continue
    lines.push(`### ${form.name}`)
    lines.push('')
    lines.push('```mermaid')
    lines.push('classDiagram')
    const { lines: clsLines } = buildClassDiagramBlock(form, forms, { skipHidden: false })
    lines.push(...clsLines)
    for (const e of collectRelations(form, forms)) {
      const from = mermaidId(e.from)
      const to = mermaidId(e.to)
      if (e.kind === 'embedded') {
        lines.push(`    ${from} *-- ${to} : ${(e.label ?? '').replace(/"/g, "'")}`)
      } else if (e.to !== e.from) {
        lines.push(`    ${from} --> ${to} : ${(e.label ?? '').replace(/"/g, "'")}`)
      }
    }
    lines.push('```')
    lines.push('')
  }

  lines.push('## 5. Legenda')
  lines.push('')
  lines.push('| Símbolo / tipo | Significado |')
  lines.push('| --- | --- |')
  lines.push('| `*Label` | Campo obrigatório |')
  lines.push('| `Label[]` | Campo múltiplo |')
  lines.push('| `ref` | Referência a outra classe |')
  lines.push('| `emb` | Referência embutida (linha em tabela/acordeão) |')
  lines.push('| `opt` | Texto com opções fixas |')
  lines.push('| `-->` | Associação por referência |')
  lines.push('| `*--` | Composição (embutido) |')
  lines.push('')

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true })
  fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8')
  fs.writeFileSync(OUT_JSON, JSON.stringify(model, null, 2), 'utf8')
  writeCanvas(model)
  console.log(`✓ BPM MD:  ${OUT_MD}`)
  console.log(`✓ BPM JSON: ${OUT_JSON}`)
  console.log(`✓ BPM Canvas: ${OUT_CANVAS}`)
}

function writeCanvas(model) {
  const processNodes = [
    { id: 'cad', label: 'Cadastro base' },
    { id: 'cfg', label: 'Configuração' },
    { id: 'proc', label: 'Processos' },
    ...model.processTabs.map((t, i) => ({ id: `tab${i}`, label: t })),
    { id: 'aud', label: 'Auditoria' },
  ]
  const processEdges = [
    { from: 'cad', to: 'cfg' },
    { from: 'cfg', to: 'proc' },
    ...model.processTabs.map((_, i) =>
      i === 0
        ? { from: 'proc', to: 'tab0' }
        : { from: `tab${i - 1}`, to: `tab${i}` },
    ),
    {
      from: `tab${model.processTabs.length - 1}`,
      to: 'aud',
    },
  ]

  const pkgColors = ['blue', 'purple', 'green', 'orange', 'pink']

  const canvas = `import { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CollapsibleSection,
  H1,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Swatch,
  Table,
  Text,
  TextInput,
  computeDAGLayout,
  useHostTheme,
  type Color,
} from "cursor/canvas";

const MODEL = ${JSON.stringify(model)} as const;

const PROCESS_NODES = ${JSON.stringify(processNodes)} as const;
const PROCESS_EDGES = ${JSON.stringify(processEdges)} as const;
const PKG_COLORS: Color[] = ${JSON.stringify(pkgColors)} as Color[];

type Field = (typeof MODEL.packages)[number]["classes"][number]["fields"][number];

function typePill(type: string) {
  if (type === "reference") return "ref";
  if (type === "embeddedReference") return "emb";
  return type;
}

function ProcessFlow() {
  const t = useHostTheme();
  const layout = useMemo(
    () =>
      computeDAGLayout({
        nodes: PROCESS_NODES.map((n) => ({ id: n.id })),
        edges: PROCESS_EDGES,
        direction: "vertical",
        nodeWidth: 168,
        nodeHeight: 36,
        rankGap: 28,
        nodeGap: 12,
        padding: 16,
      }),
    [],
  );
  const labelById = Object.fromEntries(PROCESS_NODES.map((n) => [n.id, n.label]));

  return (
    <Card>
      <CardHeader>Fluxo BPM operacional</CardHeader>
      <CardBody>
        <Text tone="tertiary" size="small">Cadastro → Config → Processos → Auditoria</Text>
        <svg
          width={layout.width}
          height={layout.height}
          style={{ display: "block", maxWidth: "100%", marginTop: 8 }}
          aria-label="Diagrama de fluxo BPM"
        >
          {layout.ranks.map((rank) => (
            <rect
              key={rank.rank}
              x={rank.x}
              y={rank.y}
              width={rank.width}
              height={rank.height}
              fill={t.fill.tertiary}
              rx={6}
            />
          ))}
          {layout.edges.map((e) => (
            <line
              key={\`\${e.from}-\${e.to}\`}
              x1={e.sourceX}
              y1={e.sourceY}
              x2={e.targetX}
              y2={e.targetY}
              stroke={t.stroke.secondary}
              strokeWidth={1.5}
              strokeDasharray={e.isBackEdge ? "4 3" : undefined}
            />
          ))}
          {layout.nodes.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={168}
                height={36}
                fill={t.bg.elevated}
                stroke={t.stroke.primary}
                rx={4}
              />
              <text
                x={n.x + 84}
                y={n.y + 22}
                textAnchor="middle"
                fill={t.text.primary}
                fontSize={11}
                fontFamily="system-ui, sans-serif"
              >
                {labelById[n.id]?.slice(0, 22)}
              </text>
            </g>
          ))}
        </svg>
      </CardBody>
    </Card>
  );
}

function FieldsTable({ fields }: { fields: readonly Field[] }) {
  const headers = ["Label", "ID", "Tipo", "Obr.", "Múlt.", "Destino"];
  const rows = fields.map((f) => [
    f.label ?? "—",
    f.id,
    typePill(f.type),
    f.required ? "Sim" : "Não",
    f.multiple ? "Sim" : "Não",
    f.linkedFormId ? f.linkedFormId.replace("form-patlasv4-proto-", "") : "—",
  ]);
  return <Table headers={headers} rows={rows} striped stickyHeader />;
}

export default function AtlasPrototipoBpmCanvas() {
  const [pkgIdx, setPkgIdx] = useState(0);
  const [query, setQuery] = useState("");
  const pkg = MODEL.packages[pkgIdx];
  const totalFields = MODEL.packages.reduce((a, p) => a + p.classes.reduce((b, c) => b + c.fields.length, 0), 0)
    + MODEL.embeddedForms.reduce((a, f) => a + f.fields.length, 0);

  const filteredClasses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pkg.classes;
    return pkg.classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.fields.some((f) => f.label?.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)),
    );
  }, [pkg, query]);

  const filteredEmbedded = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MODEL.embeddedForms;
    return MODEL.embeddedForms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.fields.some((fld) => fld.label?.toLowerCase().includes(q) || fld.id.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <Stack gap={20}>
      <Stack gap={4}>
        <H1>Atlas Protótipo — BPM</H1>
        <Text tone="secondary">
          {MODEL.epic} · {MODEL.packages.reduce((a, p) => a + p.classes.length, 0)} classes de workspace ·{" "}
          {MODEL.embeddedForms.length} embutidos · {totalFields} campos
        </Text>
      </Stack>

      <Row gap={12} wrap>
        <Stat label="Pacotes" value={String(MODEL.packages.length)} />
        <Stat label="Abas do processo" value={String(MODEL.processTabs.length)} />
        <Stat label="Referências" value={String(MODEL.edges.length)} />
      </Row>

      <ProcessFlow />

      <Card>
        <CardHeader>Classes e campos por pacote</CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Row gap={12} wrap align="center">
              <Stack gap={4}>
                <Text size="small" tone="tertiary">Pacote</Text>
                <Select
                  value={String(pkgIdx)}
                  onChange={(v) => setPkgIdx(Number(v))}
                  options={MODEL.packages.map((p, i) => ({ value: String(i), label: p.name }))}
                />
              </Stack>
              <Stack gap={4} style={{ flex: 1, minWidth: 200 }}>
                <Text size="small" tone="tertiary">Buscar classe ou campo</Text>
                <TextInput value={query} onChange={setQuery} placeholder="Ex.: Unidade, CPF, workflow" type="search" />
              </Stack>
            </Row>

            {filteredClasses.map((cls) => (
              <CollapsibleSection
                key={cls.id}
                title={cls.name}
                count={cls.fields.length}
                leading={<Swatch color={PKG_COLORS[pkgIdx % PKG_COLORS.length]} />}
                trailing={<Pill tone="neutral" size="sm">{cls.formId.replace("form-patlasv4-proto-", "")}</Pill>}
              >
                <FieldsTable fields={cls.fields} />
              </CollapsibleSection>
            ))}
          </Stack>
        </CardBody>
      </Card>

      {filteredEmbedded.length > 0 && (
        <Card>
          <CardHeader trailing={<Text size="small" tone="tertiary">Linhas embutidas</Text>}>
            Formulários embutidos
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              {filteredEmbedded.map((form) => (
                <CollapsibleSection key={form.id} title={form.name} count={form.fields.length} leading={<Swatch color="gray" />}>
                  <FieldsTable fields={form.fields} />
                </CollapsibleSection>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
`

  fs.mkdirSync(path.dirname(OUT_CANVAS), { recursive: true })
  fs.writeFileSync(OUT_CANVAS, canvas, 'utf8')
}

main()
