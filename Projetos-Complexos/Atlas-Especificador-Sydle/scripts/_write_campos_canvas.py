# -*- coding: utf-8 -*-
"""Write canvas with embedded field data."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "exports/_campos_fase2_canvas.json").read_text(encoding="utf-8"))
payload = json.dumps(rows, ensure_ascii=False)
canvas_dir = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases"
)
out = canvas_dir / "detalhamento-campos-fase2-catalogo.canvas.tsx"

tsx = r'''import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TextInput,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type FieldRow = {
  classe: string;
  secao: string;
  campo: string;
  tipo: string;
  obrg: string;
  ro: string;
  vis: string;
  origem: string;
  para: string;
  regra: string;
  oculto: boolean;
  status: string;
};

const FIELDS: FieldRow[] = ''' + payload + r''';

const CLASSES = [
  "Todas",
  ...Array.from(new Set(FIELDS.map((f) => f.classe))),
];

function toneFor(status: string): "success" | "warning" | "neutral" {
  if (status === "Confirmado") return "success";
  if (status === "Aberto na fonte") return "warning";
  return "neutral";
}

export default function DetalhamentoCamposFase2() {
  const theme = useHostTheme();
  const [classe, setClasse] = useCanvasState("classe", "Produto");
  const [q, setQ] = useCanvasState("q", "");
  const [legado, setLegado] = useCanvasState("legado", false);
  const [sel, setSel] = useCanvasState("sel", "Nome do produto");

  const filtered = FIELDS.filter((f) => {
    if (!legado && f.status === "Legado") return false;
    if (classe !== "Todas" && f.classe !== classe) return false;
    const hay = `${f.campo} ${f.para} ${f.origem} ${f.regra} ${f.secao}`.toLowerCase();
    if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
    return true;
  });

  const active =
    filtered.find((f) => f.campo === sel && (classe === "Todas" || f.classe === classe)) ??
    filtered[0];

  const nConf = FIELDS.filter((f) => f.status === "Confirmado").length;
  const nAberto = FIELDS.filter((f) => f.status === "Aberto na fonte").length;
  const nLegado = FIELDS.filter((f) => f.status === "Legado").length;

  return (
    <Stack gap={20} style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <Stack gap={8}>
        <H1>Detalhamento dos campos — Fase 2 Catálogo</H1>
        <Text tone="secondary" size="small">
          Fonte: catalogo.m4a. Cada campo: para que serve, de onde vem, quando aparece e a regra.
          Aberto = a fonte não fechou. Legado = existe no modelo, fora do mínimo validado.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={String(FIELDS.length)} label="Campos no modelo" />
        <Stat value={String(nConf)} label="Confirmados na fonte" tone="success" />
        <Stat value={String(nAberto)} label="Abertos na fonte" tone="warning" />
        <Stat value={String(nLegado)} label="Legado / ocultos" />
      </Grid>

      <Callout tone="warning" title="Não é versão final">
        Use Confirmado para implementar. Aberto e Legado não podem ser tratados como regra oficial.
      </Callout>

      <Stack gap={8}>
        <Text weight="semibold">Classe</Text>
        <Row gap={6} wrap>
          {CLASSES.map((c) => (
            <Pill
              key={c}
              active={classe === c}
              onClick={() => setClasse(c)}
            >
              {c}
            </Pill>
          ))}
        </Row>
        <Row gap={12} align="center">
          <TextInput
            value={q}
            onChange={setQ}
            placeholder="Buscar campo, origem ou regra…"
            style={{ minWidth: 280, flex: 1 }}
          />
          <Checkbox
            checked={legado}
            onChange={setLegado}
            label="Incluir legado oculto"
          />
        </Row>
      </Stack>

      {active ? (
        <Card>
          <CardHeader
            title={active.campo}
            trailing={<Pill size="sm" tone={toneFor(active.status)}>{active.status}</Pill>}
          />
          <CardBody>
            <Text tone="secondary" size="small">
              {active.classe} · {active.secao} · {active.tipo}
            </Text>
            <Divider />
            <Grid columns={2} gap={16}>
              <Stack gap={4}>
                <Text weight="semibold" size="small">Para que serve</Text>
                <Text>{active.para}</Text>
              </Stack>
              <Stack gap={4}>
                <Text weight="semibold" size="small">De onde vem</Text>
                <Text>{active.origem}</Text>
              </Stack>
              <Stack gap={4}>
                <Text weight="semibold" size="small">Quando aparece</Text>
                <Text>{active.vis}</Text>
              </Stack>
              <Stack gap={4}>
                <Text weight="semibold" size="small">Regra</Text>
                <Text>{active.regra}</Text>
              </Stack>
            </Grid>
            <Row gap={16} style={{ marginTop: 12 }}>
              <Text size="small">Obrigatório: {active.obrg}</Text>
              <Text size="small">Somente leitura: {active.ro}</Text>
            </Row>
          </CardBody>
        </Card>
      ) : null}

      <H2>{filtered.length} campos{classe !== "Todas" ? ` · ${classe}` : ""}</H2>
      <Text tone="secondary" size="small">
        Clique na linha (nome do campo) para ver o detalhe acima.
      </Text>
      <Table
        stickyHeader
        striped
        headers={["Campo", "Obrg", "Leitura", "De onde vem", "Para que serve", "Quando aparece", "Situação"]}
        rows={filtered.map((f) => [
          <span
            key={f.classe + f.campo}
            onClick={() => setSel(f.campo)}
            style={{
              cursor: "pointer",
              color: f.campo === active?.campo ? theme.accent.primary : theme.text.primary,
              fontWeight: f.campo === active?.campo ? 600 : 400,
            }}
          >
            {f.campo}
          </span>,
          f.obrg,
          f.ro,
          f.origem,
          f.para,
          f.vis,
          <Pill key={f.campo + f.status} size="sm" tone={toneFor(f.status)}>
            {f.status}
          </Pill>,
        ])}
        columnAlign={["left", "center", "center", "left", "left", "left", "left"]}
        emptyMessage="Nenhum campo com esse filtro."
      />
    </Stack>
  );
}
'''

out.write_text(tsx, encoding="utf-8")
print("wrote", out, "bytes", out.stat().st_size)
