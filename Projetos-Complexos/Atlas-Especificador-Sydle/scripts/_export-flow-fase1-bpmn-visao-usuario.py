"""Gera uma visão BPMN simplificada, numerada e orientada ao usuário."""
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "exports" / "fase-1-cadastro-organizacao.bpmn"
OUTPUT_COPY = ROOT / "exports" / "fase-1-cadastro-organizacao-visao-usuario.bpmn"

LANES = {
    "mti": ("lane_mti", "MTI", 40),
    "sistema": ("lane_sistema", "Sistema Atlas", 290),
    "cliente": ("lane_cliente", "Cliente", 540),
    "parceiro": ("lane_parceiro", "Parceiro", 790),
}

# id, tipo BPMN, nome visível, raia, x, y, explicação
NODES = [
    ("inicio", "startEvent", "Início", "mti", 180, 120, "Início do cadastro."),
    ("n1", "userTask", "1. Cadastrar Organização", "mti", 300, 95,
     "Abrir um novo cadastro de Organização."),
    ("n2", "userTask", "2. Preencher Dados do Cadastro", "mti", 520, 95,
     "Nome, Sigla, CNPJ, Código cliente/parceiro e Ativo."),
    ("n3", "userTask", "3. Preencher Informações Adicionais", "mti", 740, 95,
     "Organização raiz, Tipo MTI/Cliente/Parceiro, Poder ou Parcerias, Responsável e Observações."),
    ("n4", "exclusiveGateway", "4. Organização raiz?", "sistema", 970, 355,
     "O valor altera imediatamente os campos e as seções visíveis."),
    ("n41", "serviceTask", "4.1 Sim — Exibir dados da raiz", "sistema", 1150, 305,
     "Exibir Dados da Organização, validação de CNPJ, contas bancárias, Tributos e seleção de Etapas. Ocultar Organização pai, Nível e Caminho."),
    ("n42", "serviceTask", "4.2 Não — Exibir hierarquia", "sistema", 1150, 405,
     "Exibir Organização pai, Nível e Unidade substituída. Ocultar campos exclusivos da raiz."),
    ("n421", "userTask", "4.2.1 Selecionar Organização pai", "mti", 1370, 95,
     "Selecionar a unidade imediatamente superior."),
    ("n422", "serviceTask", "4.2.2 Calcular Nível e Caminho", "sistema", 1580, 405,
     "Nível = Nível do pai + 1; Caminho = Caminho do pai / Sigla."),
    ("n5", "userTask", "5. Incluir etapas documentais", "mti", 1800, 55,
     "Somente para Organização raiz. Selecionar as etapas e clicar em Adicionar."),
    ("join_hierarquia", "exclusiveGateway", "5.1 Continuar com campos visíveis", "sistema", 2010, 355,
     "A organização filha ignora campos e seções exclusivos da raiz."),
    ("n6", "userTask", "6. Salvar Organização", "mti", 2180, 95,
     "Salvar apenas os campos atualmente visíveis."),
    ("n7", "businessRuleTask", "7. Verificar Responsável e CPF", "sistema", 2390, 345,
     "O Responsável precisa existir como Pessoa e possuir CPF."),
    ("g7", "exclusiveGateway", "7.1 Responsável válido?", "sistema", 2600, 355,
     "Se não estiver válido, a MTI regulariza a Pessoa."),
    ("n72", "userTask", "7.2 Cadastrar ou corrigir Pessoa", "mti", 2770, 95,
     "Nome, CPF, Perfil, Organização e E-mail."),
    ("n8", "businessRuleTask", "8. Verificar vínculo com a Organização", "sistema", 2980, 345,
     "A Pessoa deve ocupar um Cargo ativo da Organização."),
    ("g8", "exclusiveGateway", "8.1 Vínculo válido?", "sistema", 3190, 355,
     "Validar Pessoa, Cargo, Organização, condição e vigência."),
    ("n82", "userTask", "8.2 Cadastrar ou selecionar Cargo", "mti", 3360, 55,
     "Nome, Sigla, Organização, Ativo e Permissões."),
    ("n83", "userTask", "8.3 Vincular Pessoa ao Cargo", "mti", 3560, 145,
     "Condição, Região, Data inicial/final e Ativo."),
    ("n9", "serviceTask", "9. Liberar cadastro e notificar", "sistema", 3770, 345,
     "Status Em apresentação; enviar link ao Responsável."),
    ("g9", "exclusiveGateway", "9.1 Perfil do Responsável", "sistema", 3980, 355,
     "Direcionar para Portal Cliente ou Portal Parceiro."),
    ("n10c", "userTask", "10C. Acessar Portal Cliente", "cliente", 4160, 595,
     "Entrar com MT Login ou Gov.br."),
    ("n10p", "userTask", "10P. Acessar Portal Parceiro", "parceiro", 4160, 845,
     "Entrar com MT Login ou Gov.br."),
    ("n11", "serviceTask", "11. Validar CPF autenticado", "sistema", 4380, 345,
     "Comparar o CPF retornado com a Pessoa responsável e seu vínculo."),
    ("g11", "exclusiveGateway", "11.1 CPF e vínculo válidos?", "sistema", 4590, 355,
     "Somente o Responsável vinculado pode abrir a Organização."),
    ("n112", "serviceTask", "11.2 Negar acesso", "sistema", 4570, 445,
     "Não exibir os dados da Organização."),
    ("g12", "exclusiveGateway", "12. Abrir cadastro pelo perfil", "sistema", 4780, 355,
     "Carregar somente campos e seções permitidos ao perfil e à condição Raiz/Não raiz."),
    ("n13c", "userTask", "13C. Completar Pessoa", "cliente", 4960, 545,
     "Dados pessoais e contato."),
    ("n14c", "userTask", "14C. Completar campos visíveis da Organização", "cliente", 5160, 545,
     "Raiz: dados jurídicos e demais seções disponíveis. Não raiz: somente dados, hierarquia, contato, permissões e usuários visíveis."),
    ("n15c", "userTask", "15C. Revisar e enviar", "cliente", 5360, 545,
     "Enviar o cadastro para análise da MTI."),
    ("n13p", "userTask", "13P. Completar Pessoa", "parceiro", 4960, 795,
     "Dados pessoais e contato."),
    ("n14p", "userTask", "14P. Completar campos visíveis da Organização", "parceiro", 5160, 795,
     "Raiz: dados jurídicos, documentos, tributos, contas e contato. Não raiz: campos exclusivos da raiz permanecem ocultos."),
    ("n15p", "userTask", "15P. Anexar documentos visíveis", "parceiro", 5360, 795,
     "Anexar somente os documentos apresentados na tela."),
    ("n16p", "userTask", "16P. Revisar e enviar", "parceiro", 5560, 795,
     "Enviar o cadastro para análise da MTI."),
    ("n17", "businessRuleTask", "17. Validar cadastro enviado", "sistema", 5770, 345,
     "Validar apenas campos visíveis e obrigatórios, além de Pessoa, Cargo e documentos apresentados."),
    ("g17", "exclusiveGateway", "17.1 Cadastro completo?", "sistema", 5980, 355,
     "Pendências devolvem o usuário ao cadastro."),
    ("n172", "serviceTask", "17.2 Exibir pendências", "sistema", 5960, 445,
     "Mostrar campos ou documentos que ainda precisam ser preenchidos."),
    ("n18", "serviceTask", "18. Enviar para análise MTI", "sistema", 6160, 345,
     "Status Completa – aguardando MTI."),
    ("n19", "userTask", "19. Analisar Organização, Pessoa, Cargo e documentos", "mti", 6370, 95,
     "Conferir os dados apresentados e os vínculos."),
    ("n20", "userTask", "20. Elaborar e enviar parecer", "mti", 6590, 95,
     "Aprovar, Solicitar ajuste ou Reprovar."),
    ("g20", "exclusiveGateway", "20.1 Decisão", "sistema", 6800, 355,
     "Aplicar a decisão registrada pela MTI."),
    ("n202", "serviceTask", "20.2 Aprovar", "sistema", 6970, 295,
     "Status Aprovada pela MTI."),
    ("n203", "serviceTask", "20.3 Solicitar ajuste", "sistema", 6970, 375,
     "Status Em apresentação; notificar e reabrir os campos permitidos."),
    ("n204", "serviceTask", "20.4 Reprovar", "sistema", 6970, 455,
     "Status Reprovada pela MTI."),
    ("fim_ok", "endEvent", "Cadastro aprovado", "sistema", 7210, 312,
     "Fim aprovado."),
    ("fim_nok", "endEvent", "Cadastro reprovado", "sistema", 7210, 472,
     "Fim reprovado."),
]

FLOWS = [
    ("f01", "inicio", "n1", ""),
    ("f02", "n1", "n2", ""),
    ("f03", "n2", "n3", ""),
    ("f04", "n3", "n4", ""),
    ("f05", "n4", "n41", "Sim"),
    ("f06", "n4", "n42", "Não"),
    ("f07", "n41", "n5", "Campos da raiz"),
    ("f08", "n5", "join_hierarquia", ""),
    ("f09", "n42", "n421", ""),
    ("f10", "n421", "n422", ""),
    ("f11", "n422", "join_hierarquia", "Sem etapas da raiz"),
    ("f12", "join_hierarquia", "n6", ""),
    ("f13", "n6", "n7", ""),
    ("f14", "n7", "g7", ""),
    ("f15", "g7", "n72", "Não"),
    ("f16", "n72", "n7", "Revalidar"),
    ("f17", "g7", "n8", "Sim"),
    ("f18", "n8", "g8", ""),
    ("f19", "g8", "n82", "Não"),
    ("f20", "n82", "n83", ""),
    ("f21", "n83", "n8", "Revalidar"),
    ("f22", "g8", "n9", "Sim"),
    ("f23", "n9", "g9", ""),
    ("f24", "g9", "n10c", "Cliente"),
    ("f25", "g9", "n10p", "Parceiro"),
    ("f26", "n10c", "n11", "MT Login / Gov.br"),
    ("f27", "n10p", "n11", "MT Login / Gov.br"),
    ("f28", "n11", "g11", ""),
    ("f29", "g11", "n112", "Não"),
    ("f30", "n112", "g9", "Tentar novamente"),
    ("f31", "g11", "g12", "Sim"),
    ("f32", "g12", "n13c", "Cliente"),
    ("f33", "g12", "n13p", "Parceiro"),
    ("f34", "n13c", "n14c", ""),
    ("f35", "n14c", "n15c", ""),
    ("f36", "n15c", "n17", ""),
    ("f37", "n13p", "n14p", ""),
    ("f38", "n14p", "n15p", ""),
    ("f39", "n15p", "n16p", ""),
    ("f40", "n16p", "n17", ""),
    ("f41", "n17", "g17", ""),
    ("f42", "g17", "n172", "Não"),
    ("f43", "n172", "g12", "Corrigir"),
    ("f44", "g17", "n18", "Sim"),
    ("f45", "n18", "n19", ""),
    ("f46", "n19", "n20", ""),
    ("f47", "n20", "g20", ""),
    ("f48", "g20", "n202", "Aprovar"),
    ("f49", "g20", "n203", "Solicitar ajuste"),
    ("f50", "g20", "n204", "Reprovar"),
    ("f51", "n202", "fim_ok", ""),
    ("f52", "n203", "g12", "Corrigir e reenviar"),
    ("f53", "n204", "fim_nok", ""),
]


def bounds(node):
    _, kind, _, _, x, y, _ = node
    if kind in {"startEvent", "endEvent"}:
        return x, y, 36, 36
    if kind == "exclusiveGateway":
        return x, y, 50, 50
    return x, y, 180, 70


def center(rect):
    x, y, width, height = rect
    return x + width / 2, y + height / 2


def route(source, target):
    sx, sy = center(source)
    tx, ty = center(target)
    if abs(sy - ty) < 8:
        return [(sx, sy), (tx, ty)]
    if tx < sx - 400:
        return [(sx, sy), (sx + 30, sy), (sx + 30, 1080), (tx - 30, 1080), (tx - 30, ty), (tx, ty)]
    middle = (sx + tx) / 2
    return [(sx, sy), (middle, sy), (middle, ty), (tx, ty)]


def main():
    by_id = {node[0]: node for node in NODES}
    incoming = {node[0]: [] for node in NODES}
    outgoing = {node[0]: [] for node in NODES}
    for flow_id, source, target, _ in FLOWS:
        outgoing[source].append(flow_id)
        incoming[target].append(flow_id)

    lane_nodes = {key: [] for key in LANES}
    for node_id, _, _, lane, _, _, _ in NODES:
        lane_nodes[lane].append(node_id)

    process = ['    <bpmn:laneSet id="lanes_usuario">']
    for key, (lane_id, name, _) in LANES.items():
        refs = "".join(f"<bpmn:flowNodeRef>{node}</bpmn:flowNodeRef>" for node in lane_nodes[key])
        process.append(f'      <bpmn:lane id="{lane_id}" name="{escape(name)}">{refs}</bpmn:lane>')
    process.append("    </bpmn:laneSet>")

    for node_id, kind, name, _, _, _, documentation in NODES:
        refs = "".join(f"<bpmn:incoming>{flow}</bpmn:incoming>" for flow in incoming[node_id])
        refs += "".join(f"<bpmn:outgoing>{flow}</bpmn:outgoing>" for flow in outgoing[node_id])
        process.append(
            f'    <bpmn:{kind} id="{node_id}" name="{escape(name)}">'
            f"<bpmn:documentation>{escape(documentation)}</bpmn:documentation>{refs}</bpmn:{kind}>"
        )

    gateway_ids = {node[0] for node in NODES if node[1] == "exclusiveGateway"}
    for flow_id, source, target, name in FLOWS:
        name_attr = f' name="{escape(name)}"' if name else ""
        condition = ""
        if source in gateway_ids and name:
            condition = (
                '<bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">'
                f"{escape(name)}</bpmn:conditionExpression>"
            )
        process.append(
            f'    <bpmn:sequenceFlow id="{flow_id}" sourceRef="{source}" targetRef="{target}"{name_attr}>'
            f"{condition}</bpmn:sequenceFlow>"
        )

    shapes = [
        '      <bpmndi:BPMNShape id="participant_di" bpmnElement="participant" isHorizontal="true">'
        '<dc:Bounds x="80" y="40" width="7300" height="1000"/></bpmndi:BPMNShape>'
    ]
    for lane_id, _, y in LANES.values():
        shapes.append(
            f'      <bpmndi:BPMNShape id="{lane_id}_di" bpmnElement="{lane_id}" isHorizontal="true">'
            f'<dc:Bounds x="110" y="{y}" width="7270" height="250"/></bpmndi:BPMNShape>'
        )
    node_rects = {}
    for node in NODES:
        node_id, kind = node[0], node[1]
        x, y, width, height = bounds(node)
        node_rects[node_id] = (x, y, width, height)
        marker = ' isMarkerVisible="true"' if kind == "exclusiveGateway" else ""
        shapes.append(
            f'      <bpmndi:BPMNShape id="{node_id}_di" bpmnElement="{node_id}"{marker}>'
            f'<dc:Bounds x="{x}" y="{y}" width="{width}" height="{height}"/></bpmndi:BPMNShape>'
        )

    edges = []
    for flow_id, source, target, _ in FLOWS:
        points = route(node_rects[source], node_rects[target])
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
  id="Definitions_CadastroUsuario"
  targetNamespace="https://atlas.mti.mt.gov.br/bpmn">
  <bpmn:collaboration id="collaboration_usuario">
    <bpmn:participant id="participant" name="Fase 1 — Cadastro da Organização (visão do usuário)" processRef="process_usuario" />
  </bpmn:collaboration>
  <bpmn:process id="process_usuario" name="Cadastro da Organização" isExecutable="false">
    <bpmn:documentation>
      Fluxo numerado, orientado ao usuário e alinhado às regras de visibilidade da classe Organização.
      Organização raiz = Não oculta os campos exclusivos da raiz; se a seção ficar sem campos visíveis,
      o accordion correspondente também não é apresentado.
    </bpmn:documentation>
{chr(10).join(process)}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="diagram_usuario">
    <bpmndi:BPMNPlane id="plane_usuario" bpmnElement="collaboration_usuario">
{chr(10).join(shapes)}
{chr(10).join(edges)}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
"""
    OUTPUT.write_text(xml, encoding="utf-8")
    OUTPUT_COPY.write_text(xml, encoding="utf-8")
    print(f"Gerado: {OUTPUT}")
    print(f"Cópia: {OUTPUT_COPY}")
    print(f"Elementos: {len(NODES)} | Fluxos: {len(FLOWS)}")


if __name__ == "__main__":
    main()
