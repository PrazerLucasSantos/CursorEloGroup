# -*- coding: utf-8 -*-
"""Fluxo BPMN completo: Cadastro da Parceria — vencimento e validação esclarecidos."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOWS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/flows.json"

F_ORG = "form-patlasv4-proto-unidade-organizacional"
F_DISP = "form-patlasv4-proto-metodo-disponibilizar-parceiro-org"
F_APROVAR = "form-patlasv4-proto-metodo-aprovar-cadastro-org"
F_AJUSTE = "form-patlasv4-proto-metodo-solicitar-ajuste-org"
F_PORTAL = "form-patlasv4-proto-portal-onboarding-org"
F_DOC = "form-patlasv4-proto-uo-documento"
F_TDOC = "form-patlasv4-proto-tipo-documento"


def path(key: str, value: str) -> dict:
    return {"key": key, "value": value}


def bpmn(
    sid: str,
    title: str,
    *,
    activity: str,
    description: str,
    role: str,
    role_detail: str,
    inputs: str,
    outputs: str,
    rules: list[str],
    paths: list[dict],
    form_id: str | None = None,
    task_type: str = "userTask",
    sla: str | None = None,
    sla_exceeded: str | None = None,
    on_complete: str | None = None,
    confirm_to: str | None = None,
) -> dict:
    step: dict = {
        "id": sid,
        "title": title,
        "type": "bpmnActivity",
        "bpmnTaskType": task_type,
        "bpmnActivityKey": activity,
        "bpmnDescription": description,
        "assigneeRole": role,
        "assigneeRoleDetail": role_detail,
        "bpmnInputs": inputs,
        "bpmnOutputs": outputs,
        "bpmnRuleList": rules,
        "bpmnPossiblePaths": paths,
    }
    if form_id:
        step["linkedFormId"] = form_id
    if sla:
        step["bpmnSla"] = sla
    if sla_exceeded:
        step["bpmnSlaIfExceeded"] = sla_exceeded
    if on_complete:
        step["bpmnOnCompleteEvent"] = on_complete
    if confirm_to:
        step["bpmnFormConfirmNavigateStepId"] = confirm_to
    return step


def html(sid: str, title: str, header: str, body: str) -> dict:
    return {
        "id": sid,
        "title": title,
        "type": "html",
        "htmlPresentationShowHeader": True,
        "htmlPresentationHeaderTitle": header,
        "htmlContent": body,
    }


# --- step ids ---
S = {
    "inicio": "step-proto-parc-inicio",
    "glossario": "step-proto-parc-glossario-docs",
    "criar": "step-proto-parc-criar-org",
    "minimos": "step-proto-parc-dados-minimos",
    "grupos": "step-proto-parc-grupos-mipp",
    "resp": "step-proto-parc-pre-responsavel",
    "disp": "step-proto-parc-disponibilizar",
    "st_apres": "step-proto-parc-status-em-apresentacao",
    "n_lib": "step-proto-parc-notif-liberacao",
    "login": "step-proto-parc-login-portal",
    "gate_ajuste": "step-proto-parc-gateway-ajuste",
    "ver_ajuste": "step-proto-parc-ver-ajuste",
    "dados": "step-proto-parc-dados-cadastro",
    "abrir_grade": "step-proto-parc-abrir-grade-mipp",
    "escolher_tipo": "step-proto-parc-escolher-tipo-doc",
    "upload": "step-proto-parc-upload-arquivo",
    "ler_modo": "step-proto-parc-ler-modo-vencimento",
    "ocr": "step-proto-parc-ocr-ler-data",
    "ocr_ok": "step-proto-parc-ocr-sucesso",
    "ocr_fail": "step-proto-parc-ocr-falha",
    "recorrencia": "step-proto-parc-calcular-recorrencia",
    "checar_vencido": "step-proto-parc-checar-se-vencido",
    "doc_vencido": "step-proto-parc-doc-vencido",
    "doc_pendente": "step-proto-parc-doc-pendente",
    "progresso": "step-proto-parc-atualizar-progresso",
    "mais_docs": "step-proto-parc-mais-docs",
    "tributos": "step-proto-parc-tributos",
    "contato": "step-proto-parc-contato",
    "gate_envio": "step-proto-parc-gate-envio",
    "enviar": "step-proto-parc-enviar",
    "st_aguarda": "step-proto-parc-status-aguardando-mti",
    "n_envio": "step-proto-parc-notif-envio",
    "analisar": "step-proto-parc-analisar-cadastro",
    "analisar_docs": "step-proto-parc-analisar-cada-documento",
    "gate_doc_mti": "step-proto-parc-gate-parecer-doc",
    "doc_aprovar": "step-proto-parc-doc-aprovar",
    "doc_recusar": "step-proto-parc-doc-recusar",
    "mais_analise": "step-proto-parc-mais-docs-analise",
    "decisao": "step-proto-parc-decisao-cadastro",
    "aprovar": "step-proto-parc-aprovar",
    "ajuste": "step-proto-parc-solicitar-ajuste",
    "reprovar": "step-proto-parc-reprovar",
    "st_aprovada": "step-proto-parc-status-aprovada",
    "st_volta": "step-proto-parc-status-volta-apresentacao",
    "n_apr": "step-proto-parc-notif-aprovar",
    "n_aj": "step-proto-parc-notif-ajuste",
    "n_rep": "step-proto-parc-notif-reprovar",
    "liberar": "step-proto-parc-liberar-comercial",
    "fim_ok": "step-proto-parc-fim-aprovado",
    "fim_rep": "step-proto-parc-fim-reprovado",
    "escopo": "step-proto-parc-nota-escopo",
}

OVERVIEW = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:940px;padding:8px 4px;color:#0f172a;line-height:1.5;font-size:14px">
  <h1 style="margin:0 0 8px;color:#004a8d;font-size:24px">Cadastro da Parceria — fluxo completo</h1>
  <p style="margin:0 0 14px;color:#475569">
    Fase 1 · Checkpoint 08/07/2026 · Métodos Disponibilizar / Aprovar / Solicitar ajuste / Reprovar · Documento MIPP.
  </p>
  <ol style="margin:0;padding-left:18px">
    <li><strong>MTI:</strong> cria org Parceiro, dados mínimos, grupos MIPP, responsável CPF, Disponibilizar.</li>
    <li><strong>Parceiro:</strong> preenche dados, anexa docs (sistema obtém vencimento), tributos, contato, Envia.</li>
    <li><strong>MTI:</strong> analisa cada anexo (aprova/recusa documento) e decide o cadastro (aprovar / ajuste / reprovar).</li>
  </ol>
</div>
""".strip()

GLOSSARIO = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:940px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#004a8d;font-size:22px">Como funcionam documentos, vencimento e analise</h1>
  <p style="margin:0 0 12px;color:#475569">
    Sao <strong>duas coisas diferentes</strong>. Misturar as duas e a causa da confusao no desenho anterior.
  </p>

  <h2 style="margin:18px 0 8px;font-size:16px;color:#0f172a">1) Obter a DATA DE VENCIMENTO (sistema, no upload)</h2>
  <p style="margin:0 0 8px">No <em>Tipo de Documento</em>: Obrigatorio para parceiro *, Obrigatorio MTI *, e <strong>Modo de vencimento</strong> (3 opcoes). Periodicidade * so quando modo = Calculado.</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:12px;font-size:13px">
    <thead>
      <tr style="background:#e2e8f0;text-align:left">
        <th style="padding:8px;border:1px solid #cbd5e1">Modo</th>
        <th style="padding:8px;border:1px solid #cbd5e1">O que acontece apos o upload</th>
        <th style="padding:8px;border:1px solid #cbd5e1">Origem do vencimento</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Automatico</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">OCR/backend le a data no arquivo. Se falhar, parceiro informa.</td>
        <td style="padding:8px;border:1px solid #cbd5e1"><em>OCR (automatico)</em> ou <em>Manual (correcao OCR)</em></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Calculado</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Sistema calcula pela <strong>Periodicidade</strong> (Anual, Semestral, Trimestral, Mensal).</td>
        <td style="padding:8px;border:1px solid #cbd5e1"><em>Calculado (periodicidade)</em></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Manual</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Responsavel informa a Data de vencimento (sem OCR nem calculo).</td>
        <td style="padding:8px;border:1px solid #cbd5e1"><em>Manual</em></td>
      </tr>
    </tbody>
  </table>
  <p style="margin:0 0 14px;padding:10px;background:#fff7ed;border-left:4px solid #ea580c">
    <strong>Importante:</strong> ler/calcular a data de vencimento <u>nao aprova</u> o documento.
    So preenche o campo <em>Data de vencimento</em> e a <em>Origem do vencimento</em>.
  </p>

  <h2 style="margin:18px 0 8px;font-size:16px;color:#0f172a">2) STATUS DE VALIDACAO do documento (quem analisa o anexo)</h2>
  <p style="margin:0 0 8px">Campo <em>Status de validacao</em> no Documento MIPP. Na Fase 1 a regra e:</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:12px;font-size:13px">
    <thead>
      <tr style="background:#e2e8f0;text-align:left">
        <th style="padding:8px;border:1px solid #cbd5e1">Status</th>
        <th style="padding:8px;border:1px solid #cbd5e1">Quando ocorre</th>
        <th style="padding:8px;border:1px solid #cbd5e1">Quem define</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Pendente</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Assim que o arquivo esta anexado e a data de vencimento esta definida (e nao esta vencida).</td>
        <td style="padding:8px;border:1px solid #cbd5e1">Sistema (pos-upload)</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Vencido</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Data de vencimento &lt; hoje. Parceiro deve reanexar documento vigente.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">Sistema (checagem de data)</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Aprovado</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Analista MTI aceita o anexo (legibilidade, vigencia, aderencia ao tipo, consistencia cadastral).</td>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>MTI — validacao humana (F1)</strong></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Recusado</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Analista MTI rejeita o anexo (ilegivel, tipo errado, dados divergentes etc.).</td>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>MTI — validacao humana (F1)</strong></td>
      </tr>
    </tbody>
  </table>
  <p style="margin:0 0 14px;padding:10px;background:#eff6ff;border-left:4px solid #2563eb">
    Spec do formulario Documento MIPP: <em>«Validacao humana na F1. IA validacao pos-F1.»</em>
    Checkpoint citou OCR/IA para auxiliar (vencimento, assinatura, CNPJ), mas na F1 isso <strong>nao substitui</strong> o parecer da MTI.
  </p>

  <h2 style="margin:18px 0 8px;font-size:16px;color:#0f172a">3) Progresso da grade MIPP no portal</h2>
  <ul style="margin:0 0 14px;padding-left:18px">
    <li>Ex.: <strong>7/10</strong> = 7 tipos exigidos com arquivo anexado e vencimento definido (nao Vencido).</li>
    <li>Documento <em>Aprovado</em> pela MTI tambem conta no progresso «validado» apos a analise.</li>
    <li>Parceiro <strong>nao cria</strong> tipo/grupo novo — so faz upload na grade configurada pela MTI.</li>
  </ul>

  <h2 style="margin:18px 0 8px;font-size:16px;color:#0f172a">4) Status da HABILITACAO (organizacao inteira)</h2>
  <p style="margin:0 0 8px">Campo <em>Status da habilitacao documental</em> da Organizacao:</p>
  <ul style="margin:0 0 14px;padding-left:18px">
    <li><strong>Em apresentacao</strong> — apos Disponibilizar ou apos Solicitar ajuste.</li>
    <li><strong>Completa – aguardando MTI</strong> — apos Enviar para analise.</li>
    <li><strong>Aprovada pela MTI</strong> — apos Aprovar cadastro (libera acesso comercial).</li>
  </ul>
  <p style="margin:0;color:#64748b;font-size:13px">
    Reprovar o cadastro: nao libera acesso comercial; habilitacao nao fica «Aprovada». Ajuste devolve a «Em apresentacao».
  </p>
</div>
""".strip()

FIM_OK = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:820px;padding:8px 4px;color:#0f172a">
  <h1 style="margin:0 0 8px;color:#047857;font-size:22px">Fim — parceria aprovada</h1>
  <p style="margin:0;color:#475569;font-size:14px">
    Habilitacao = <strong>Aprovada pela MTI</strong>. Documentos exigidos com status <strong>Aprovado</strong>.
    Acesso comercial desbloqueado.
  </p>
</div>
""".strip()

FIM_REP = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:820px;padding:8px 4px;color:#0f172a">
  <h1 style="margin:0 0 8px;color:#b91c1c;font-size:22px">Fim — cadastro reprovado</h1>
  <p style="margin:0;color:#475569;font-size:14px">
    Sem acesso ao servico. Acesso comercial permanece bloqueado. Nova tentativa sob criterio da MTI.
  </p>
</div>
""".strip()

ESCOPO = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:860px;padding:8px 4px;color:#0f172a;font-size:14px;line-height:1.55">
  <h1 style="margin:0 0 8px;color:#004a8d;font-size:20px">Fora deste fluxo (nao sao falhas)</h1>
  <ul style="margin:0;padding-left:18px">
    <li>IA aprovando documento sozinha (pos-F1).</li>
    <li>Pessoas/cargos/convites do responsavel (ciclo proprio).</li>
    <li>Alteracoes pos-aprovacao da org (novo envio + parecer).</li>
    <li>Exportar dossie / entrega de valor (F3).</li>
  </ul>
</div>
""".strip()


FLOW = {
    "id": "flow-proto-cadastro-parceria-portal",
    "name": "Cadastro da Parceria — Portal (completo)",
    "metadata": (
        "Fase 1 completo. Separa claramente: (A) obter Data de vencimento no upload "
        "(OCR / Recorrencia / Manual correcao OCR) de (B) Status de validacao do documento "
        "(Pendente/Vencido pelo sistema; Aprovado/Recusado pela MTI humana na F1). "
        "Habilitacao da org: Em apresentacao → Completa – aguardando MTI → Aprovada pela MTI. "
        "Fontes: Checkpoint 08/07, form Documento MIPP, Tipo de Documento, metodos Organizacao."
    ),
    "steps": [
        html(S["inicio"], "0. Visao geral", "Atlas · Portal Parceria", OVERVIEW),
        html(
            S["glossario"],
            "0a. Glossario — vencimento x validacao dos anexos",
            "Atlas · Portal Parceria",
            GLOSSARIO,
        ),
        # ===== MTI pre-cadastro =====
        bpmn(
            S["criar"],
            "1. Criar organizacao raiz (Tipo=Parceiro, Empresa=Sim)",
            activity="Criar Organizacao raiz da parceria",
            description="MTI cria o cadastro institucional. Nao e auto-cadastro do parceiro no primeiro vinculo.",
            role="Analista MTI",
            role_detail="Back-office · (01) Organizacao.",
            inputs="CNPJ, nome/sigla, Tipo=Parceiro, Empresa=Sim.",
            outputs="Organizacao raiz criada.",
            rules=["Tipo=Parceiro", "Empresa=Sim", "Primeiro cadastro pela MTI"],
            paths=[path("Continuar", S["minimos"])],
            form_id=F_ORG,
            task_type="entryForm",
            sla="1 dia util",
            confirm_to=S["minimos"],
        ),
        bpmn(
            S["minimos"],
            "2. Completar dados minimos",
            activity="Preencher dados minimos",
            description="MTI informa so o necessario para liberar o portal. MIPP, tributos e contatos ficam com o parceiro.",
            role="Analista MTI",
            role_detail="Checkpoint 08/07.",
            inputs="CNPJ, razao/nome, identificacao minima.",
            outputs="Cadastro minimo apto a Disponibilizar.",
            rules=["MTI nao preenche a habilitacao no lugar do parceiro"],
            paths=[path("Continuar", S["grupos"])],
            form_id=F_ORG,
            confirm_to=S["grupos"],
        ),
        bpmn(
            S["grupos"],
            "3. Selecionar grupos/tipos MIPP exigidos",
            activity="Montar grade MIPP a partir do catalogo",
            description=(
                "Define quais documentos o portal exigira. Cada Tipo ja traz Modo de vencimento "
                "(Automatico ou Manual/Recorrente) — herdado somente leitura na org."
            ),
            role="Analista MTI",
            role_detail="Catalogo Tipo/Grupo de Documento.",
            inputs="Catalogo MIPP publicado.",
            outputs="Grade de habilitacao no portal (ex.: 10 docs juridicos).",
            rules=[
                "Parceiro nao cria tipo novo — so faz upload",
                "Modo de vencimento do Tipo: Automático | Calculado | Manual",
                "Se Calculado: Periodicidade * (Anual/Semestral/Trimestral/Mensal)",
                "Flags Obrigatório para parceiro * e Obrigatório MTI * no Tipo",
            ],
            paths=[path("Continuar", S["resp"])],
            form_id=F_ORG,
            confirm_to=S["resp"],
        ),
        bpmn(
            S["resp"],
            "4. Pre-cadastrar responsavel (CPF)",
            activity="Informar responsavel com CPF",
            description="Somente este responsavel acessa o portal e envia o cadastro da organizacao.",
            role="Analista MTI",
            role_detail="Campo Responsavel + Pessoa com CPF.",
            inputs="CPF, nome, e-mail.",
            outputs="Responsavel apto a login e notificacao.",
            rules=["Pre-requisito do Disponibilizar", "Perfil padrao parceiro — nao editavel"],
            paths=[path("Continuar", S["disp"])],
            form_id=F_ORG,
            confirm_to=S["disp"],
        ),
        bpmn(
            S["disp"],
            "5. Disponibilizar para parceiro finalizar",
            activity="Disponibilizar para parceiro finalizar (01.m7)",
            description="Libera o portal ao responsavel.",
            role="Analista MTI",
            role_detail="Metodo Organizacao.",
            inputs="Org com CPF + grade MIPP.",
            outputs="Portal liberado.",
            rules=["Metodo canonico: Disponibilizar", "Acesso via MT Login ou Gov.br"],
            paths=[path("Confirmar", S["st_apres"])],
            form_id=F_DISP,
            confirm_to=S["st_apres"],
        ),
        bpmn(
            S["st_apres"],
            "5a. Status da habilitacao → Em apresentacao",
            activity="Gravar Status da habilitacao documental",
            description="Efeito do Disponibilizar.",
            role="Sistema",
            role_detail="",
            inputs="Confirmacao Disponibilizar.",
            outputs="Status = Em apresentacao.",
            rules=["Status da habilitacao documental = Em apresentacao"],
            paths=[path("Notificar", S["n_lib"])],
            confirm_to=S["n_lib"],
        ),
        bpmn(
            S["n_lib"],
            "5b. Notificar responsavel (e-mail / link)",
            activity="Notificar liberacao do cadastro",
            description="E-mail com acesso ao portal da parceria.",
            role="Sistema (Notificacoes)",
            role_detail="",
            inputs="Responsavel, link.",
            outputs="Notificacao enviada.",
            rules=["Sempre notificar na liberacao"],
            paths=[path("Parceiro acessa", S["login"])],
            confirm_to=S["login"],
        ),
        # ===== Portal =====
        bpmn(
            S["login"],
            "6. Autenticar no portal (MT Login / Gov.br)",
            activity="Login e abrir cadastro da org",
            description="CPF confere com pre-cadastro; abre a organizacao vinculada.",
            role="Responsavel da parceria",
            role_detail="Somente o responsavel envia o cadastro org.",
            inputs="CPF autenticado.",
            outputs="Sessao no portal.",
            rules=["CPF no pre-cadastro"],
            paths=[path("Abrir cadastro", S["gate_ajuste"])],
            form_id=F_PORTAL,
            confirm_to=S["gate_ajuste"],
        ),
        bpmn(
            S["gate_ajuste"],
            "7. Ha parecer de ajuste da MTI?",
            activity="Gateway — retorno de ajuste",
            description="Se a MTI solicitou ajuste, exibe motivo (+ anexo se houver) antes de editar.",
            role="Sistema / Portal",
            role_detail="",
            inputs="Motivo de ajuste (se houver).",
            outputs="Rota primeiro preenchimento ou correcao.",
            rules=["Sem classe Ticket — parecer vive no cadastro"],
            paths=[
                path("Nao — primeiro preenchimento", S["dados"]),
                path("Sim — ver parecer", S["ver_ajuste"]),
            ],
            confirm_to=S["dados"],
        ),
        bpmn(
            S["ver_ajuste"],
            "7a. Exibir status + motivo (+ anexo se houver)",
            activity="Mostrar parecer de ajuste",
            description="Parceiro le o que a MTI pediu. Motivo obrigatorio; anexo opcional.",
            role="Responsavel da parceria",
            role_detail="",
            inputs="Motivo; anexo opcional.",
            outputs="Parceiro inicia correcao.",
            rules=["Anexo do ajuste e opcional"],
            paths=[path("Corrigir", S["dados"])],
            confirm_to=S["dados"],
        ),
        bpmn(
            S["dados"],
            "8. Preencher dados do cadastro (CNPJ autocomplete)",
            activity="Completar dados cadastrais",
            description="Identificacao fiscal e dados da parceria. Validar CNPJ com autocomplete quando aplicavel.",
            role="Responsavel da parceria",
            role_detail="Portal — Dados.",
            inputs="Cadastro liberado ou em ajuste.",
            outputs="Dados em rascunho.",
            rules=["Validar CNPJ = autocomplete", "Rascunho ate Enviar"],
            paths=[path("Ir para Documentos", S["abrir_grade"])],
            form_id=F_ORG,
            task_type="entryForm",
            sla="5 dias uteis",
            confirm_to=S["abrir_grade"],
        ),
        # ===== Loop documentos — vencimento claro =====
        bpmn(
            S["abrir_grade"],
            "9. Abrir grade MIPP e ver progresso",
            activity="Exibir tipos exigidos e progresso (ex.: 3/10)",
            description=(
                "Portal lista grupos/tipos definidos pela MTI. Progresso = quantos tipos ja tem "
                "arquivo anexado com vencimento definido e nao Vencido."
            ),
            role="Responsavel da parceria",
            role_detail="Portal — Documentos MIPP.",
            inputs="Grade MIPP da organizacao.",
            outputs="Visao de progresso e lista de pendencias de anexo.",
            rules=["Parceiro nao adiciona tipo novo", "Progresso visual obrigatorio (Checkpoint)"],
            paths=[path("Anexar proximo tipo", S["escolher_tipo"])],
            form_id=F_PORTAL,
            confirm_to=S["escolher_tipo"],
        ),
        bpmn(
            S["escolher_tipo"],
            "9a. Selecionar tipo exigido ainda sem anexo valido",
            activity="Escolher item da grade para upload",
            description="Parceiro escolhe um tipo pendente (ex.: CND Federal) para anexar o arquivo.",
            role="Responsavel da parceria",
            role_detail="",
            inputs="Tipo sem arquivo ou com status Vencido/Recusado a corrigir.",
            outputs="Tipo selecionado; Modo de vencimento herdado (somente leitura).",
            rules=["Modo de vencimento vem do Tipo de Documento do catalogo"],
            paths=[path("Fazer upload", S["upload"])],
            form_id=F_DOC,
            confirm_to=S["upload"],
        ),
        bpmn(
            S["upload"],
            "9b. Anexar arquivo do documento",
            activity="Upload do arquivo",
            description="Sistema grava Data de anexo (automatica) e inicia obtencao do vencimento.",
            role="Responsavel da parceria",
            role_detail="Campo Arquivo obrigatorio.",
            inputs="Arquivo PDF/imagem do tipo escolhido.",
            outputs="Arquivo salvo; Data de anexo preenchida.",
            rules=["Data de anexo = data/hora do upload", "Ainda nao ha Status Aprovado"],
            paths=[path("Obter vencimento", S["ler_modo"])],
            form_id=F_DOC,
            confirm_to=S["ler_modo"],
        ),
        bpmn(
            S["ler_modo"],
            "10. Como obter a Data de vencimento? (Modo do Tipo)",
            activity="Gateway — Automático | Calculado | Manual",
            description=(
                "Herdado do Tipo de Documento. Só decide COMO preencher a Data de vencimento. "
                "Não é análise/aprovação do documento. "
                "Se Calculado, a Periodicidade (Anual/Semestral/Trimestral/Mensal) é obrigatória no Tipo."
            ),
            role="Sistema",
            role_detail="Modo de vencimento + Periodicidade (quando Calculado).",
            inputs="Tipo de Documento (modo e periodicidade).",
            outputs="Rota Automático, Calculado ou Manual.",
            rules=[
                "Automático → tentar OCR",
                "Calculado → calcular pela Periodicidade *",
                "Manual → responsável informa a data",
            ],
            paths=[
                path("Automático → OCR", S["ocr"]),
                path("Calculado → periodicidade", S["recorrencia"]),
                path("Manual → informar data", S["ocr_fail"]),
            ],
            form_id=F_TDOC,
            confirm_to=S["ocr"],
        ),
        bpmn(
            S["ocr"],
            "10a. OCR/backend tenta ler a data no arquivo",
            activity="Extrair Data de vencimento do arquivo",
            description="Somente quando Modo = Automatico. Pode falhar (arquivo ilegivel, sem data visivel).",
            role="Sistema (OCR/backend)",
            role_detail="Pode evoluir com IA (Simplifica) — nao e aprovacao MTI.",
            inputs="Arquivo + Modo Automatico.",
            outputs="Data candidata ou falha de leitura.",
            rules=["Sucesso ou falha — nunca 'Aprovado' aqui"],
            paths=[
                path("OCR leu a data", S["ocr_ok"]),
                path("OCR nao leu a data", S["ocr_fail"]),
            ],
            form_id=F_DOC,
            confirm_to=S["ocr_ok"],
        ),
        bpmn(
            S["ocr_ok"],
            "10b. Preencher Data de vencimento (origem = OCR automatico)",
            activity="Gravar vencimento com origem OCR",
            description="Campo Data de vencimento preenchido; Origem do vencimento = OCR (automatico).",
            role="Sistema",
            role_detail="",
            inputs="Data lida pelo OCR.",
            outputs="Vencimento definido; origem OCR.",
            rules=["Parceiro pode conferir a data exibida"],
            paths=[path("Checar se ja venceu", S["checar_vencido"])],
            form_id=F_DOC,
            confirm_to=S["checar_vencido"],
        ),
        bpmn(
            S["ocr_fail"],
            "10c. Informar Data de vencimento (Manual ou correção OCR)",
            activity="Origem = Manual ou Manual (correção OCR)",
            description=(
                "Dois casos: (1) Modo = Manual desde o Tipo — responsável informa a data. "
                "(2) Modo = Automático e OCR falhou — alerta e correção OCR. "
                "Não é o ajuste da MTI; não aprova o documento."
            ),
            role="Responsável da parceria",
            role_detail="Campo Data de vencimento editável.",
            inputs="Modo Manual OU falha de OCR.",
            outputs="Data informada; origem Manual ou Manual (correção OCR).",
            rules=[
                "Não confundir com Solicitar ajuste da MTI",
                "Não aprova o documento",
            ],
            paths=[path("Checar se já venceu", S["checar_vencido"])],
            form_id=F_DOC,
            confirm_to=S["checar_vencido"],
        ),
        bpmn(
            S["recorrencia"],
            "10d. Calcular vencimento pela Periodicidade",
            activity="Origem = Calculado (periodicidade)",
            description=(
                "Quando Modo = Calculado: sistema calcula a data com a Periodicidade "
                "obrigatória do Tipo (Anual, Semestral, Trimestral ou Mensal). Sem OCR."
            ),
            role="Sistema",
            role_detail="Periodicidade * no Tipo de Documento.",
            inputs="Periodicidade do Tipo (Anual / Semestral / Trimestral / Mensal).",
            outputs="Data de vencimento calculada; origem Calculado (periodicidade).",
            rules=[
                "Periodicidade é obrigatória no catálogo quando modo = Calculado",
                "Não depende de OCR",
            ],
            paths=[path("Checar se já venceu", S["checar_vencido"])],
            form_id=F_DOC,
            confirm_to=S["checar_vencido"],
        ),
        bpmn(
            S["checar_vencido"],
            "11. A Data de vencimento ja passou?",
            activity="Checagem automatica de vigencia",
            description="Unica decisao automatica de status neste momento: Vencido ou Pendente.",
            role="Sistema",
            role_detail="",
            inputs="Data de vencimento preenchida.",
            outputs="Rota Vencido ou Pendente.",
            rules=[
                "Data < hoje → Status de validacao = Vencido",
                "Data >= hoje → Status de validacao = Pendente (aguarda MTI)",
            ],
            paths=[
                path("Sim — documento vencido", S["doc_vencido"]),
                path("Nao — seguir como Pendente", S["doc_pendente"]),
            ],
            form_id=F_DOC,
            confirm_to=S["doc_pendente"],
        ),
        bpmn(
            S["doc_vencido"],
            "11a. Status do documento = Vencido — reanexar",
            activity="Bloquear item vencido e pedir novo arquivo",
            description=(
                "Portal alerta: documento vencido. Nao conta no progresso. "
                "Parceiro deve anexar versao vigente (volta ao upload deste tipo)."
            ),
            role="Responsavel da parceria",
            role_detail="Status de validacao = Vencido.",
            inputs="Data de vencimento no passado.",
            outputs="Item nao apto; progresso nao incrementa.",
            rules=["Vencido nao permite envio da habilitacao", "Reanexar arquivo vigente"],
            paths=[path("Reanexar este tipo", S["upload"])],
            form_id=F_DOC,
            confirm_to=S["upload"],
        ),
        bpmn(
            S["doc_pendente"],
            "11b. Status do documento = Pendente (aguarda analise MTI)",
            activity="Registrar Pendente apos vencimento valido",
            description=(
                "Arquivo anexado + vencimento definido + ainda vigente. "
                "Status = Pendente. A MTI e quem mudara para Aprovado ou Recusado depois do Enviar."
            ),
            role="Sistema",
            role_detail="Spec F1: validacao humana pela MTI.",
            inputs="Vencimento vigente.",
            outputs="Status de validacao = Pendente.",
            rules=[
                "Pendente ≠ Aprovado",
                "OCR/recorrencia nao aprovam o anexo",
            ],
            paths=[path("Atualizar progresso", S["progresso"])],
            form_id=F_DOC,
            confirm_to=S["progresso"],
        ),
        bpmn(
            S["progresso"],
            "11c. Atualizar progresso da grade (ex.: 4/10)",
            activity="Recalcular progresso MIPP",
            description="Conta tipos com anexo + vencimento definido e status diferente de Vencido.",
            role="Sistema / Portal",
            role_detail="",
            inputs="Grade MIPP atualizada.",
            outputs="Barra/resumo de progresso.",
            rules=["Exibir progresso por grupo (juridica, tecnica, financeira, compliance)"],
            paths=[path("Verificar se faltam docs", S["mais_docs"])],
            confirm_to=S["mais_docs"],
        ),
        bpmn(
            S["mais_docs"],
            "11d. Ainda falta anexar algum tipo exigido?",
            activity="Gateway — completar grade",
            description="Enquanto houver tipo obrigatorio sem anexo Pendente (ou Aprovado), continua o loop.",
            role="Sistema / Portal",
            role_detail="",
            inputs="Progresso da grade.",
            outputs="Continuar anexos ou ir a Tributos.",
            rules=["Todos os tipos exigidos devem estar anexados e nao Vencidos antes do envio"],
            paths=[
                path("Sim — anexar proximo", S["escolher_tipo"]),
                path("Nao — ir para Tributos", S["tributos"]),
            ],
            confirm_to=S["tributos"],
        ),
        bpmn(
            S["tributos"],
            "12. Preencher Tributos e Encargos",
            activity="Tributos e encargos",
            description="Regime, isencoes, linhas e comprovantes quando exigidos.",
            role="Responsavel da parceria",
            role_detail="Portal — Tributos.",
            inputs="Dados fiscais.",
            outputs="Tributos em rascunho.",
            rules=["Isento ICMS/IE exige comprovante quando Sim"],
            paths=[path("Continuar", S["contato"])],
            form_id=F_ORG,
            confirm_to=S["contato"],
        ),
        bpmn(
            S["contato"],
            "13. Preencher Dados de contato",
            activity="Dados de contato",
            description="E-mails, telefones, enderecos.",
            role="Responsavel da parceria",
            role_detail="Portal — Contato.",
            inputs="Canais de contato.",
            outputs="Contato em rascunho.",
            rules=[],
            paths=[path("Preparar envio", S["gate_envio"])],
            form_id=F_ORG,
            confirm_to=S["gate_envio"],
        ),
        bpmn(
            S["gate_envio"],
            "14. Cadastro apto a enviar?",
            activity="Validacao pre-envio",
            description=(
                "Bloqueia se faltar tipo exigido, se houver documento Vencido, "
                "ou se campos obrigatorios estiverem vazios. "
                "Documentos podem estar Pendentes (ainda nao aprovados pela MTI) — isso e esperado."
            ),
            role="Sistema / Portal",
            role_detail="",
            inputs="Grade + formularios.",
            outputs="Liberado ou retorno a correcao.",
            rules=[
                "Exigidos anexados e nao Vencidos",
                "Status Pendente e permitido no envio",
                "Somente o responsavel envia",
            ],
            paths=[
                path("Apto → Enviar", S["enviar"]),
                path("Inapto → corrigir docs/dados", S["abrir_grade"]),
            ],
            confirm_to=S["enviar"],
        ),
        bpmn(
            S["enviar"],
            "15. Enviar para analise",
            activity="Enviar cadastro para a MTI",
            description="Responsavel submete. Edicao substancial trava ate o parecer.",
            role="Responsavel da parceria",
            role_detail="Acao Enviar.",
            inputs="Cadastro e MIPP aptos.",
            outputs="Fila de analise MTI.",
            rules=["Registrar data/hora do envio"],
            paths=[path("Enviado", S["st_aguarda"])],
            form_id=F_PORTAL,
            on_complete="Travar edicao substancial",
            confirm_to=S["st_aguarda"],
        ),
        bpmn(
            S["st_aguarda"],
            "15a. Status da habilitacao → Completa – aguardando MTI",
            activity="Gravar status de aguardo",
            description="Efeito do Enviar.",
            role="Sistema",
            role_detail="",
            inputs="Confirmacao do envio.",
            outputs="Status = Completa – aguardando MTI.",
            rules=["Sai de Em apresentacao"],
            paths=[path("Notificar", S["n_envio"])],
            confirm_to=S["n_envio"],
        ),
        bpmn(
            S["n_envio"],
            "15b. Notificar MTI e Parceiro (envio recebido)",
            activity="Notificar novo envio",
            description="Aqui ocorre o alerta de novo cadastro/envio — nao no passo Analisar.",
            role="Sistema (Notificacoes)",
            role_detail="",
            inputs="Protocolo do envio.",
            outputs="Notificacoes disparadas.",
            rules=["Notificar ambos os lados"],
            paths=[path("MTI analisa", S["analisar"])],
            confirm_to=S["analisar"],
        ),
        # ===== MTI analise =====
        bpmn(
            S["analisar"],
            "16. Analisar dados do cadastro (visao geral)",
            activity="Revisar dados cadastrais, tributos e contato",
            description="MTI confere consistencia do cadastro enviado (alem dos anexos).",
            role="Analista MTI",
            role_detail="Back-office.",
            inputs="Cadastro enviado.",
            outputs="Cadastro revisado; segue analise documento a documento.",
            rules=["SLA tipico 5 dias uteis"],
            paths=[path("Analisar anexos", S["analisar_docs"])],
            form_id=F_ORG,
            sla="5 dias uteis",
            sla_exceeded="Escalar / notificar atraso",
            confirm_to=S["analisar_docs"],
        ),
        bpmn(
            S["analisar_docs"],
            "17. Para cada documento Pendente: analisar o anexo",
            activity="Abrir Documento MIPP e examinar arquivo",
            description=(
                "Analise humana (F1): legibilidade, vigencia (data de vencimento), "
                "aderencia ao Tipo, consistencia com CNPJ/dados da empresa. "
                "OCR so ajudou a preencher a data — a decisao e da MTI."
            ),
            role="Analista MTI",
            role_detail="Validacao humana — Status de validacao do documento.",
            inputs="Documento com Status Pendente + arquivo + data de vencimento.",
            outputs="Parecer por documento.",
            rules=[
                "Nao confundir com o passo OCR do portal",
                "Pode usar a data/origem do vencimento como apoio",
            ],
            paths=[path("Registrar parecer do doc", S["gate_doc_mti"])],
            form_id=F_DOC,
            confirm_to=S["gate_doc_mti"],
        ),
        bpmn(
            S["gate_doc_mti"],
            "17a. Parecer do documento",
            activity="Gateway — Aprovar ou Recusar este anexo",
            description="Decisao por documento (nao e ainda a decisao do cadastro inteiro).",
            role="Analista MTI",
            role_detail="",
            inputs="Resultado da analise do anexo.",
            outputs="Rota Aprovar doc ou Recusar doc.",
            rules=["Um documento Recusado nao impede continuar analisando os demais"],
            paths=[
                path("Aprovar este documento", S["doc_aprovar"]),
                path("Recusar este documento", S["doc_recusar"]),
            ],
            confirm_to=S["doc_aprovar"],
        ),
        bpmn(
            S["doc_aprovar"],
            "17b. Status do documento → Aprovado",
            activity="Marcar documento Aprovado",
            description="Anexo aceito pela MTI.",
            role="Analista MTI",
            role_detail="Campo Status de validacao = Aprovado.",
            inputs="Parecer favoravel.",
            outputs="Documento Aprovado.",
            rules=["Conta no progresso validado"],
            paths=[path("Proximo documento?", S["mais_analise"])],
            form_id=F_DOC,
            confirm_to=S["mais_analise"],
        ),
        bpmn(
            S["doc_recusar"],
            "17c. Status do documento → Recusado",
            activity="Marcar documento Recusado (com motivo)",
            description=(
                "Anexo rejeitado (ilegivel, tipo errado, dados divergentes, etc.). "
                "Motivo fica visivel. Em geral a MTI tambem Solicita ajuste no cadastro "
                "para o parceiro reanexar."
            ),
            role="Analista MTI",
            role_detail="Status de validacao = Recusado.",
            inputs="Parecer desfavoravel + motivo.",
            outputs="Documento Recusado.",
            rules=["Recusado exige correcao pelo parceiro antes de nova aprovacao"],
            paths=[path("Proximo documento?", S["mais_analise"])],
            form_id=F_DOC,
            confirm_to=S["mais_analise"],
        ),
        bpmn(
            S["mais_analise"],
            "17d. Ainda ha documento Pendente para analisar?",
            activity="Gateway — loop de analise documental",
            description="Enquanto houver Pendente, continua o loop 17.",
            role="Analista MTI",
            role_detail="",
            inputs="Grade MIPP.",
            outputs="Continuar analise ou decidir o cadastro.",
            rules=["Ao fim, nenhum doc deve permanecer Pendente sem parecer"],
            paths=[
                path("Sim — analisar proximo", S["analisar_docs"]),
                path("Nao — decidir o cadastro", S["decisao"]),
            ],
            confirm_to=S["decisao"],
        ),
        bpmn(
            S["decisao"],
            "18. Decisao do CADASTRO (org inteira)",
            activity="Aprovar · Solicitar ajuste · Reprovar",
            description=(
                "Apos parecer nos documentos: decidir a habilitacao da organizacao. "
                "Se houver doc Recusado, o caminho tipico e Solicitar ajuste (nao Aprovar)."
            ),
            role="Analista MTI",
            role_detail="Metodos da Organizacao.",
            inputs="Resultado da analise documental + dados.",
            outputs="Rota de desfecho.",
            rules=[
                "Aprovar so se docs exigidos estiverem Aprovados",
                "Solicitar ajuste: motivo obrigatorio; anexo opcional",
                "Reprovar: sem acesso ao servico",
            ],
            paths=[
                path("Aprovar cadastro", S["aprovar"]),
                path("Solicitar ajuste", S["ajuste"]),
                path("Reprovar cadastro", S["reprovar"]),
            ],
            confirm_to=S["aprovar"],
        ),
        bpmn(
            S["aprovar"],
            "19a. Aprovar cadastro",
            activity="Aprovar cadastro (01.m4)",
            description="Confirma homologacao da parceria.",
            role="Analista MTI",
            role_detail="",
            inputs="Docs Aprovados + cadastro OK.",
            outputs="Cadastro homologado.",
            rules=["Observacao/anexo do metodo sao opcionais"],
            paths=[path("Atualizar status", S["st_aprovada"])],
            form_id=F_APROVAR,
            confirm_to=S["st_aprovada"],
        ),
        bpmn(
            S["ajuste"],
            "19b. Solicitar ajuste",
            activity="Solicitar ajuste (01.m5)",
            description=(
                "Devolve ao parceiro (ex.: docs Recusados). Motivo obrigatorio; anexo opcional. "
                "Parceiro corrige e envia de novo."
            ),
            role="Analista MTI",
            role_detail="",
            inputs="Motivo; anexo opcional.",
            outputs="Cadastro reaberto para correcao.",
            rules=["Motivo obrigatorio", "Anexo opcional"],
            paths=[path("Atualizar status", S["st_volta"])],
            form_id=F_AJUSTE,
            confirm_to=S["st_volta"],
        ),
        bpmn(
            S["reprovar"],
            "19c. Reprovar cadastro",
            activity="Reprovar",
            description="Encerra a tentativa. Acesso comercial permanece bloqueado.",
            role="Analista MTI",
            role_detail="",
            inputs="Justificativa.",
            outputs="Cadastro reprovado.",
            rules=["Nao grava Status = Aprovada pela MTI", "Sem acesso ao servico"],
            paths=[path("Notificar", S["n_rep"])],
            form_id=F_ORG,
            confirm_to=S["n_rep"],
        ),
        bpmn(
            S["st_aprovada"],
            "20a. Status da habilitacao → Aprovada pela MTI",
            activity="Gravar Aprovada pela MTI",
            description="Efeito do Aprovar cadastro.",
            role="Sistema",
            role_detail="",
            inputs="Confirmacao Aprovar.",
            outputs="Status = Aprovada pela MTI.",
            rules=[],
            paths=[path("Notificar", S["n_apr"])],
            confirm_to=S["n_apr"],
        ),
        bpmn(
            S["st_volta"],
            "20b. Status da habilitacao → Em apresentacao",
            activity="Devolver para correcao",
            description="Efeito do Solicitar ajuste. Documentos Recusados permanecem visiveis no portal.",
            role="Sistema",
            role_detail="",
            inputs="Confirmacao ajuste.",
            outputs="Status = Em apresentacao.",
            rules=["Parceiro vera o parecer no gateway de ajuste"],
            paths=[path("Notificar", S["n_aj"])],
            confirm_to=S["n_aj"],
        ),
        bpmn(
            S["n_apr"],
            "21a. Notificar aprovacao",
            activity="Notificar MTI e Parceiro",
            description="Comunica aprovacao.",
            role="Sistema (Notificacoes)",
            role_detail="",
            inputs="Decisao Aprovar.",
            outputs="Notificacoes.",
            rules=["Sempre notificar"],
            paths=[path("Liberar comercial", S["liberar"])],
            confirm_to=S["liberar"],
        ),
        bpmn(
            S["n_aj"],
            "21b. Notificar ajuste (motivo + anexo se houver)",
            activity="Notificar Parceiro do ajuste",
            description="Loop: volta ao portal no parecer de ajuste; parceiro corrige e reenvia.",
            role="Sistema (Notificacoes)",
            role_detail="",
            inputs="Motivo (+ anexo opcional).",
            outputs="Parceiro notificado.",
            rules=["Incluir motivo"],
            paths=[path("Voltar ao portal", S["ver_ajuste"])],
            confirm_to=S["ver_ajuste"],
        ),
        bpmn(
            S["n_rep"],
            "21c. Notificar reprovacao",
            activity="Notificar MTI e Parceiro",
            description="Comunica reprovacao — sem acesso ao servico.",
            role="Sistema (Notificacoes)",
            role_detail="",
            inputs="Decisao Reprovar.",
            outputs="Notificacoes.",
            rules=["Sempre notificar"],
            paths=[path("Encerrar", S["fim_rep"])],
            confirm_to=S["fim_rep"],
        ),
        bpmn(
            S["liberar"],
            "22. Liberar acesso comercial",
            activity="Desbloquear uso comercial",
            description="Efeito do Aprovar: Acesso comercial bloqueado = Nao.",
            role="Sistema",
            role_detail="",
            inputs="Status Aprovada pela MTI.",
            outputs="Acesso comercial liberado.",
            rules=["Dossie F3 fora deste fluxo"],
            paths=[path("Fim", S["fim_ok"])],
            confirm_to=S["fim_ok"],
        ),
        html(S["fim_ok"], "23. Fim — Parceria aprovada", "Atlas · Portal Parceria", FIM_OK),
        html(S["fim_rep"], "23. Fim — Sem acesso ao servico", "Atlas · Portal Parceria", FIM_REP),
        html(S["escopo"], "24. Fora de escopo", "Atlas · Portal Parceria", ESCOPO),
    ],
}


def main() -> None:
    existing: list = []
    if FLOWS.exists():
        try:
            existing = json.loads(FLOWS.read_text(encoding="utf-8"))
            if not isinstance(existing, list):
                existing = []
        except json.JSONDecodeError:
            existing = []

    others = [f for f in existing if f.get("id") != FLOW["id"]]
    FLOWS.write_text(
        json.dumps(others + [FLOW], ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("OK:", FLOW["name"].encode("ascii", "replace").decode("ascii"))
    print("steps=", len(FLOW["steps"]))
    for s in FLOW["steps"]:
        print(" -", s["title"].encode("ascii", "replace").decode("ascii"))


if __name__ == "__main__":
    main()
