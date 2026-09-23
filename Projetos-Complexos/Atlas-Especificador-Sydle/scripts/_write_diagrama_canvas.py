# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "exports/_campos_fase2_diagrama.json").read_text(encoding="utf-8"))
payload = json.dumps(rows, ensure_ascii=False)

out = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases\diagrama-classes-fase2-catalogo.canvas.tsx"
)

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
  computeDAGLayout,
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

type NodeDef = { id: string; label: string; classe: string; kind: "dominio" | "embutida" | "processo" | "fase1" };

const NODES: NodeDef[] = [
  { id: "org", label: "Organização", classe: "Organização", kind: "fase1" },
  { id: "pessoa", label: "Pessoa", classe: "Pessoa", kind: "fase1" },
  { id: "parceria", label: "Parceria", classe: "Parceria", kind: "dominio" },
  { id: "solucao", label: "Solução", classe: "Solução", kind: "dominio" },
  { id: "metrica", label: "Métrica", classe: "Métrica", kind: "dominio" },
  { id: "categoria", label: "Categoria", classe: "Categoria de Serviços", kind: "dominio" },
  { id: "modelo", label: "Modelo venda", classe: "Modelo de Venda", kind: "dominio" },
  { id: "cobranca", label: "Tipo cobrança", classe: "Tipo de Cobrança", kind: "dominio" },
  { id: "grupo", label: "Grupo", classe: "Grupo", kind: "dominio" },
  { id: "catalogo", label: "Catálogo N2", classe: "Catálogo", kind: "dominio" },
  { id: "metricaN2", label: "Métrica N2", classe: "Métrica do catálogo", kind: "embutida" },
  { id: "cx", label: "Complexidade", classe: "Complexidade do catálogo", kind: "embutida" },
  { id: "universal", label: "Universal N3", classe: "Catálogo Universal", kind: "dominio" },
  { id: "produto", label: "Produto N1", classe: "Produto", kind: "dominio" },
  { id: "dados", label: "Dados parceria", classe: "Dados de Parceria por Produto", kind: "dominio" },
  { id: "portalP", label: "Portal parceiro", classe: "Portal Parceiro — Meus catálogos e produtos", kind: "processo" },
  { id: "analise", label: "Análise MTI", classe: "Análise de catálogo / produto (MTI)", kind: "processo" },
  { id: "fila", label: "Fila MTI", classe: "Fila de análise MTI (catálogo)", kind: "processo" },
  { id: "notif", label: "Notificação", classe: "Notificação do fluxo (catálogo)", kind: "processo" },
  { id: "portalC", label: "Portal cliente", classe: "Portal Cliente — Catálogo (consumo)", kind: "processo" },
];

const EDGES: Array<{ from: string; to: string }> = [
  { from: "org", to: "parceria" },
  { from: "parceria", to: "solucao" },
  { from: "parceria", to: "catalogo" },
  { from: "solucao", to: "catalogo" },
  { from: "solucao", to: "grupo" },
  { from: "categoria", to: "grupo" },
  { from: "metrica", to: "metricaN2" },
  { from: "catalogo", to: "metricaN2" },
  { from: "catalogo", to: "cx" },
  { from: "catalogo", to: "produto" },
  { from: "catalogo", to: "universal" },
  { from: "pessoa", to: "catalogo" },
  { from: "grupo", to: "produto" },
  { from: "categoria", to: "produto" },
  { from: "modelo", to: "produto" },
  { from: "cobranca", to: "produto" },
  { from: "metrica", to: "produto" },
  { from: "produto", to: "dados" },
  { from: "parceria", to: "dados" },
  { from: "solucao", to: "dados" },
  { from: "catalogo", to: "portalP" },
  { from: "catalogo", to: "analise" },
  { from: "analise", to: "fila" },
  { from: "catalogo", to: "notif" },
  { from: "universal", to: "portalC" },
  { from: "produto", to: "portalC" },
];

const BIZ: Record<string, string> = {
  Parceria:
    "Acordo MTI × parceiro. 1 parceria tem N soluções e portanto N catálogos N2 (um por solução/versão). Lista de produtos aqui é consulta — cadastro no Catálogo.",
  Solução:
    "Pertence a 1 parceria. O catálogo N2 desta solução é o cardápio comercializável.",
  Catálogo:
    "RF-CAT-00: 1 Catálogo N2 = 1 Parceria + 1 Solução + 1 Versão. Focais/DTIC só aqui. Toggles É universal? e É catálogo de serviços? (ambos podem Sim). Estrutura: sem variação | por complexidade | por peso (não os dois).",
  "Catálogo Universal":
    "N3 — crédito/redirecionador, não cardápio de itens. Sem focais. Vincula catálogos N2 com É universal? = Sim. Conversão N3→N2 no consumo (Fase 3).",
  Produto:
    "N1. Primeiro campo = Catálogo; parceria/solução/versão herdadas RO. Tipo só Licença | Serviço. Cobrança: Mensal · Anual · Conforme homologação (sem sob demanda). Consumo OS só se oferta Universal. Complexidade/peso/qtde só Serviço + flags do catálogo. 1 métrica, filtrada pelo catálogo.",
  Métrica:
    "Cadastro mestre: só Nome (+ Ativo no protótipo). Valor e quantidade não ficam aqui.",
  "Métrica do catálogo":
    "Linha do Catálogo: métrica + valor unitário da métrica + exige quantidade. Não duplicar métrica na mesma versão. Valor da métrica ≠ preço do produto.",
  "Complexidade do catálogo":
    "Linha do Catálogo quando estrutura = Por complexidade. Faixa + coeficiente uniforme na versão. Produto só escolhe a faixa; coeficiente é RO herdado.",
  "Categoria de Serviços":
    "Cadastro lean: Nome. Usada no Produto tipo Serviço.",
  Grupo:
    "Agrupamento de produtos. Campo confirmado; obrigatoriedade absoluta no Produto = aberta na fonte.",
  "Modelo de Venda":
    "Provisório na fonte: Por licença · Por serviço · Por pacote. Lista final não fechada.",
  "Tipo de Cobrança":
    "Mensal · Anual · Conforme homologação. Sob demanda não é tipo de cobrança (é consumo/OS no produto).",
  "Dados de Parceria por Produto":
    "Proposta: 1 registro por Parceria × Solução × Produto (custo, markup, distribuição). Não é valor de venda do Produto. Classe ainda a confirmar com a MTI.",
  "Portal Parceiro — Meus catálogos e produtos":
    "Parceiro cadastra rascunho, CSV e envia. Não publica nem cria versão contratual.",
  "Análise de catálogo / produto (MTI)":
    "Homologar ≠ Publicar ≠ Apostilar. Decisão: aprovar / ajuste / reprovar / paralisar. Cliente não analisa cadastro.",
  "Fila de análise MTI (catálogo)":
    "Fila do backoffice com os envios do parceiro.",
  "Portal Cliente — Catálogo (consumo)":
    "Fase 2: só consulta da versão apostilada. Cotação/OS = Fase 3.",
  "Notificação do fluxo (catálogo)":
    "Espelho de eventos (envio, ajuste, homologação, publicação, apostila).",
  Organização: "Classe Fase 1. Parceria.Parceiro e Catálogo.Unidade DTIC apontam para cá.",
  Pessoa: "Classe Fase 1. Focais de vendas/pós-vendas e responsável do Catálogo apontam para cá.",
};

function toneFor(status: string): "success" | "warning" | "neutral" {
  if (status === "Confirmado") return "success";
  if (status === "Aberto na fonte") return "warning";
  return "neutral";
}

function nodeFill(kind: NodeDef["kind"], selected: boolean, theme: ReturnType<typeof useHostTheme>) {
  if (selected) return theme.accent.primary;
  if (kind === "embutida") return theme.fill.tertiary;
  if (kind === "processo") return theme.fill.secondary;
  if (kind === "fase1") return theme.fill.quaternary;
  return theme.bg.elevated;
}

export default function DiagramaClassesFase2() {
  const theme = useHostTheme();
  const [selId, setSelId] = useCanvasState("node", "catalogo");
  const [q, setQ] = useCanvasState("q", "");
  const [legado, setLegado] = useCanvasState("legado", false);

  const sel = NODES.find((n) => n.id === selId) ?? NODES[0];
  const layout = computeDAGLayout({
    nodes: NODES.map((n) => ({ id: n.id })),
    edges: EDGES,
    direction: "vertical",
    nodeWidth: 128,
    nodeHeight: 36,
    rankGap: 48,
    nodeGap: 16,
    padding: 12,
  });
  const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));

  const filtered = FIELDS.filter((f) => {
    if (f.classe !== sel.classe) return false;
    if (!legado && f.status === "Legado") return false;
    const hay = `${f.campo} ${f.para} ${f.vis} ${f.regra}`.toLowerCase();
    if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
    return true;
  });

  const nDom = NODES.filter((n) => n.kind === "dominio" || n.kind === "embutida").length;

  return (
    <Stack gap={18} style={{ maxWidth: 1180, margin: "0 auto", padding: 20 }}>
      <Stack gap={6}>
        <H1>Diagrama de classes — Fase 2 Catálogo</H1>
        <Text tone="secondary" size="small">
          Fonte: catalogo.m4a. Clique na classe no diagrama para ver todos os campos, regra de exibição e regra de negócio.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={String(nDom)} label="Classes de domínio + embutidas" />
        <Stat value={String(NODES.filter((n) => n.kind === "processo").length)} label="Telas de processo / portal" />
        <Stat value={String(FIELDS.length)} label="Campos no modelo" />
        <Stat value={sel.label} label="Classe selecionada" />
      </Grid>

      <Row gap={10} wrap>
        <Pill size="sm">Domínio</Pill>
        <Pill size="sm" tone="neutral">Embutida no Catálogo</Pill>
        <Pill size="sm">Processo / portal</Pill>
        <Text size="small" tone="secondary">
          Organização e Pessoa são Fase 1 (referência).
        </Text>
      </Row>

      <svg
        width="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        style={{
          background: theme.bg.editor,
          border: `1px solid ${theme.stroke.secondary}`,
          borderRadius: 8,
          maxHeight: 520,
        }}
      >
        {layout.edges.map((e, i) => (
          <line
            key={i}
            x1={e.sourceX}
            y1={e.sourceY}
            x2={e.targetX}
            y2={e.targetY}
            stroke={e.isBackEdge ? theme.stroke.tertiary : theme.stroke.primary}
            strokeWidth={1}
            strokeDasharray={e.isBackEdge ? "4 3" : undefined}
          />
        ))}
        {NODES.map((n) => {
          const p = byId[n.id];
          if (!p) return null;
          const selected = n.id === selId;
          return (
            <g
              key={n.id}
              onClick={() => setSelId(n.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={p.x}
                y={p.y}
                width={128}
                height={36}
                rx={6}
                fill={nodeFill(n.kind, selected, theme)}
                stroke={selected ? theme.accent.primary : theme.stroke.secondary}
              />
              <text
                x={p.x + 64}
                y={p.y + 23}
                textAnchor="middle"
                fill={selected ? theme.text.onAccent : theme.text.primary}
                fontSize={11}
                fontFamily="inherit"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <Card>
        <CardHeader trailing={<Pill size="sm">{sel.kind}</Pill>}>{sel.classe}</CardHeader>
        <CardBody>
          <Text>{BIZ[sel.classe] ?? "Clique outra classe no diagrama."}</Text>
        </CardBody>
      </Card>

      <H2>Campos · {sel.classe}</H2>
      <Row gap={12} align="center">
        <TextInput
          value={q}
          onChange={setQ}
          placeholder="Filtrar campo ou regra…"
          style={{ minWidth: 260, flex: 1 }}
        />
        <Checkbox checked={legado} onChange={setLegado} label="Incluir legado oculto" />
      </Row>

      {filtered.length === 0 ? (
        <Callout tone="neutral" title="Sem campos nesta classe">
          {sel.kind === "fase1"
            ? "Organização e Pessoa são da Fase 1. Aqui só entram como referência (parceiro, DTIC, focais)."
            : "Nenhum campo com esse filtro. Marque legado se o campo estiver oculto no mínimo da fonte."}
        </Callout>
      ) : (
        <Table
          stickyHeader
          striped
          headers={["Campo", "Tipo", "Obrg", "Leitura", "Quando aparece", "De onde vem", "Para que serve", "Regra", "Situação"]}
          rows={filtered.map((f) => [
            f.campo,
            f.tipo,
            f.obrg,
            f.ro,
            f.vis,
            f.origem,
            f.para,
            f.regra,
            <Pill key={f.campo + f.status} size="sm" tone={toneFor(f.status)}>
              {f.status}
            </Pill>,
          ])}
        />
      )}

      <Callout tone="warning" title="Não é versão final de negócio">
        Implemente o Confirmado. Aberto na fonte e Legado não podem ser tratados como regra oficial. Homologar, publicar e apostilar são atos distintos.
      </Callout>
    </Stack>
  );
}
'''

out.write_text(tsx, encoding="utf-8")
print("wrote", out, out.stat().st_size)
