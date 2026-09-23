# -*- coding: utf-8 -*-
import json
from collections import OrderedDict, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "exports/_campos_fase2_diagrama.json").read_text(encoding="utf-8"))
forms = json.loads(
    (ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/forms.json").read_text(encoding="utf-8")
)

ORDER = [
    "Métrica",
    "Tipo de Cobrança",
    "Categoria de Serviços",
    "Grupo",
    "Modelo de Venda",
    "Parceria",
    "Solução",
    "Catálogo",
    "Métrica do catálogo",
    "Complexidade do catálogo",
    "Catálogo Universal",
    "Produto",
    "Dados de Parceria por Produto",
    "Análise de catálogo / produto (MTI)",
]

SKIP = {"Prévia do card"}

# Opções desenhadas como caixas à direita (como no rascunho Variação → Por complexidade / Por peso)
OPCAO_CAIXA = {
    "Estrutura de variação": ["Por complexidade", "Por peso"],
}


def nkey(s: str) -> str:
    return " ".join((s or "").lower().replace("?", "").split())


def cond_txt(r: dict) -> str:
    if r.get("sourceKind") == "textOptions":
        return str(r.get("expectedOptionText") or "")
    if r.get("sourceKind") == "boolean":
        return "Sim" if r.get("expectedBoolean") or r.get("expectedBool") else "Não"
    return ""


label_by_id: dict[str, str] = {}
for f in forms:
    for fld in f.get("fields") or []:
        if fld.get("id") and fld.get("label"):
            label_by_id[fld["id"]] = fld["label"]

controla: dict[tuple[str, str], list[str]] = defaultdict(list)
aparece: dict[tuple[str, str], list[str]] = defaultdict(list)
# (classe, src) -> OrderedDict[cond, list[tgt labels]]
show_map: dict[tuple[str, str], "OrderedDict[str, list[str]]"] = defaultdict(OrderedDict)
dependentes: dict[str, set[str]] = defaultdict(set)

for f in forms:
    fname = f.get("name") or ""
    if fname not in ORDER:
        continue
    for r in f.get("fieldVisibilityRules") or []:
        src = label_by_id.get(r.get("sourceFieldId") or "", "")
        if not src:
            continue
        tgts = [label_by_id.get(t, t) for t in (r.get("targetFieldIds") or [])]
        if not tgts:
            continue
        c = cond_txt(r)
        lista = ", ".join(tgts)
        if r.get("action") == "show":
            controla[(fname, src)].append(f"Se {src} = {c} → mostra: {lista}")
            for t in tgts:
                aparece[(fname, t)].append(f"Aparece quando {src} = {c}")
                dependentes[fname].add(nkey(t))
            prev = show_map[(fname, src)].get(c)
            if prev is None:
                show_map[(fname, src)][c] = list(tgts)
            else:
                for t in tgts:
                    if t not in prev:
                        prev.append(t)
        elif r.get("action") == "hide":
            controla[(fname, src)].append(f"Se {src} = {c} → oculta: {lista}")
            for t in tgts:
                aparece[(fname, t)].append(f"Oculta quando {src} = {c}")

by: OrderedDict[str, list] = OrderedDict((k, []) for k in ORDER)
for r in rows:
    if r["classe"] not in by:
        continue
    if r["campo"] in SKIP:
        continue
    nome = r["campo"]
    if str(r.get("tipo", "")).startswith("boolean") and nome.lower() in ("ativo",):
        nome = "Ativo?"
    key_nome = r["campo"]
    vis_parts = []
    if r["vis"] and r["vis"] != "Sempre visível":
        vis_parts.append(r["vis"])
    vis_parts.extend(aparece.get((r["classe"], key_nome), []))
    vis_parts.extend(aparece.get((r["classe"], nome), []))
    seen = set()
    vis_uniq = []
    for p in vis_parts:
        if p not in seen:
            seen.add(p)
            vis_uniq.append(p)
    vis_txt = " · ".join(vis_uniq) if vis_uniq else "Sempre visível"
    ctrl = controla.get((r["classe"], key_nome), []) + controla.get((r["classe"], nome), [])
    ctrl_u = []
    seen2 = set()
    for p in ctrl:
        if p not in seen2:
            seen2.add(p)
            ctrl_u.append(p)
    by[r["classe"]].append(
        {
            "campo": nome,
            "obrg": r["obrg"],
            "ro": r["ro"],
            "vis": vis_txt,
            "controla": " | ".join(ctrl_u),
            "origem": r["origem"],
            "para": r["para"],
            "regra": r["regra"],
            "status": r["status"],
        }
    )


def find_campo(campos: list, label: str):
    nk = nkey(label)
    for c in campos:
        if nkey(c["campo"]) == nk or c["campo"] == label:
            return c
    return None


colunas = []
for classe, campos in by.items():
    if not campos:
        continue
    lookup = campos
    ramos: dict[str, list] = {}
    for (cl, src), conds in show_map.items():
        if cl != classe:
            continue
        trigger = find_campo(lookup, src)
        if not trigger:
            continue
        tname = trigger["campo"]
        if src in OPCAO_CAIXA:
            branches = []
            for opt in OPCAO_CAIXA[src]:
                tgts = conds.get(opt, [])
                resolved = [find_campo(lookup, t) for t in tgts]
                branches.append(
                    {
                        "condicao": opt,
                        "tipo": "opcao",
                        "campos": [x for x in resolved if x],
                    }
                )
            ramos[tname] = branches
        else:
            merged: OrderedDict[tuple, list] = OrderedDict()
            labels_for: dict[tuple, list[str]] = {}
            for cond, tgts in conds.items():
                key = tuple(tgts)
                if key not in merged:
                    merged[key] = list(tgts)
                    labels_for[key] = [cond]
                else:
                    labels_for[key].append(cond)
            branches = []
            for key, tgts in merged.items():
                resolved = [find_campo(lookup, t) for t in tgts]
                branches.append(
                    {
                        "condicao": " / ".join(labels_for[key]),
                        "tipo": "campos",
                        "campos": [x for x in resolved if x],
                    }
                )
            ramos[tname] = branches

    deps = dependentes.get(classe, set())
    main = [c for c in campos if nkey(c["campo"]) not in deps]
    colunas.append({"classe": classe, "campos": main, "ramos": ramos})

payload = json.dumps(colunas, ensure_ascii=False)

tsx = r'''import {
  Callout,
  Checkbox,
  H1,
  Pill,
  Row,
  Stack,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type Campo = {
  campo: string;
  obrg: string;
  ro: string;
  vis: string;
  controla: string;
  origem: string;
  para: string;
  regra: string;
  status: string;
};

type Rama = {
  condicao: string;
  tipo: "opcao" | "campos";
  campos: Campo[];
};

type Coluna = { classe: string; campos: Campo[]; ramos: Record<string, Rama[]> };

const COLUNAS: Coluna[] = ''' + payload + r''';

const GRUPOS: Array<{ id: string; label: string; classes: string[] }> = [
  {
    id: "aux",
    label: "1. Cadastros auxiliares",
    classes: ["Métrica", "Tipo de Cobrança", "Categoria de Serviços", "Grupo", "Modelo de Venda"],
  },
  {
    id: "ctx",
    label: "2. Parceria e solução",
    classes: ["Parceria", "Solução"],
  },
  {
    id: "cat",
    label: "3. Catálogo",
    classes: ["Catálogo", "Métrica do catálogo", "Complexidade do catálogo", "Catálogo Universal"],
  },
  {
    id: "prod",
    label: "4. Produto",
    classes: ["Produto", "Dados de Parceria por Produto"],
  },
  {
    id: "analise",
    label: "5. Análise MTI",
    classes: ["Análise de catálogo / produto (MTI)"],
  },
];

const BOX_W = 200;
const BOX_H = 44;
const FORK_W = 52;

function ArrowDown({ color }: { color: string }) {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
      <path d="M5 1 v7 M2 5.5 L5 9 L8 5.5" fill="none" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

function ForkSvg({
  color,
  centers,
  startY,
}: {
  color: string;
  centers: number[];
  startY: number;
}) {
  const h = Math.max(startY + 8, ...(centers.map((y) => y + 10)));
  const neck = 22;
  const d = [`M 0 ${startY} H ${neck}`]
    .concat(centers.map((y) => `M ${neck} ${startY} V ${y} H ${FORK_W}`))
    .join(" ");
  return (
    <svg width={FORK_W} height={h} style={{ flexShrink: 0, overflow: "visible" }} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      {centers.map((y) => (
        <path
          key={y}
          d={`M ${FORK_W - 7} ${y - 3.5} L ${FORK_W} ${y} L ${FORK_W - 7} ${y + 3.5}`}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
        />
      ))}
    </svg>
  );
}

export default function DiagramaColunasFase2() {
  const theme = useHostTheme();
  const [grupo, setGrupo] = useCanvasState("grupo", "cat");
  const [legado, setLegado] = useCanvasState("legado", false);
  const [sel, setSel] = useCanvasState("sel", "Catálogo|Estrutura de variação");
  const [selClasse, selCampo] = sel.split("|");

  const g = GRUPOS.find((x) => x.id === grupo) ?? GRUPOS[0];
  const visiveis = COLUNAS.filter((c) => g.classes.includes(c.classe));

  const boxBase = {
    width: BOX_W,
    minHeight: BOX_H,
    boxSizing: "border-box" as const,
    border: `1px solid ${theme.stroke.primary}`,
    borderRadius: 8,
    background: theme.bg.elevated,
    padding: "8px 12px",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    textAlign: "center" as const,
  };

  function visiveisDe(list: Campo[]) {
    return legado ? list : list.filter((f) => f.status !== "Legado");
  }

  const selected = visiveis
    .flatMap((c) => {
      const laterais = Object.values(c.ramos ?? {}).flatMap((rs) => rs.flatMap((r) => r.campos));
      return [...c.campos, ...laterais].map((f) => ({ ...f, classe: c.classe }));
    })
    .find((f) => f.classe === selClasse && f.campo === selCampo);

  function FieldBox({ classe, f }: { classe: string; f: Campo }) {
    const on = selClasse === classe && selCampo === f.campo;
    return (
      <div
        onClick={() => setSel(`${classe}|${f.campo}`)}
        style={{
          ...boxBase,
          cursor: "pointer",
          background: on ? theme.fill.primary : theme.bg.elevated,
          borderColor: on ? theme.accent.primary : theme.stroke.primary,
        }}
      >
        <Text as="span" size="small" weight={on ? "semibold" : "normal"}>
          {f.campo}
          {f.obrg === "Sim" ? " *" : ""}
        </Text>
      </div>
    );
  }

  function OpcaoBox({ label }: { label: string }) {
    return (
      <div
        style={{
          ...boxBase,
          cursor: "default",
          background: theme.fill.secondary,
        }}
      >
        <Text as="span" size="small" weight="semibold">
          {label}
        </Text>
      </div>
    );
  }

  function RamaRow({ classe, rama }: { classe: string; rama: Rama }) {
    const campos = visiveisDe(rama.campos);
    if (rama.tipo === "opcao") {
      return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          <OpcaoBox label={rama.condicao} />
          {campos.length > 0 ? (
            <>
              <svg width="36" height={BOX_H} style={{ flexShrink: 0 }} aria-hidden>
                <path
                  d={`M 0 ${BOX_H / 2} H 36`}
                  fill="none"
                  stroke={theme.stroke.primary}
                  strokeWidth="1.6"
                />
                <path
                  d={`M 29 ${BOX_H / 2 - 3.5} L 36 ${BOX_H / 2} L 29 ${BOX_H / 2 + 3.5}`}
                  fill="none"
                  stroke={theme.stroke.primary}
                  strokeWidth="1.6"
                />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {campos.map((f) => (
                  <FieldBox key={f.campo} classe={classe} f={f} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            width: 92,
            minHeight: BOX_H,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Text as="span" size="small" tone="secondary">
            se {rama.condicao}
          </Text>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {campos.map((f) => (
            <FieldBox key={f.campo} classe={classe} f={f} />
          ))}
        </div>
      </div>
    );
  }

  function ramaAltura(rama: Rama): number {
    const campos = visiveisDe(rama.campos);
    if (rama.tipo === "opcao") {
      const stack = Math.max(1, campos.length) * BOX_H + Math.max(0, campos.length - 1) * 8;
      return Math.max(BOX_H, stack);
    }
    const stack = Math.max(1, campos.length) * BOX_H + Math.max(0, campos.length - 1) * 8;
    return stack;
  }

  function FieldFork({ classe, trigger, ramos }: { classe: string; trigger: Campo; ramos: Rama[] }) {
    let y = BOX_H / 2;
    const centers: number[] = [];
    ramos.forEach((rama, i) => {
      if (i === 0) {
        centers.push(BOX_H / 2);
        y = ramaAltura(rama);
      } else {
        y += 12;
        centers.push(y + BOX_H / 2);
        y += ramaAltura(rama);
      }
    });
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
        <FieldBox classe={classe} f={trigger} />
        <ForkSvg color={theme.stroke.primary} centers={centers} startY={BOX_H / 2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ramos.map((rama) => (
            <RamaRow key={rama.condicao} classe={classe} rama={rama} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Stack gap={14} style={{ padding: 16 }}>
      <H1>Classes e campos — Fase 2</H1>
      <Text tone="secondary" size="small">
        Coluna da classe à esquerda. Se marcar ou informar um campo faz outros aparecerem, esses
        campos ficam à direita, ligados pela seta.
      </Text>
      <Row gap={8} wrap>
        {GRUPOS.map((item) => (
          <Pill key={item.id} active={grupo === item.id} onClick={() => setGrupo(item.id)}>
            {item.label}
          </Pill>
        ))}
      </Row>
      <Checkbox
        checked={legado}
        onChange={setLegado}
        label="Mostrar campos legado (Descrição, Recorrência, etc.)"
      />

      <div
        style={{
          position: "relative",
          overflow: "auto",
          maxHeight: 560,
          padding: 24,
          border: `1px solid ${theme.stroke.secondary}`,
          borderRadius: 8,
          background: theme.bg.editor,
        }}
      >
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          aria-hidden
        >
          <defs>
            <pattern id="dotgrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.85" fill={theme.stroke.tertiary} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 40,
            justifyContent: "flex-start",
            minWidth: "max-content",
            width: "100%",
          }}
        >
          {visiveis.map((col) => {
            const campos = visiveisDe(col.campos);
            return (
              <div
                key={col.classe}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  flexShrink: 0,
                }}
              >
                <div style={{ ...boxBase, background: theme.fill.secondary, cursor: "default" }}>
                  <Text weight="semibold" as="span">
                    {col.classe}
                  </Text>
                </div>
                {campos.map((f) => {
                  const ramosCampo = (col.ramos ?? {})[f.campo] ?? [];
                  const temRamo = ramosCampo.length > 0;
                  return (
                    <div
                      key={f.campo}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <div style={{ height: 16, display: "flex", alignItems: "center", width: BOX_W, justifyContent: "center" }}>
                        <ArrowDown color={theme.text.tertiary} />
                      </div>
                      {temRamo ? (
                        <FieldFork classe={col.classe} trigger={f} ramos={ramosCampo} />
                      ) : (
                        <FieldBox classe={col.classe} f={f} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selected ? (
        <Stack gap={6}>
          <Row gap={8} align="center">
            <Text weight="semibold">
              {selected.classe} · {selected.campo}
            </Text>
            <Pill
              size="sm"
              tone={
                selected.status === "Confirmado"
                  ? "success"
                  : selected.status === "Aberto na fonte"
                    ? "warning"
                    : "neutral"
              }
            >
              {selected.status}
            </Pill>
          </Row>
          <Text size="small">Para que serve: {selected.para}</Text>
          <Text size="small">De onde vem: {selected.origem}</Text>
          <Text size="small">Quando aparece: {selected.vis}</Text>
          {selected.controla ? (
            <Text size="small" weight="semibold">
              Ao informar este campo: {selected.controla}
            </Text>
          ) : null}
          <Text size="small">
            Regra: {selected.regra}
            {selected.ro === "Sim" ? " Somente leitura." : ""}
          </Text>
        </Stack>
      ) : null}

      <Callout tone="neutral" title="Como ler">
        A coluna é o fluxo normal do formulário. A seta para a direita mostra o que aparece ao
        marcar ou informar o campo da esquerda. Caixa cinza é valor da opção (ex.: Por peso). * =
        obrigatório. Clique no campo para ver origem e regra.
      </Callout>
    </Stack>
  );
}
'''

out = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases\diagrama-colunas-classes-fase2.canvas.tsx"
)
out2 = Path(
    r"C:\Users\LucasSantos\.cursor\projects\c-Users-LucasSantos-OneDrive-EloGroup-rea-de-Trabalho-Cursor-Especificador-Sydle\canvases\diagrama-classes-fase2-catalogo.canvas.tsx"
)
out.write_text(tsx, encoding="utf-8")
out2.write_text(tsx, encoding="utf-8")
print("wrote", out.name, out.stat().st_size)
print("wrote", out2.name, out2.stat().st_size)
for col in colunas:
    if col["ramos"]:
        print("RAMOS", col["classe"])
        for src, brs in col["ramos"].items():
            for b in brs:
                nomes = [c["campo"] for c in b["campos"]]
                print(f"  {src} [{b['tipo']}] {b['condicao']} -> {nomes}")
        mains = [c["campo"] for c in col["campos"]]
        print("  MAIN", mains)
