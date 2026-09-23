"""Exporta o cadastro da Fase 1 como BPMN 2.0 com diagrama e raias."""
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "exports" / "fase-1-cadastro-organizacao-resumido.bpmn"

LANES = {
    "mti": ("lane_mti", "Analista MTI", 120),
    "sistema": ("lane_sistema", "Sistema", 380),
    "parceiro": ("lane_parceiro", "Responsável parceiro", 640),
}

NODES = [
    ("start", "startEvent", "Início", "mti", 180, 120),
    ("criar_org", "userTask", "Criar Organização raiz\n(Tipo = Parceiro)", "mti", 300, 95),
    ("configurar_etapas", "userTask", "Incluir etapas\ndocumentacionais", "mti", 500, 95),
    ("responsavel", "userTask", "Pré-cadastrar\nresponsável (CPF)", "mti", 700, 95),
    ("disponibilizar", "userTask", "Disponibilizar para\nparceiro finalizar", "mti", 900, 95),
    ("em_apresentacao", "serviceTask", "Status =\nEm apresentação", "sistema", 1100, 355),
    ("notificar", "sendTask", "Notificar\nresponsável", "sistema", 1300, 355),
    ("acessar_portal", "userTask", "Acessar portal", "parceiro", 1500, 615),
    ("preencher_dados", "userTask", "Preencher dados\nda organização", "parceiro", 1700, 615),
    ("anexar_docs", "userTask", "Anexar documentos\npor etapa e grupo", "parceiro", 1900, 615),
    ("obter_vencimento", "serviceTask", "Obter vencimento\nOCR / cálculo / manual", "sistema", 2100, 355),
    ("gw_vencido", "exclusiveGateway", "Documento\nvencido?", "sistema", 2310, 370),
    ("reanexar", "userTask", "Reanexar documento", "parceiro", 2285, 615),
    ("tributos_contatos", "userTask", "Preencher tributos\ne contatos", "parceiro", 2500, 615),
    ("enviar", "userTask", "Enviar cadastro\npara MTI", "parceiro", 2700, 615),
    ("aguardando_mti", "serviceTask", "Status = Completa –\naguardando MTI", "sistema", 2900, 355),
    ("analisar_docs", "userTask", "Analisar documentos\nAprovar / Recusar", "mti", 3100, 95),
    ("gw_decisao", "exclusiveGateway", "Decisão do\ncadastro", "mti", 3320, 110),
    ("aprovar", "userTask", "Aprovar cadastro", "mti", 3520, 50),
    ("ajustar", "userTask", "Solicitar ajuste", "mti", 3520, 145),
    ("reprovar", "userTask", "Reprovar cadastro", "mti", 3520, 240),
    ("status_aprovado", "serviceTask", "Status = Aprovada\nAcesso comercial = Sim", "sistema", 3740, 310),
    ("status_ajuste", "serviceTask", "Status =\nEm apresentação", "sistema", 3740, 405),
    ("status_reprovado", "serviceTask", "Status = Reprovada\nAcesso comercial = Não", "sistema", 3740, 500),
    ("end_aprovado", "endEvent", "Aprovada", "sistema", 3975, 325),
    ("end_reprovado", "endEvent", "Reprovada", "sistema", 3975, 515),
]

FLOWS = [
    ("f01", "start", "criar_org", ""),
    ("f02", "criar_org", "configurar_etapas", ""),
    ("f03", "configurar_etapas", "responsavel", ""),
    ("f04", "responsavel", "disponibilizar", ""),
    ("f05", "disponibilizar", "em_apresentacao", ""),
    ("f06", "em_apresentacao", "notificar", ""),
    ("f07", "notificar", "acessar_portal", ""),
    ("f08", "acessar_portal", "preencher_dados", ""),
    ("f09", "preencher_dados", "anexar_docs", ""),
    ("f10", "anexar_docs", "obter_vencimento", ""),
    ("f11", "obter_vencimento", "gw_vencido", ""),
    ("f12", "gw_vencido", "reanexar", "Sim"),
    ("f13", "reanexar", "anexar_docs", ""),
    ("f14", "gw_vencido", "tributos_contatos", "Não"),
    ("f15", "tributos_contatos", "enviar", ""),
    ("f16", "enviar", "aguardando_mti", ""),
    ("f17", "aguardando_mti", "analisar_docs", ""),
    ("f18", "analisar_docs", "gw_decisao", ""),
    ("f19", "gw_decisao", "aprovar", "Aprovar"),
    ("f20", "gw_decisao", "ajustar", "Solicitar ajuste"),
    ("f21", "gw_decisao", "reprovar", "Reprovar"),
    ("f22", "aprovar", "status_aprovado", ""),
    ("f23", "ajustar", "status_ajuste", ""),
    ("f24", "status_ajuste", "notificar", ""),
    ("f25", "reprovar", "status_reprovado", ""),
    ("f26", "status_aprovado", "end_aprovado", ""),
    ("f27", "status_reprovado", "end_reprovado", ""),
]


def bounds(node):
    _, kind, _, _, x, y = node
    if kind in {"startEvent", "endEvent"}:
        return x, y, 36, 36
    if kind == "exclusiveGateway":
        return x, y, 50, 50
    return x, y, 160, 70


def center(node):
    x, y, width, height = bounds(node)
    return x + width / 2, y + height / 2


def waypoint(source, target):
    sx, sy = center(source)
    tx, ty = center(target)
    if abs(sy - ty) < 5:
        return [(sx, sy), (tx, ty)]
    middle_x = (sx + tx) / 2
    return [(sx, sy), (middle_x, sy), (middle_x, ty), (tx, ty)]


def main():
    by_id = {node[0]: node for node in NODES}
    incoming = {node[0]: [] for node in NODES}
    outgoing = {node[0]: [] for node in NODES}
    for flow_id, source, target, _ in FLOWS:
        outgoing[source].append(flow_id)
        incoming[target].append(flow_id)

    lane_refs = {key: [] for key in LANES}
    for node_id, _, _, lane, _, _ in NODES:
        lane_refs[lane].append(node_id)

    process = []
    process.append('    <bpmn:laneSet id="laneSet_cadastro">')
    for key, (lane_id, name, _) in LANES.items():
        refs = "".join(f"<bpmn:flowNodeRef>{node}</bpmn:flowNodeRef>" for node in lane_refs[key])
        process.append(f'      <bpmn:lane id="{lane_id}" name="{escape(name)}">{refs}</bpmn:lane>')
    process.append("    </bpmn:laneSet>")

    for node_id, kind, name, _, _, _ in NODES:
        attrs = f'id="{node_id}" name="{escape(name)}"'
        refs = "".join(f"<bpmn:incoming>{flow}</bpmn:incoming>" for flow in incoming[node_id])
        refs += "".join(f"<bpmn:outgoing>{flow}</bpmn:outgoing>" for flow in outgoing[node_id])
        process.append(f"    <bpmn:{kind} {attrs}>{refs}</bpmn:{kind}>")

    for flow_id, source, target, name in FLOWS:
        name_attr = f' name="{escape(name)}"' if name else ""
        process.append(
            f'    <bpmn:sequenceFlow id="{flow_id}" sourceRef="{source}" '
            f'targetRef="{target}"{name_attr} />'
        )

    shapes = [
        '      <bpmndi:BPMNShape id="participant_di" bpmnElement="participant_cadastro" isHorizontal="true">'
        '<dc:Bounds x="80" y="40" width="4040" height="780"/></bpmndi:BPMNShape>'
    ]
    for key, (lane_id, _, y) in LANES.items():
        del key
        shapes.append(
            f'      <bpmndi:BPMNShape id="{lane_id}_di" bpmnElement="{lane_id}" isHorizontal="true">'
            f'<dc:Bounds x="110" y="{y - 80}" width="4010" height="260"/></bpmndi:BPMNShape>'
        )
    for node in NODES:
        node_id = node[0]
        x, y, width, height = bounds(node)
        marker = ' isMarkerVisible="true"' if node[1] == "exclusiveGateway" else ""
        shapes.append(
            f'      <bpmndi:BPMNShape id="{node_id}_di" bpmnElement="{node_id}"{marker}>'
            f'<dc:Bounds x="{x}" y="{y}" width="{width}" height="{height}"/></bpmndi:BPMNShape>'
        )

    edges = []
    for flow_id, source_id, target_id, _ in FLOWS:
        points = waypoint(by_id[source_id], by_id[target_id])
        waypoints = "".join(f'<di:waypoint x="{x}" y="{y}"/>' for x, y in points)
        edges.append(
            f'      <bpmndi:BPMNEdge id="{flow_id}_di" bpmnElement="{flow_id}">'
            f"{waypoints}</bpmndi:BPMNEdge>"
        )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_Fase1Cadastro"
  targetNamespace="https://atlas.mti.mt.gov.br/bpmn">
  <bpmn:collaboration id="collaboration_cadastro">
    <bpmn:participant id="participant_cadastro" name="Fase 1 — Cadastro da Organização (parceiro)" processRef="process_cadastro" />
  </bpmn:collaboration>
  <bpmn:process id="process_cadastro" name="Fase 1 — Cadastro da Organização (parceiro)" isExecutable="false">
{chr(10).join(process)}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="diagram_cadastro">
    <bpmndi:BPMNPlane id="plane_cadastro" bpmnElement="collaboration_cadastro">
{chr(10).join(shapes)}
{chr(10).join(edges)}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
"""
    OUTPUT.write_text(xml, encoding="utf-8")
    print(f"Gerado: {OUTPUT}")


if __name__ == "__main__":
    main()
