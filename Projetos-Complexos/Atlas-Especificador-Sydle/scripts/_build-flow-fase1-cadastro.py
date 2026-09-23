"""Cria/atualiza o fluxo Fase 1 — Cadastro da Organização (parceiro)."""
from __future__ import annotations

import json
from pathlib import Path

EPIC = Path(__file__).resolve().parents[1] / "data/subprojects/atlas-prototipo/epics/prototipo"
FLOWS = EPIC / "flows.json"

FLOW_ID = "flow-proto-fase1-cadastro-organizacao"
FORM_ORG = "form-patlasv4-proto-unidade-organizacional"
FORM_ETAPA = "form-patlasv4-proto-cat-etapa-documentacional"
FORM_TDOC = "form-patlasv4-proto-tipo-documento"
FORM_PORTAL = "form-patlasv4-proto-portal-onboarding-org"
FORM_DISP = "form-patlasv4-proto-metodo-disponibilizar-parceiro-org"
FORM_APROVAR = "form-patlasv4-proto-metodo-aprovar-cadastro-org"
FORM_AJUSTE = "form-patlasv4-proto-metodo-solicitar-ajuste-org"
FORM_REPROVAR = "form-patlasv4-proto-metodo-reprovar-cadastro-org"


def html(title: str, body: str) -> str:
    return (
        '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:940px;'
        'padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">'
        f'<h1 style="margin:0 0 10px;color:#004a8d;font-size:22px">{title}</h1>'
        f"{body}</div>"
    )


def bpmn(
    step_id: str,
    title: str,
    *,
    key: str,
    description: str,
    role: str,
    detail: str = "",
    inputs: str = "",
    outputs: str = "",
    rules: list[str] | None = None,
    next_id: str | None = None,
    paths: list[dict] | None = None,
    form_id: str | None = None,
    task_type: str = "userTask",
    confirm_next: str | None = None,
) -> dict:
    step: dict = {
        "id": step_id,
        "title": title,
        "type": "bpmnActivity",
        "bpmnTaskType": task_type,
        "bpmnActivityKey": key,
        "bpmnDescription": description,
        "assigneeRole": role,
    }
    if detail:
        step["assigneeRoleDetail"] = detail
    if inputs:
        step["bpmnInputs"] = inputs
    if outputs:
        step["bpmnOutputs"] = outputs
    if rules:
        step["bpmnRuleList"] = rules
    if form_id:
        step["linkedFormId"] = form_id
    if paths is not None:
        step["bpmnPossiblePaths"] = paths
        if confirm_next:
            step["bpmnFormConfirmNavigateStepId"] = confirm_next
        elif next_id:
            step["bpmnFormConfirmNavigateStepId"] = next_id
    elif next_id:
        step["bpmnPossiblePaths"] = [{"key": "Continuar", "value": next_id}]
        step["bpmnFormConfirmNavigateStepId"] = next_id
    return step


def build_flow() -> dict:
    steps = [
        {
            "id": "step-f1-inicio",
            "title": "0. Visão geral — Fase 1 Cadastro",
            "type": "html",
            "htmlPresentationShowHeader": True,
            "htmlPresentationHeaderTitle": "Atlas · Fase 1",
            "htmlContent": html(
                "Fase 1 — Cadastro da Organização (parceiro)",
                """
<p style="margin:0 0 12px;color:#475569">
  Fluxo ponta a ponta do primeiro vínculo: MTI cria e libera o cadastro;
  o parceiro completa no portal; a MTI analisa documentos e decide o cadastro.
</p>
<ol style="margin:0;padding-left:18px">
  <li><strong>MTI (back-office):</strong> cria Organização raiz (Tipo=Parceiro), configura etapas documentacionais, pré-cadastra responsável e <em>Disponibiliza</em>.</li>
  <li><strong>Parceiro (portal):</strong> preenche dados, anexa documentos por etapa/grupo, tributos e contato; envia.</li>
  <li><strong>MTI:</strong> valida cada documento e decide — Aprovar, Solicitar ajuste ou Reprovar.</li>
</ol>
<p style="margin:14px 0 0;padding:10px;background:#eff6ff;border-left:4px solid #2563eb">
  Status da habilitação: <strong>Incompleta</strong> → <strong>Em apresentação</strong> →
  <strong>Completa – aguardando MTI</strong> → <strong>Aprovada</strong> | <strong>Reprovada</strong>
  (ajuste volta para Em apresentação).
</p>
""",
            ),
        },
        {
            "id": "step-f1-status",
            "title": "0a. Glossário — status do cadastro",
            "type": "html",
            "htmlPresentationShowHeader": True,
            "htmlPresentationHeaderTitle": "Atlas · Fase 1",
            "htmlContent": html(
                "Status de habilitação documental",
                """
<table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:12px">
  <thead><tr style="background:#e2e8f0;text-align:left">
    <th style="padding:8px;border:1px solid #cbd5e1">Status</th>
    <th style="padding:8px;border:1px solid #cbd5e1">Significado</th>
    <th style="padding:8px;border:1px solid #cbd5e1">Quem age</th>
  </tr></thead>
  <tbody>
    <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Incompleta</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Cadastro mínimo; portal ainda não liberado.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">MTI</td></tr>
    <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Em apresentação</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Parceiro preenchendo ou corrigindo após ajuste.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">Parceiro</td></tr>
    <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Completa – aguardando MTI</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Parceiro enviou; fila de análise.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">MTI</td></tr>
    <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Aprovada pela MTI</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Habilitação ok; acesso comercial liberado.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">—</td></tr>
    <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Reprovada pela MTI</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Rejeição definitiva (diferente de solicitar ajuste).</td>
        <td style="padding:8px;border:1px solid #cbd5e1">—</td></tr>
  </tbody>
</table>
<p style="margin:0;color:#64748b;font-size:13px">
  Documento individual tem status próprio (Pendente / Vencido / Aprovado / Recusado) —
  não confundir com o status da organização.
</p>
""",
            ),
        },
        # --- MTI setup ---
        bpmn(
            "step-f1-criar-org",
            "1. Criar Organização raiz (Parceiro)",
            key="Criar Organização",
            description=(
                "MTI cria a organização institucional. Organização raiz = Sim, "
                "Tipo de organização = Parceiro. Não é auto-cadastro do parceiro."
            ),
            role="Analista MTI",
            detail="Back-office · Organização",
            inputs="CNPJ, Nome, Sigla, Tipo=Parceiro, Organização raiz=Sim.",
            outputs="Organização criada com status Incompleta.",
            rules=[
                "Tipo de organização = Parceiro",
                "Organização raiz = Sim",
                "Primeiro vínculo criado pela MTI",
            ],
            next_id="step-f1-dados-minimos",
            form_id=FORM_ORG,
            task_type="entryForm",
        ),
        bpmn(
            "step-f1-dados-minimos",
            "2. Completar dados mínimos",
            key="Preencher dados mínimos",
            description=(
                "MTI informa o necessário para liberar o portal (identificação básica). "
                "Habilitação documental, tributos e contatos ficam com o parceiro."
            ),
            role="Analista MTI",
            detail="Organização · Dados do Cadastro / Dados da Organização",
            inputs="CNPJ, razão social, nome fantasia.",
            outputs="Cadastro mínimo apto a configurar etapas e disponibilizar.",
            rules=["MTI não preenche a habilitação no lugar do parceiro"],
            next_id="step-f1-etapas",
            form_id=FORM_ORG,
        ),
        bpmn(
            "step-f1-etapas",
            "3. Incluir etapas documentacionais",
            key="Configurar etapas a partir do catálogo",
            description=(
                "MTI seleciona as etapas (ex.: Habilitação documental) e adiciona. "
                "Cada etapa traz automaticamente os grupos e tipos do catálogo Etapa documentacional."
            ),
            role="Analista MTI",
            detail="Organização · Documentos · Etapas a incluir + Adicionar",
            inputs="Catálogo Etapa documentacional (grupos + tipos).",
            outputs="Etapas incluídas na org com grupos e documentos.",
            rules=[
                "Não se seleciona grupo na Organização — a etapa já traz os grupos",
                "Tipos vêm do catálogo configurado na etapa",
                "Parceiro só anexa; não cria tipo novo",
            ],
            form_id=FORM_ORG,
            paths=[
                {"key": "Continuar", "value": "step-f1-responsavel"},
                {"key": "Ver catálogo de etapa", "value": "step-f1-cat-etapa"},
            ],
            confirm_next="step-f1-responsavel",
        ),
        bpmn(
            "step-f1-cat-etapa",
            "3a. (Opcional) Revisar catálogo Etapa documentacional",
            key="Consultar Etapa documentacional",
            description=(
                "Confere no catálogo quais grupos e tipos cada etapa carrega. "
                "Ajustes no catálogo afetam novas inclusões na Organização."
            ),
            role="Analista MTI",
            detail="Catálogo · Etapa documentacional",
            inputs="Etapas ativas do catálogo.",
            outputs="Confirmação da composição etapa → grupo → tipo.",
            next_id="step-f1-responsavel",
            form_id=FORM_ETAPA,
        ),
        bpmn(
            "step-f1-responsavel",
            "4. Pré-cadastrar responsável (CPF)",
            key="Pré-cadastrar responsável",
            description=(
                "Vincula o CPF do responsável que poderá acessar o portal e enviar o cadastro. "
                "Sem responsável pré-cadastrado, o Disponibilizar não libera o acesso."
            ),
            role="Analista MTI",
            detail="Organização · Informações Adicionais · Responsável",
            inputs="Pessoa/servidor com CPF.",
            outputs="Responsável vinculado à organização.",
            rules=["Somente este responsável envia o cadastro da org no portal"],
            next_id="step-f1-disponibilizar",
            form_id=FORM_ORG,
        ),
        bpmn(
            "step-f1-disponibilizar",
            "5. Disponibilizar para parceiro finalizar",
            key="Disponibilizar para parceiro finalizar",
            description=(
                "MTI libera o portal. Status da habilitação passa para Em apresentação "
                "e o responsável é notificado."
            ),
            role="Analista MTI",
            detail="Método da Organização",
            inputs="Org com etapas + responsável CPF.",
            outputs="Status = Em apresentação; notificação ao responsável.",
            rules=[
                "Pré-requisito: responsável com CPF",
                "Acesso comercial permanece bloqueado (Não)",
            ],
            next_id="step-f1-status-apresentacao",
            form_id=FORM_DISP,
        ),
        bpmn(
            "step-f1-status-apresentacao",
            "5a. Status → Em apresentação",
            key="Gravar Em apresentação",
            description="Efeito do Disponibilizar (ou retorno de Solicitar ajuste).",
            role="Sistema",
            outputs="Status de habilitação = Em apresentação.",
            next_id="step-f1-notif-liberacao",
        ),
        bpmn(
            "step-f1-notif-liberacao",
            "6. Notificar responsável",
            key="Notificar liberação do cadastro",
            description=(
                "Responsável recebe aviso para acessar o portal (MT Login / Gov.br) "
                "e finalizar o cadastro MIPP."
            ),
            role="Sistema",
            outputs="Notificação enviada.",
            next_id="step-f1-login-portal",
        ),
        # --- Parceiro portal ---
        bpmn(
            "step-f1-login-portal",
            "7. Login no portal e abrir cadastro",
            key="Login e abrir cadastro da org",
            description=(
                "Responsável autentica. CPF confere com o pré-cadastro; "
                "abre a organização vinculada para completar."
            ),
            role="Responsável parceiro",
            detail="Portal do Parceiro",
            inputs="CPF pré-cadastrado.",
            outputs="Cadastro da org aberto no portal.",
            rules=["CPF no pré-cadastro", "Somente o responsável envia"],
            next_id="step-f1-gateway-ajuste",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-gateway-ajuste",
            "7a. Há parecer de ajuste pendente?",
            key="Gateway ajuste",
            description="Se a MTI solicitou ajuste, o parceiro vê o motivo antes de editar.",
            role="Sistema",
            rules=["Sem classe Ticket — parecer vive no cadastro"],
            form_id=FORM_PORTAL,
            paths=[
                {"key": "Sim — ver motivo", "value": "step-f1-ver-ajuste"},
                {"key": "Não — seguir preenchimento", "value": "step-f1-dados-cadastro"},
            ],
            confirm_next="step-f1-dados-cadastro",
        ),
        bpmn(
            "step-f1-ver-ajuste",
            "7b. Ler motivo do ajuste",
            key="Exibir motivo do ajuste",
            description="Parceiro lê o motivo enviado pela MTI e corrige o cadastro.",
            role="Responsável parceiro",
            inputs="Motivo do Solicitar ajuste.",
            outputs="Parceiro ciente do que corrigir.",
            next_id="step-f1-dados-cadastro",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-dados-cadastro",
            "8. Preencher dados do cadastro",
            key="Completar dados da organização",
            description=(
                "Parceiro completa identificação, inscrições/CNAE, contas bancárias "
                "e demais dados exigidos (autocomplete CNPJ quando disponível)."
            ),
            role="Responsável parceiro",
            detail="Portal · Cadastro organizacional",
            inputs="Cadastro liberado ou em ajuste.",
            outputs="Dados cadastrais preenchidos.",
            next_id="step-f1-anexar-docs",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-anexar-docs",
            "9. Anexar documentos das etapas",
            key="Upload na grade documentacional",
            description=(
                "Para cada etapa incluída, o parceiro anexa os tipos exigidos em cada grupo. "
                "O sistema obtém a data de vencimento conforme o modo do Tipo (Automático/Calculado/Manual)."
            ),
            role="Responsável parceiro",
            detail="Portal · Documentos por etapa/grupo",
            inputs="Etapas incluídas + catálogo Tipo de Documento.",
            outputs="Anexos com vencimento e status Pendente ou Vencido.",
            rules=[
                "Obter vencimento ≠ aprovar documento",
                "Vencido impede envio até reanexo",
                "Status de validação humana só muda na análise MTI",
            ],
            form_id=FORM_PORTAL,
            paths=[
                {"key": "Continuar (entender vencimento)", "value": "step-f1-modo-vencimento"},
                {"key": "Já anexou — tributos", "value": "step-f1-tributos"},
            ],
            confirm_next="step-f1-modo-vencimento",
        ),
        bpmn(
            "step-f1-modo-vencimento",
            "9a. Ler modo de vencimento do Tipo",
            key="Herdar modo do Tipo de Documento",
            description=(
                "Automático: OCR. Calculado: periodicidade. Manual: data informada. "
                "Só decide COMO preencher a Data de vencimento."
            ),
            role="Sistema",
            inputs="Tipo de Documento (modo e periodicidade).",
            outputs="Modo/origem do vencimento na linha do documento.",
            form_id=FORM_TDOC,
            paths=[
                {"key": "Automático → OCR", "value": "step-f1-ocr"},
                {"key": "Calculado", "value": "step-f1-calcular"},
                {"key": "Manual", "value": "step-f1-manual"},
            ],
            confirm_next="step-f1-ocr",
        ),
        bpmn(
            "step-f1-ocr",
            "9b. OCR — ler data de vencimento",
            key="OCR no arquivo",
            description="Sistema tenta extrair a data do PDF/imagem.",
            role="Sistema",
            outputs="Data via OCR ou falha → correção manual.",
            paths=[
                {"key": "Sucesso", "value": "step-f1-checar-vencido"},
                {"key": "Falha OCR", "value": "step-f1-manual"},
            ],
            confirm_next="step-f1-checar-vencido",
        ),
        bpmn(
            "step-f1-calcular",
            "9c. Calcular vencimento (periodicidade)",
            key="Calcular pela periodicidade",
            description="Usa Periodicidade do Tipo (Anual/Semestral/Trimestral/Mensal).",
            role="Sistema",
            outputs="Data de vencimento calculada.",
            next_id="step-f1-checar-vencido",
        ),
        bpmn(
            "step-f1-manual",
            "9d. Informar data de vencimento (manual)",
            key="Parceiro informa data",
            description="Parceiro preenche a data (modo Manual ou correção OCR).",
            role="Responsável parceiro",
            outputs="Data de vencimento informada.",
            next_id="step-f1-checar-vencido",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-checar-vencido",
            "9e. Documento está vencido?",
            key="Checar vencimento × hoje",
            description="Se data < hoje → status Vencido; senão Pendente.",
            role="Sistema",
            paths=[
                {"key": "Vencido", "value": "step-f1-doc-vencido"},
                {"key": "Vigente", "value": "step-f1-doc-pendente"},
            ],
            confirm_next="step-f1-doc-pendente",
        ),
        bpmn(
            "step-f1-doc-vencido",
            "9f. Status documento = Vencido",
            key="Marcar Vencido",
            description="Sistema marca Vencido. Parceiro precisa reanexar.",
            role="Sistema",
            outputs="Status de validação = Vencido.",
            next_id="step-f1-mais-docs",
        ),
        bpmn(
            "step-f1-doc-pendente",
            "9g. Status documento = Pendente",
            key="Marcar Pendente",
            description="Anexo com vencimento vigente — aguarda análise humana da MTI.",
            role="Sistema",
            outputs="Status de validação = Pendente.",
            next_id="step-f1-mais-docs",
        ),
        bpmn(
            "step-f1-mais-docs",
            "9h. Há mais documentos a anexar?",
            key="Loop documentos",
            description="Repete até cobrir os tipos obrigatórios das etapas.",
            role="Responsável parceiro",
            paths=[
                {"key": "Sim — próximo documento", "value": "step-f1-anexar-docs"},
                {"key": "Não — seguir", "value": "step-f1-tributos"},
            ],
            confirm_next="step-f1-tributos",
        ),
        bpmn(
            "step-f1-tributos",
            "10. Informar tributos e isenções",
            key="Preencher tributos",
            description=(
                "Regime de tributação, isenções (ICMS / inscrição estadual) com comprovantes "
                "e linhas de tributos/alíquotas."
            ),
            role="Responsável parceiro",
            detail="Portal · Tributos e Encargos",
            outputs="Tributos preenchidos.",
            next_id="step-f1-contato",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-contato",
            "11. Informar contatos",
            key="Preencher contatos",
            description="E-mails, telefone, endereço e redes sociais da organização.",
            role="Responsável parceiro",
            detail="Portal · Contato",
            outputs="Contatos preenchidos.",
            next_id="step-f1-enviar",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-enviar",
            "12. Enviar cadastro para a MTI",
            key="Enviar cadastro",
            description=(
                "Parceiro submete. Sistema valida obrigatoriedades e documentos não vencidos. "
                "Status da habilitação → Completa – aguardando MTI."
            ),
            role="Responsável parceiro",
            inputs="Cadastro completo + docs vigentes.",
            outputs="Status = Completa – aguardando MTI.",
            rules=["Não envia com documento Vencido obrigatório"],
            next_id="step-f1-status-aguardando",
            form_id=FORM_PORTAL,
        ),
        bpmn(
            "step-f1-status-aguardando",
            "12a. Status → Completa – aguardando MTI",
            key="Gravar Completa – aguardando MTI",
            description="Efeito do envio do parceiro.",
            role="Sistema",
            outputs="Status = Completa – aguardando MTI.",
            next_id="step-f1-fila-mti",
        ),
        # --- MTI analysis ---
        bpmn(
            "step-f1-fila-mti",
            "13. Entrar na fila de análise MTI",
            key="Abrir cadastro na fila",
            description="Analista MTI abre a organização enviada para análise documental e decisão.",
            role="Analista MTI",
            detail="Back-office · Organização",
            next_id="step-f1-analisar-doc",
            form_id=FORM_ORG,
        ),
        bpmn(
            "step-f1-analisar-doc",
            "14. Analisar documento (aprovar/recusar anexo)",
            key="Validar documento",
            description=(
                "Para cada anexo Pendente: Aprovado ou Recusado. "
                "Não confundir com a decisão do cadastro inteiro."
            ),
            role="Analista MTI",
            inputs="Documento com status Pendente.",
            outputs="Status do documento = Aprovado ou Recusado.",
            form_id=FORM_ORG,
            paths=[
                {"key": "Aprovar documento", "value": "step-f1-doc-aprovado"},
                {"key": "Recusar documento", "value": "step-f1-doc-recusado"},
            ],
            confirm_next="step-f1-doc-aprovado",
        ),
        bpmn(
            "step-f1-doc-aprovado",
            "14a. Documento = Aprovado",
            key="Gravar Aprovado no documento",
            description="MTI aceita o anexo.",
            role="Analista MTI",
            next_id="step-f1-mais-analise",
        ),
        bpmn(
            "step-f1-doc-recusado",
            "14b. Documento = Recusado",
            key="Gravar Recusado no documento",
            description="MTI rejeita o anexo (motivo no parecer/ajuste se necessário).",
            role="Analista MTI",
            next_id="step-f1-mais-analise",
        ),
        bpmn(
            "step-f1-mais-analise",
            "14c. Há mais documentos a analisar?",
            key="Loop análise docs",
            description="Continua até cobrir a grade ou decidir o cadastro.",
            role="Analista MTI",
            paths=[
                {"key": "Sim — próximo documento", "value": "step-f1-analisar-doc"},
                {"key": "Não — decidir cadastro", "value": "step-f1-decidir"},
            ],
            confirm_next="step-f1-decidir",
        ),
        bpmn(
            "step-f1-decidir",
            "15. Decidir o cadastro",
            key="Decisão do cadastro",
            description=(
                "Aprovar cadastro, Solicitar ajuste (volta ao parceiro) ou Reprovar "
                "(rejeição definitiva)."
            ),
            role="Analista MTI",
            form_id=FORM_ORG,
            paths=[
                {"key": "Aprovar cadastro", "value": "step-f1-aprovar"},
                {"key": "Solicitar ajuste", "value": "step-f1-ajuste"},
                {"key": "Reprovar cadastro", "value": "step-f1-reprovar"},
            ],
            confirm_next="step-f1-aprovar",
        ),
        bpmn(
            "step-f1-aprovar",
            "16. Aprovar cadastro",
            key="Aprovar cadastro",
            description=(
                "Confirma aprovação. Status → Aprovada pela MTI; Acesso comercial = Sim."
            ),
            role="Analista MTI",
            detail="Método Aprovar cadastro",
            outputs="Status = Aprovada pela MTI; acesso comercial liberado.",
            next_id="step-f1-status-aprovada",
            form_id=FORM_APROVAR,
        ),
        bpmn(
            "step-f1-status-aprovada",
            "16a. Status → Aprovada pela MTI",
            key="Gravar Aprovada pela MTI",
            description="Efeito da aprovação.",
            role="Sistema",
            outputs="Status = Aprovada pela MTI.",
            next_id="step-f1-fim-aprovado",
        ),
        bpmn(
            "step-f1-ajuste",
            "17. Solicitar ajuste",
            key="Solicitar ajuste",
            description=(
                "Informa motivo. Status volta para Em apresentação; responsável é notificado."
            ),
            role="Analista MTI",
            detail="Método Solicitar ajuste",
            outputs="Status = Em apresentação; motivo registrado.",
            rules=["Não é reprovação definitiva"],
            next_id="step-f1-status-ajuste",
            form_id=FORM_AJUSTE,
        ),
        bpmn(
            "step-f1-status-ajuste",
            "17a. Status → Em apresentação (ajuste)",
            key="Voltar Em apresentação",
            description="Parceiro corrige e reenvia (volta ao passo 7).",
            role="Sistema",
            outputs="Status = Em apresentação.",
            next_id="step-f1-notif-ajuste",
        ),
        bpmn(
            "step-f1-notif-ajuste",
            "17b. Notificar ajuste ao responsável",
            key="Notificar solicitação de ajuste",
            description="Responsável recebe o motivo e reabre o cadastro no portal.",
            role="Sistema",
            next_id="step-f1-login-portal",
        ),
        bpmn(
            "step-f1-reprovar",
            "18. Reprovar cadastro",
            key="Reprovar cadastro",
            description=(
                "Rejeição definitiva com motivo. Status → Reprovada pela MTI. "
                "Não use para pedido de correção."
            ),
            role="Analista MTI",
            detail="Método Reprovar cadastro",
            outputs="Status = Reprovada pela MTI.",
            rules=["Diferente de Solicitar ajuste"],
            next_id="step-f1-status-reprovada",
            form_id=FORM_REPROVAR,
        ),
        bpmn(
            "step-f1-status-reprovada",
            "18a. Status → Reprovada pela MTI",
            key="Gravar Reprovada pela MTI",
            description="Efeito da reprovação. Acesso comercial permanece Não.",
            role="Sistema",
            outputs="Status = Reprovada pela MTI.",
            next_id="step-f1-fim-reprovado",
        ),
        {
            "id": "step-f1-fim-aprovado",
            "title": "Fim — cadastro aprovado",
            "type": "html",
            "htmlPresentationShowHeader": True,
            "htmlPresentationHeaderTitle": "Atlas · Fase 1",
            "htmlContent": html(
                "Fim — parceria aprovada",
                """
<p style="margin:0;color:#475569">
  Habilitação = <strong>Aprovada pela MTI</strong>. Documentos exigidos com status
  <strong>Aprovado</strong>. Acesso comercial liberado. Pronto para fluxos seguintes (catálogo, proposta, etc.).
</p>
""",
            ),
        },
        {
            "id": "step-f1-fim-reprovado",
            "title": "Fim — cadastro reprovado",
            "type": "html",
            "htmlPresentationShowHeader": True,
            "htmlPresentationHeaderTitle": "Atlas · Fase 1",
            "htmlContent": html(
                "Fim — cadastro reprovado",
                """
<p style="margin:0;color:#475569">
  Habilitação = <strong>Reprovada pela MTI</strong>. Acesso comercial permanece bloqueado.
  Novo vínculo exige novo processo de cadastro pela MTI.
</p>
""",
            ),
        },
    ]

    return {
        "id": FLOW_ID,
        "name": "Fase 1 — Cadastro da Organização (parceiro)",
        "metadata": (
            "Fluxo Fase 1 alinhado ao protótipo atual: Organização (raiz/parceiro), "
            "etapas documentacionais do catálogo, portal do responsável, análise de documentos "
            "e decisão Aprovar / Solicitar ajuste / Reprovar. "
            "Status: Incompleta → Em apresentação → Completa – aguardando MTI → Aprovada | Reprovada."
        ),
        "steps": steps,
    }


def main() -> None:
    flows = json.loads(FLOWS.read_text(encoding="utf-8"))
    new_flow = build_flow()
    ids = [f["id"] for f in flows]
    if FLOW_ID in ids:
        flows[ids.index(FLOW_ID)] = new_flow
        action = "updated"
    else:
        # Insert before the old parceria portal flow if present, else append
        old = "flow-proto-cadastro-parceria-portal"
        if old in ids:
            flows.insert(ids.index(old), new_flow)
        else:
            flows.insert(0, new_flow)
        action = "created"

    # Rename old flow to mark as legado (keep for reference)
    for f in flows:
        if f["id"] == "flow-proto-cadastro-parceria-portal":
            if not f["name"].startswith("Legado"):
                f["name"] = "Legado — Cadastro da Parceria (portal detalhado)"
            meta = f.get("metadata") or ""
            if "Substituído por" not in meta:
                f["metadata"] = (
                    f"Substituído por `{FLOW_ID}` como fluxo canônico da Fase 1. " + meta
                )

    FLOWS.write_text(json.dumps(flows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(action, FLOW_ID, "steps", len(new_flow["steps"]))


if __name__ == "__main__":
    main()
