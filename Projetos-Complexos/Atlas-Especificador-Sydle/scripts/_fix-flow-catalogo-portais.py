# -*- coding: utf-8 -*-
"""Substitui fluxo lanes/nodes pelo formato steps BPMN do protótipo."""
from __future__ import annotations

import json
from pathlib import Path

FLOWS = Path(__file__).resolve().parents[1] / (
    "data/subprojects/atlas-prototipo/epics/prototipo/flows.json"
)

HTML_INICIO = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:860px;padding:8px 4px;color:#0f172a">
  <h1 style="margin:0 0 8px;color:#0c1ba8;font-size:24px">Parceiro · MTI · Cliente</h1>
  <p style="margin:0 0 12px;color:#475569;font-size:14px">
    Cada ator usa um canal. Status do catálogo/produto se espelha entre portal do parceiro e backoffice.
  </p>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead>
      <tr style="background:#0c1ba8;color:#fff">
        <th style="padding:8px;text-align:left">Ator</th>
        <th style="padding:8px;text-align:left">Canal</th>
        <th style="padding:8px;text-align:left">Ações no catálogo</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px"><b>Parceiro</b></td>
        <td style="padding:8px">Portal do Parceiro</td>
        <td style="padding:8px">Rascunho · CSV · Enviar à MTI · Corrigir ajuste</td>
      </tr>
      <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc">
        <td style="padding:8px"><b>MTI</b></td>
        <td style="padding:8px">Backoffice apenas</td>
        <td style="padding:8px">CRUD · Análise · Publicar · Nova versão · Apostilar</td>
      </tr>
      <tr>
        <td style="padding:8px"><b>Cliente</b></td>
        <td style="padding:8px">Portal do Cliente</td>
        <td style="padding:8px"><b>Não cadastra</b> · Consome versão do contrato · Cotação/Demanda/OS</td>
      </tr>
    </tbody>
  </table>
</div>
""".strip()


def build_flow() -> dict:
    return {
        "id": "flow-proto-catalogo-portal-mti-cliente",
        "name": "Catálogo — Parceiro (portal) → MTI (backoffice) → Cliente (portal)",
        "metadata": (
            "Parceiro cadastra/envia no Portal do Parceiro; MTI analisa/publica só no backoffice; "
            "Cliente consome no Portal do Cliente (sem cadastrar catálogo). Status espelhado."
        ),
        "steps": [
            {
                "id": "step-ppc-inicio",
                "title": "0. Matriz de atores e canais",
                "type": "html",
                "htmlPresentationShowHeader": True,
                "htmlPresentationHeaderTitle": "Atlas · Catálogo · Portais",
                "htmlContent": HTML_INICIO,
            },
            {
                "id": "step-ppc-parceiro-cadastro",
                "title": "1. Parceiro cadastra catálogo/produtos",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Cadastrar rascunho no Portal do Parceiro",
                "bpmnDescription": (
                    "Parceiro cria/edita catálogo e produtos da sua parceria (manual ou CSV). "
                    "Status = Rascunho (parceiro). Não cria versão contratual nem publica em Produção."
                ),
                "assigneeRole": "Parceiro (portal)",
                "assigneeRoleDetail": "Acesso somente ao Portal do Parceiro — não usa backoffice.",
                "bpmnInputs": "Parceria homologada, planilha CSV ou itens manuais.",
                "bpmnOutputs": "Catálogo/produtos em rascunho com status de fluxo espelhado.",
                "bpmnRuleList": [
                    "Somente produtos da parceria do usuário logado",
                    "Não publica em Produção",
                    "Não cria versão contratual (apostilamento é MTI)",
                ],
                "bpmnPossiblePaths": [
                    {"key": "Salvar rascunho", "value": "step-ppc-enviar"}
                ],
                "linkedFormId": "form-patlasv4-proto-portal-parceiro-catalogo",
                "bpmnFormConfirmNavigateStepId": "step-ppc-enviar",
            },
            {
                "id": "step-ppc-enviar",
                "title": "2. Parceiro envia à MTI",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Enviar à MTI",
                "bpmnDescription": (
                    "Método Enviar à MTI. Status → Aguardando análise MTI. "
                    "Edição bloqueada no portal até parecer."
                ),
                "assigneeRole": "Parceiro (portal)",
                "bpmnInputs": "Catálogo/produtos em rascunho ou após ajuste.",
                "bpmnOutputs": "Pedido de análise visível no backoffice MTI.",
                "bpmnRuleList": [
                    "Status Aguardando análise MTI",
                    "Espelho no backoffice",
                ],
                "bpmnPossiblePaths": [{"key": "Enviado", "value": "step-ppc-analise"}],
                "linkedFormId": "form-patlasv4-proto-portal-parceiro-catalogo",
                "bpmnFormConfirmNavigateStepId": "step-ppc-analise",
            },
            {
                "id": "step-ppc-analise",
                "title": "3. MTI analisa (backoffice)",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Análise de catálogo / produto",
                "bpmnDescription": (
                    "Classe Análise no backoffice: Aprovar, Solicitar ajuste ou Reprovar. "
                    "Assinatura obrigatória. MTI não usa portal do parceiro/cliente para essa decisão."
                ),
                "assigneeRole": "Analista MTI (backoffice)",
                "assigneeRoleDetail": "Acesso exclusivo ao backoffice Atlas.",
                "bpmnInputs": "Catálogo embutido + produtos enviados pelo portal.",
                "bpmnOutputs": "Decisão + justificativa ou observação.",
                "bpmnRuleList": [
                    "Aprovar → Homologado (opcional publicar → Ativo)",
                    "Solicitar ajuste → Ajuste solicitado (volta ao parceiro)",
                    "Reprovar → Reprovado",
                    "Assinatura digital obrigatória",
                ],
                "bpmnPossiblePaths": [
                    {"key": "Solicitar ajuste", "value": "step-ppc-ajuste"},
                    {"key": "Aprovar", "value": "step-ppc-publicar"},
                    {"key": "Reprovar", "value": "step-ppc-fim-reprovado"},
                ],
                "linkedFormId": "form-patlasv4-proto-analise-catalogo",
                "bpmnSla": "5 dias úteis",
            },
            {
                "id": "step-ppc-ajuste",
                "title": "4. Parceiro corrige e reenvia",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Corrigir após parecer MTI",
                "bpmnDescription": (
                    "Portal do Parceiro exibe justificativa da MTI. "
                    "Parceiro edita e reenvia (volta ao passo 2)."
                ),
                "assigneeRole": "Parceiro (portal)",
                "bpmnInputs": "Justificativa MTI + anexo opcional.",
                "bpmnOutputs": "Nova versão de rascunho pronta para reenvio.",
                "bpmnRuleList": [
                    "Status Ajuste solicitado permite edição",
                    "Reenvio → Aguardando análise MTI",
                ],
                "bpmnPossiblePaths": [{"key": "Reenviar", "value": "step-ppc-enviar"}],
                "linkedFormId": "form-patlasv4-proto-portal-parceiro-catalogo",
                "bpmnFormConfirmNavigateStepId": "step-ppc-enviar",
            },
            {
                "id": "step-ppc-publicar",
                "title": "5. MTI publica / versiona",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Publicar e (se preciso) criar nova versão",
                "bpmnDescription": (
                    "Backoffice: Publicar (Produção) e Criar nova versão. "
                    "Cliente ainda não vê nova versão até apostilamento (RN-VER-03)."
                ),
                "assigneeRole": "Analista MTI (backoffice)",
                "bpmnInputs": "Catálogo homologado.",
                "bpmnOutputs": "Status Ativo (publicado); versão disponível para contrato.",
                "bpmnRuleList": [
                    "Publicar = Produção",
                    "Nova versão não sobrescreve a anterior (RN-VER-02)",
                ],
                "bpmnPossiblePaths": [{"key": "Publicado", "value": "step-ppc-apostila"}],
                "linkedFormId": "form-patlasv4-proto-cat-catalogo",
                "bpmnFormConfirmNavigateStepId": "step-ppc-apostila",
            },
            {
                "id": "step-ppc-apostila",
                "title": "6. Apostilar contrato (versão)",
                "type": "bpmnActivity",
                "bpmnTaskType": "userTask",
                "bpmnActivityKey": "Vincular versão ao contrato",
                "bpmnDescription": (
                    "MTI vincula a versão do catálogo ao contrato do cliente (apostilamento). "
                    "Só então o Portal do Cliente passa a exibir essa versão."
                ),
                "assigneeRole": "Analista MTI (backoffice)",
                "bpmnRuleList": [
                    "RN-VER-01 versão é do contrato",
                    "RN-VER-03 cliente só vê após apostilamento",
                ],
                "bpmnPossiblePaths": [{"key": "Apostilado", "value": "step-ppc-cliente"}],
            },
            {
                "id": "step-ppc-cliente",
                "title": "7. Cliente consome no portal",
                "type": "bpmnActivity",
                "bpmnTaskType": "entryForm",
                "bpmnActivityKey": "Consultar catálogo e consumir",
                "bpmnDescription": (
                    "Portal do Cliente: consulta itens em Produção da versão do contrato. "
                    "NÃO cadastra catálogo/produto. Ações: cotação (demanda), OS, acompanhar."
                ),
                "assigneeRole": "Cliente (portal)",
                "assigneeRoleDetail": "Acesso somente ao Portal do Cliente.",
                "bpmnInputs": "Contrato vigente + versão apostilada.",
                "bpmnOutputs": "Cotação/demanda/OS sobre itens contratados.",
                "bpmnRuleList": [
                    "Cliente não cadastra catálogo nem produto",
                    "Visão limitada à versão do contrato",
                    "Itens ausentes do contrato ficam marcados / sem consumo",
                ],
                "bpmnPossiblePaths": [{"key": "Consumo ok", "value": "step-ppc-fim"}],
                "linkedFormId": "form-patlasv4-proto-portal-cliente-catalogo",
                "bpmnFormConfirmNavigateStepId": "step-ppc-fim",
            },
            {
                "id": "step-ppc-fim-reprovado",
                "title": "Fim — reprovado",
                "type": "html",
                "htmlContent": (
                    '<div style="font-family:Segoe UI,Arial,sans-serif;padding:12px">'
                    '<h2 style="color:#b91c1c">Catálogo/produto reprovado</h2>'
                    "<p>Status Reprovado espelhado no Portal do Parceiro. "
                    "Novo ciclo exige novo rascunho/envio.</p></div>"
                ),
            },
            {
                "id": "step-ppc-fim",
                "title": "Fim — ciclo completo",
                "type": "html",
                "htmlContent": (
                    '<div style="font-family:Segoe UI,Arial,sans-serif;padding:12px">'
                    '<h2 style="color:#15803d">Portal ↔ Backoffice alinhados</h2>'
                    "<p>Parceiro enviou · MTI homologou/publicou · "
                    "Cliente consome a versão do contrato.</p></div>"
                ),
            },
        ],
    }


def main() -> None:
    flows = json.loads(FLOWS.read_text(encoding="utf-8"))
    flows = [f for f in flows if f.get("id") != "flow-proto-catalogo-portal-mti-cliente"]
    flows.insert(0, build_flow())
    FLOWS.write_text(json.dumps(flows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK flow steps", len(flows[0]["steps"]))


if __name__ == "__main__":
    main()
