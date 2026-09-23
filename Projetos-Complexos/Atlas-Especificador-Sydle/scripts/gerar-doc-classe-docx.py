#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Gera a documentação de requisitos COMPLETA da classe Organização (.docx),
lendo o forms.json do épico atlas-prototipo. Classes embutidas (conta bancária,
MIPP, tributos, contato, convites, cargos) são expandidas como campos da aba.
"""
import json
import os
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMS_PATH = os.path.join(ROOT, "data/subprojects/atlas-prototipo/epics/prototipo/forms.json")

CLASSE = sys.argv[1] if len(sys.argv) > 1 else "organizacao"

NAVY = RGBColor(0x0C, 0x4A, 0x6E)
GREY = RGBColor(0x47, 0x55, 0x69)
LIGHT = "DCE6F1"
HEADER_BG = "0C4A6E"

with open(FORMS_PATH, encoding="utf-8") as f:
    FORMS = json.load(f)

FORM_BY_ID = {fm["id"]: fm for fm in FORMS}

# id -> label global (para traduzir regras)
LABEL_BY_ID = {}
for fm in FORMS:
    for fld in fm.get("fields", []):
        LABEL_BY_ID[fld["id"]] = fld.get("label", fld["id"])


def friendly_type(fld):
    t = fld.get("type")
    if t == "text":
        return "Texto longo" if fld.get("textLong") else "Texto"
    if t == "number":
        return "Número"
    if t == "date":
        return "Data"
    if t == "boolean":
        return "Sim/Não"
    if t == "textOptions":
        return "Opções (várias)" if fld.get("multiple") else "Opções (uma)"
    if t == "reference":
        return "Seleção (várias)" if fld.get("multiple") else "Seleção"
    if t == "embeddedReference":
        return "Tabela"
    if t == "file":
        return "Arquivo"
    if t == "alert":
        return "Aviso na tela"
    return t or "—"


def options_text(fld):
    opts = fld.get("options") or []
    if not opts:
        return "—"
    return " · ".join(opts)


def obrig(fld):
    if fld.get("readOnly"):
        return "Não (só leitura)"
    return "Sim" if fld.get("required") else "Não"


def regra_text(fld):
    parts = []
    spec = fld.get("spec")
    if spec:
        parts.append(spec)
    if fld.get("readOnly"):
        parts.append("Preenchimento automático / somente leitura.")
    if fld.get("hidden"):
        parts.append("Oculto por padrão (aparece conforme regra de exibição).")
    return " ".join(parts) if parts else "—"


# ---------- helpers de formatação docx ----------

def shade_cell(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def set_cell_text(cell, text, bold=False, color=None, size=9, white=False):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(1)
    p.paragraph_format.space_before = Pt(1)
    run = p.add_run(text if text is not None else "")
    run.bold = bold
    run.font.size = Pt(size)
    if white:
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    elif color:
        run.font.color.rgb = color


def add_field_table(doc, fields, include_options=True):
    headers = ["Campo", "Tipo", "Obrigatório"]
    if include_options:
        headers.append("Opções")
    headers.append("Regra / observação")
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        set_cell_text(hdr[i], h, bold=True, white=True, size=9)
        shade_cell(hdr[i], HEADER_BG)
    for fld in fields:
        if fld.get("type") == "alert":
            continue
        row = table.add_row().cells
        set_cell_text(row[0], fld.get("label", ""), bold=True, size=9)
        set_cell_text(row[1], friendly_type(fld), size=9)
        set_cell_text(row[2], obrig(fld), size=9)
        col = 3
        if include_options:
            set_cell_text(row[3], options_text(fld), size=8, color=GREY)
            col = 4
        set_cell_text(row[col], regra_text(fld), size=8, color=GREY)
    return table


def h(doc, text, level):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.color.rgb = NAVY
    return p


def para(doc, text, italic=False, size=10.5, space_after=6):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.italic = italic
    r.font.size = Pt(size)
    p.paragraph_format.space_after = Pt(space_after)
    return p


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    r = p.add_run(text)
    r.font.size = Pt(10.5)
    return p


def alert_note(doc, fld):
    title = fld.get("alertTitle") or fld.get("label") or "Aviso"
    msg = fld.get("alertMessage") or ""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    r = p.add_run(f"⚠ {title}: ")
    r.bold = True
    r.font.size = Pt(10)
    r.font.color.rgb = NAVY
    r2 = p.add_run(msg)
    r2.font.size = Pt(10)
    r2.italic = True


# ---------- narrativa (curada por classe) ----------

_UNUSED_CONFIG = {
    "organizacao": {
        "form_id": "form-patlasv4-proto-unidade-organizacional",
        "out": "docs/entregaveis/docx/Atlas_Organizacao_Requisitos_Completo.docx",
        "titulo": "Classe Organização (Unidade Organizacional) — Fase 1",
        "historia": (
            "Como gestor de cadastro da MTI, quero cadastrar e manter organizações e unidades "
            "(MTI, Parceiro e Cliente) com seus dados cadastrais, documentos de habilitação, "
            "tributos e contatos, para habilitar os fluxos comerciais e de assinatura e controlar "
            "a conformidade documental de cada parceiro."
        ),
        "contexto": (
            "O Cadastro Organizacional é a tela central da hierarquia do Atlas. A mesma tela atende "
            "MTI, Parceiro e Cliente — o tipo é apenas um qualificador. A estrutura é recursiva: uma "
            "unidade aponta para a unidade pai, e o caminho e o nível são calculados automaticamente. "
            "A organização raiz (campo Empresa = Sim) concentra dados fiscais, contas bancárias, "
            "documentos de habilitação (MIPP), tributos e o limite de usuários. Um parceiro só acessa "
            "propostas e catálogos depois de ter a habilitação documental completa e aprovada pela MTI. "
            "Não existe a classe \"Nível Organizacional\": a hierarquia usa unidade pai + caminho + nível "
            "calculado. O Cargo é ancorado ao nó raiz da organização e sobrevive a reestruturações."
        ),
        "requisitos": [
            "Cadastrar unidades dos três tipos (MTI, Parceiro, Cliente) com hierarquia por unidade pai e caminho único.",
            "Controlar ativo/inativo e substituição de unidades (reestruturação), com migração de cargos da unidade extinta.",
            "Manter, na organização raiz, dados de cadastro (razão social, inscrições, CNAE, natureza jurídica), contas bancárias, documentos de habilitação, tributos e contatos.",
            "Controlar a conformidade documental (grupos MIPP) com progresso por grupo e bloqueio de acesso comercial enquanto incompleta.",
            "Permitir selecionar grupos de documento e adicionar, de uma vez, todos os tipos exigidos à grade de habilitação.",
            "Gerar convites de autocadastro e cadastrar cargos a partir da própria organização.",
            "Exibir, em modo leitura, os cargos e as pessoas vinculados à organização.",
            "Configurar os módulos visíveis da unidade, que definem (junto com o cargo) a permissão efetiva.",
        ],
        "regras": [
            "Empresa = Sim indica organização raiz e oculta a Unidade pai, o Caminho e o Nível.",
            "O caminho é gerado automaticamente pela cadeia de siglas (ex.: MTI, MTI/DIRC); o nível começa em 0 na raiz.",
            "O campo Poder é obrigatório quando o tipo é Cliente.",
            "Dados fiscais, contas bancárias, documentos MIPP, tributos, logo e documentos de execução só aparecem na organização raiz (Empresa = Sim).",
            "O acompanhamento da habilitação (status, progressos por grupo e bloqueio comercial) só aparece para organizações do tipo Parceiro.",
            "Parceiro com habilitação documental incompleta fica com acesso comercial bloqueado (sem proposta/catálogo).",
            "A data de vencimento de documentos pode ser preenchida automaticamente pelo backend (leitura do arquivo) ou manualmente (recorrência) e dispara notificação de vencimento.",
            "A seleção de módulos visíveis é livre por unidade — a unidade-filha não herda automaticamente os módulos da unidade-mãe.",
            "A permissão efetiva de uma pessoa é o cruzamento entre os módulos visíveis da unidade e os módulos do cargo (ou acesso total se o cargo for Administrador).",
            "Quando a unidade é desativada e tem uma unidade substituta indicada, usa-se o método Migrar cargos para transferir os cargos para a unidade nova.",
        ],
        "embed_titles": {
            "patlasv4proto-uo-contas-bancarias": "Contas bancárias",
            "patlasv4proto-uo-documentos": "Documentos de habilitação (MIPP)",
            "patlasv4proto-uo-docs-execucao": "Documentos de execução da parceria",
            "mqmdvi11ofo8m3": "Tributos e Encargos",
            "patlasv4proto-uo-contato-emails": "E-mails",
            "patlasv4proto-uo-contato-telefones": "Telefones",
            "patlasv4proto-uo-contato-enderecos": "Endereços",
            "patlasv4proto-uo-contato-redes-sociais": "Redes sociais",
            "patlasv4proto-uo-cargos-atribuidos": "Cargos atribuídos (somente leitura)",
            "patlasv4proto-uo-pessoas-nos-cargos": "Pessoas nos cargos (somente leitura)",
            "patlasv4proto-uo-convites": "Convites de cadastro",
        },
        "canonical": [
            "patlasv4proto-p-unidade-organizacional-mti",
            "patlasv4proto-p-unidade-organizacional-parceiro",
            "patlasv4proto-p-unidade-organizacional-cliente",
        ],
        "fluxo": (
            "Fluxo típico: cadastrar a organização raiz (Empresa = Sim) → preencher dados de "
            "cadastro, contas e tributos → no caso de Parceiro, selecionar os grupos de documento "
            "e usar a ação \"Adicionar à grade MIPP\" → anexar e validar os documentos → "
            "acompanhar o status até \"Aprovada pela MTI\" → cadastrar cargos e gerar convites "
            "para os colaboradores."
        ),
    },
    "convite": {
        "form_id": "form-patlasv4-proto-convite-cadastro",
        "out": "docs/entregaveis/docx/Atlas_CadastroBase_Convite_Vinculo_Requisitos_Completo.docx",
        "titulo": "Cadastro Base — Convite, Portal e Vínculo (processo de autocadastro) — Fase 1",
        "historia": (
            "Como gestor de uma organização (parceiro/cliente), quero gerar um link de convite e "
            "acompanhar quem se cadastrou, aprovando ou recusando os vínculos, para que novos "
            "colaboradores entrem no Atlas de forma controlada, sem cadastro manual um a um."
        ),
        "contexto": (
            "O cadastro base de pessoas externas funciona como um único processo de ponta a ponta. "
            "Ele começa na Organização, onde o gestor usa a ação Gerar Código de Convite para criar "
            "um link com quantidade de usos e validade. Esse convite (código, link, usos e validade) "
            "fica registrado e visível na organização. O colaborador acessa o Portal do Parceiro, "
            "informa o código e o CPF; os dados pessoais são coletados automaticamente e ele apenas "
            "define a senha. Ao confirmar, gera-se uma Solicitação de vínculo, que aparece como "
            "pendência para o gestor Confirmar ou Recusar. Confirmado o vínculo, a Pessoa passa a "
            "existir vinculada à organização do convite e um uso é consumido."
        ),
        "requisitos": [
            "Gerar convite com código e link, definindo quantidade de usos e data de expiração.",
            "Exibir, na organização, o histórico de convites e o convite ativo, com usos realizados e validade.",
            "Validar o código no Portal (válido, expirado ou já utilizado).",
            "Coletar automaticamente os dados pessoais a partir do CPF informado no Portal.",
            "Concluir o autocadastro com definição de senha, ou cancelar sem consumir o convite.",
            "Registrar a solicitação de vínculo e permitir ao gestor confirmar ou recusar.",
            "Consumir um uso do convite a cada cadastro confirmado e desativar o convite anterior quando um novo é gerado.",
        ],
        "regras": [
            "A data de expiração do convite deve ser futura; convite inativo ou expirado não aceita cadastros.",
            "Ao gerar um novo convite, o convite anterior da organização é desativado.",
            "A quantidade de usos é validada contra o limite de usuários da organização; cada cadastro confirmado incrementa os usos realizados.",
            "No Portal, apenas o CPF e a senha são digitados — os demais dados vêm automaticamente (somente leitura).",
            "Cancelar o autocadastro não consome o convite.",
            "A Solicitação de vínculo nasce com status Pendente e guarda o código de convite usado (rastreabilidade).",
            "Confirmar o vínculo cria a Pessoa vinculada à organização do convite; Recusar exige motivo.",
            "Os convites não são objetos pesquisáveis — são consultados pela organização que os gerou.",
        ],
        "embed_titles": {
            "patlasv4proto-mgc-convites-org": "Convites da organização (histórico)",
        },
        "canonical": ["patlasv4proto-p-convite-elogroup"],
        "metodos_nota": (
            "Este processo combina ações de três telas: na Organização, «Gerar Código de Convite» "
            "cria o link; no Portal do Parceiro, «Validar convite», «Confirmar cadastro» e "
            "«Cancelar» conduzem o autocadastro; na Solicitação de vínculo, «Confirmar Vínculo» e "
            "«Recusar» fecham a aprovação do gestor. As telas e ações estão detalhadas na seção "
            "\"Telas relacionadas\"."
        ),
        "anexos_forms": [
            {
                "form_id": "form-patlasv4-proto-metodo-gerar-convite",
                "titulo": "Ação: Gerar Código de Convite (criação do link)",
                "intro": (
                    "Acionada na aba Usuários da Organização. Com \"Criar convite = Não\" mostra o "
                    "histórico de convites; com \"Criar convite = Sim\" pede os parâmetros; com "
                    "\"Gerar = Sim\" exibe o resultado (código, link, vagas e mensagem)."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-portal-parceiro",
                "titulo": "Portal do Parceiro (autocadastro do colaborador)",
                "intro": (
                    "Tela pública de autocadastro por convite, em duas abas: Convite (validação do "
                    "código) e Seus dados (CPF + senha, com dados coletados automaticamente)."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-solicitacao-vinculo",
                "titulo": "Solicitação de vínculo (aprovação do gestor)",
                "intro": (
                    "Inbox do gestor: cada autocadastro gera uma solicitação pendente para "
                    "Confirmar ou Recusar o vínculo do colaborador com a organização."
                ),
            },
        ],
        "fluxo": (
            "Fluxo típico (ponta a ponta): na Organização, o gestor aciona Gerar Código de Convite "
            "→ define usos e validade → o sistema gera código e link → o gestor compartilha o link "
            "→ o colaborador abre o Portal do Parceiro, valida o código e informa o CPF (dados "
            "preenchidos automaticamente) → define a senha e Confirma → é criada uma Solicitação de "
            "vínculo pendente → o gestor Confirma o vínculo (ou Recusa com motivo) → a Pessoa passa "
            "a existir vinculada à organização e um uso do convite é consumido."
        ),
    },
    "assinatura": {
        "form_id": "mqebasqyphbwea",
        "out": "docs/entregaveis/docx/Atlas_Assinatura_Requisitos_Completo.docx",
        "titulo": "Assinatura — Workflow, Envelope e Painel — Fase 1",
        "historia": (
            "Como gestor, quero configurar fluxos de assinatura por cargo/unidade e enviar "
            "documentos para assinatura digital, e como signatário quero receber e dar parecer "
            "(aprovar/recusar) nos documentos pendentes, para formalizar propostas, contratos, "
            "ordens de serviço e termos com validade jurídica."
        ),
        "contexto": (
            "O Workflow de Assinatura define quem assina (por cargo/unidade) e por qual método. "
            "Ao enviar para assinatura, monta-se um Envelope que agrupa os documentos e vai para "
            "todos os signatários ao mesmo tempo (assinatura paralela). Casos como \"o presidente "
            "assina por último\" são operacionais — o presidente aguarda os demais; o sistema não "
            "ordena isso automaticamente. A recusa de qualquer signatário cancela o envelope "
            "inteiro (não existe assinatura parcial). Os métodos disponíveis são Certificado digital "
            "(token), Gov.br e MT Login — não há assinatura por senha simples. O signatário "
            "acompanha e dá parecer no Painel de Assinaturas Pendentes."
        ),
        "requisitos": [
            "Configurar o fluxo por tipo de processo e versão, com etapas e signatários.",
            "Habilitar nas etapas apenas cargos ativos com \"Pode assinar\" = Sim.",
            "Montar o envelope com documentos do ambiente ou upload, definindo método, prazo e política de envio.",
            "Enviar para assinatura, recusar (com motivo) e selecionar o método ao assinar.",
            "Acompanhar as pendências do signatário no Painel, com prazo e status.",
            "Registrar o histórico de envelopes (número, código de integridade, status).",
        ],
        "regras": [
            "Apenas workflows ativos aparecem na ação Enviar para assinatura.",
            "A Versão é uma referência à Versão de Processo ativa (não um número livre).",
            "Signatários com a mesma Ordem são notificados simultaneamente (paralelo); ordens diferentes criam sequência entre grupos.",
            "Padrão da Fase 1: enviar para todos simultaneamente.",
            "A recusa de qualquer signatário cancela o envelope inteiro; reabrir exige novo PDF e novo envelope.",
            "Só cargos ativos com \"Pode assinar\" = Sim podem ser signatários.",
            "Métodos de assinatura: Certificado digital (token), Gov.br ou MT Login — sem senha simples.",
            "Enquanto houver envelope ativo, o PDF do documento fica travado.",
            "Processos em andamento preservam a configuração de workflow original.",
            "No Painel, o signatário só pode Aprovar ou Recusar (recusa exige motivo).",
        ],
        "embed_titles": {
            "patlasv4proto-wf-etapas": "Etapas do Workflow (signatários)",
        },
        "canonical": ["patlasv4proto-p-wf-proposta-mti"],
        "metodos_nota": (
            "As ações de assinatura são acionadas a partir das telas de processo (Proposta, "
            "Contrato, OS, Projeto) e do Painel: «Enviar para assinatura» cria o envelope e "
            "notifica todos os signatários ao mesmo tempo; «Recusar assinatura» cancela o "
            "envelope inteiro mediante motivo; «Selecionar método» habilita a assinatura por "
            "Certificado digital, Gov.br ou MT Login após o Aprovar no Painel."
        ),
        "anexos_forms": [
            {
                "form_id": "form-patlasv4-proto-assinatura-documentos",
                "titulo": "Envelope de documentos (configuração da assinatura)",
                "intro": (
                    "O envelope agrupa os documentos enviados para assinatura. Organizado em abas: "
                    "Dados do envelope, Signatários, Política e prazos, Configuração da assinatura e Avançado."
                ),
            },
            {
                "form_id": "form-patlasv4-proto-painel-assinaturas-pendentes",
                "titulo": "Painel de Assinaturas Pendentes (operação do signatário)",
                "intro": (
                    "Caixa de entrada pessoal do signatário: lista os documentos que aguardam a "
                    "sua assinatura, com prazo e status, e permite Abrir, Aprovar ou Recusar."
                ),
            },
        ],
        "fluxo": (
            "Fluxo típico: configurar o Workflow de Assinatura (tipo de processo, versão e etapas "
            "com os cargos signatários) → na tela do processo, acionar «Enviar para assinatura», "
            "que monta o Envelope e notifica todos ao mesmo tempo → cada signatário abre o "
            "documento no Painel e dá o parecer: ao Aprovar, escolhe o método (Certificado, Gov.br "
            "ou MT Login) e assina; ao Recusar, informa o motivo e o envelope é cancelado → "
            "concluídas todas as assinaturas, o documento fica assinado e imutável."
        ),
    },
    "cargo": {
        "form_id": "form-patlasv4-proto-cargo",
        "out": "docs/entregaveis/docx/Atlas_Cargo_Requisitos_Completo.docx",
        "titulo": "Classe Cargo — Fase 1",
        "historia": (
            "Como gestor, quero definir cargos por organização e unidade, com ocupantes, "
            "permissões e capacidade de assinar, para direcionar os fluxos de trabalho e as "
            "assinaturas por função (e não por pessoa fixa)."
        ),
        "contexto": (
            "O Cargo substitui a classe nativa \"Atribuição\" do SYDLE ONE (não exposta ao usuário) "
            "e fica ancorado ao nó raiz da organização, sobrevivendo a reestruturações. As pessoas "
            "são vinculadas ao cargo como ocupantes (titular, substituto ou suplente) e o ocupante "
            "herda a unidade do próprio cargo — não se escolhe unidade ao atribuir. A permissão "
            "efetiva resulta da combinação dos módulos do cargo com os módulos visíveis da unidade, "
            "ou é total quando o cargo é Administrador. O campo \"Pode assinar\" habilita o cargo nas "
            "etapas do Workflow de Assinatura, mas não autoriza assinatura automática."
        ),
        "requisitos": [
            "Cadastrar cargos com organização, unidade (caminho), perfil e situação ativa.",
            "Definir se o cargo pode assinar e qual o seu papel na assinatura.",
            "Definir permissões: Administrador (acesso total) ou Executor (módulos limitados).",
            "Gerir os ocupantes do cargo com condição, região de atuação e vigência.",
            "Preservar ocupações e histórico quando o cargo é inativado.",
        ],
        "regras": [
            "O ocupante referencia sempre um servidor ativo — nunca uma pessoa diretamente.",
            "Administrador = Sim dá acesso total e ignora o filtro hierárquico da unidade.",
            "Para executor, a permissão é a interseção entre os módulos do cargo e os módulos visíveis da unidade do cargo.",
            "O ocupante herda a unidade organizacional do cargo (não escolhe unidade no Atribuir cargo).",
            "Ocupante inativo não entra em roteamento nem em fluxos de trabalho.",
            "\"Pode assinar\" = Sim disponibiliza o cargo nas etapas de assinatura, mas não assina automaticamente.",
            "O papel na assinatura só aparece quando \"Pode assinar\" = Sim.",
            "Os módulos do executor só aparecem quando Administrador = Não.",
            "Cargo inativo some dos seletores, mas ocupações e histórico são preservados.",
            "Aprovar/Recusar são ações do fluxo, não permissões fixas do cargo.",
        ],
        "embed_titles": {
            "patlasv4proto-cargo-ocupantes-lista": "Ocupantes",
        },
        "canonical": [
            "patlasv4proto-p-cargo-mti",
            "patlasv4proto-p-cargo-parceiro",
            "patlasv4proto-p-cargo-cliente",
        ],
        "metodos_nota": (
            "A classe Cargo não tem métodos próprios na tela. O cargo é criado pela ação "
            "\"Cadastrar cargo\" da Organização (que já preenche organização, caminho da unidade e "
            "perfil) ou diretamente nesta tela. As pessoas são vinculadas pela ação \"Atribuir "
            "cargo\" da classe Pessoa."
        ),
        "fluxo": (
            "Fluxo típico: criar o cargo (pela Organização ou por esta tela) → definir organização, "
            "unidade, perfil e se Pode assinar → na aba Permissões, marcar Administrador ou escolher "
            "os Módulos do executor → na aba Ocupantes, vincular os servidores com condição "
            "(Titular/Substituto/Suplente), região de atuação e vigência."
        ),
    },
    "pessoa": {
        "form_id": "form-patlasv4-proto-pessoa",
        "out": "docs/entregaveis/docx/Atlas_Pessoa_Requisitos_Completo.docx",
        "titulo": "Classe Pessoa — Fase 1",
        "historia": (
            "Como RH/gestor, quero manter um cadastro único de pessoas (MTI, parceiro, cliente e "
            "interno) e alocá-las em cargos, para controlar credenciais, permissões e assinaturas, "
            "garantindo que cada indivíduo só acesse o sistema após receber um vínculo de cargo."
        ),
        "contexto": (
            "A Pessoa é o cadastro único de indivíduos do Atlas. Não existe cadastro separado de "
            "\"Cliente\": cliente é uma organização do tipo Cliente; a Pessoa representa o indivíduo. "
            "O acesso ao sistema só é habilitado após uma atribuição de cargo, que cria, nos "
            "bastidores, o Servidor e o Ocupante (a tela de Servidor não é exposta ao usuário). A "
            "profundidade do cadastro varia por perfil: a MTI usa o cadastro completo (inclusive "
            "currículo); parceiro e cliente preenchem principalmente dados de contato e cadastrais. "
            "A mesma tela exibe todas as abas para todos os perfis — não há versão simplificada."
        ),
        "requisitos": [
            "Cadastrar a pessoa com dados pessoais, documentos, filiação, informações demográficas e contatos.",
            "Habilitar acesso e credenciais (login, senha e token de certificado digital) após atribuição de cargo.",
            "Atribuir cargo definindo perfil, organização, matrícula (quando MTI), cargo, condição e região — a unidade vem do cargo.",
            "Registrar dados complementares (matrícula, MT-ID, preferências de notificação, dados de fornecedor e bancários).",
            "Manter o currículo (habilidades, experiências acadêmicas e profissionais).",
            "Permitir operações de desligamento e inativação de acesso pela ação Opções.",
        ],
        "regras": [
            "Não existe classe \"Cliente\" — cliente é uma organização do tipo Cliente; a Pessoa é o indivíduo.",
            "A pessoa só acessa fluxos de trabalho após ter ao menos um cargo atribuído ativo.",
            "Login e senha só aparecem quando \"Ativo para acesso\" = Sim.",
            "Os campos de fornecedor só aparecem quando \"É um fornecedor?\" = Sim.",
            "A matrícula é obrigatória para perfil MTI na atribuição de cargo.",
            "A unidade do vínculo é derivada do cargo (não é escolhida na atribuição).",
            "A senha é armazenada de forma protegida; a assinatura não usa senha simples (apenas certificado, Gov.br ou MT Login).",
            "A data de nascimento não pode ser futura; o Nome não pode ser vazio.",
        ],
        "embed_titles": {},
        "canonical": [
            "patlasv4proto-p-pessoa-bernardo",
            "patlasv4proto-p-pessoa-lucas",
            "patlasv4proto-p-pessoa-mti",
            "patlasv4proto-p-pessoa-parceiro",
        ],
        "fluxo": (
            "Fluxo típico: usar a ação Criar para cadastrar a pessoa com os dados mínimos "
            "(Nome, CPF, Carteira) → completar dados pessoais, documentos e contato → usar a ação "
            "Atribuir cargo (perfil → organização → cargo → condição → região), o que libera "
            "\"Ativo para acesso\" e cria o acesso nos bastidores → preencher login e senha. "
            "Para encerrar o vínculo, usar Opções (desligamento ou inativar acesso)."
        ),
    },
}

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from atlas_classes_config import CONFIG  # noqa: E402

CFG = CONFIG[CLASSE]
UO_ID = CFG["form_id"]
OUT_PATH = os.path.join(ROOT, CFG["out"])
HISTORIA = CFG["historia"]
CONTEXTO = CFG["contexto"]
REQUISITOS = CFG["requisitos"]
REGRAS_NEGOCIO = CFG["regras"]
EMBED_TITLES = CFG["embed_titles"]


def rule_to_text(rule):
    src = LABEL_BY_ID.get(rule["sourceFieldId"], rule["sourceFieldId"])
    targets = [LABEL_BY_ID.get(t, t) for t in rule.get("targetFieldIds", [])]
    if rule.get("sourceKind") == "boolean":
        val = "Sim" if rule.get("expectedBoolean") else "Não"
    else:
        val = rule.get("expectedOptionText", "")
    op = rule.get("operator", "eq")
    cmp = "for diferente de" if op == "neq" else "="
    action = {
        "show": "mostrar", "hide": "ocultar",
        "readonly": "tornar somente leitura", "editable": "tornar editável",
    }.get(rule.get("action"), rule.get("action"))
    alvos = "; ".join(targets)
    return f"Quando «{src}» {cmp} «{val}» → {action}: {alvos}"


# ---------- montagem do documento ----------

doc = Document()
style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(10.5)

# Capa
title = doc.add_heading("Projeto Atlas — Especificação de Requisitos", level=0)
for r in title.runs:
    r.font.color.rgb = NAVY
sub = doc.add_paragraph()
rs = sub.add_run(CFG["titulo"])
rs.bold = True
rs.font.size = Pt(14)
rs.font.color.rgb = GREY
meta = doc.add_paragraph()
meta.add_run(
    "Plataforma SYDLE ONE · MTI — Empresa Mato-grossense de Tecnologia da Informação\n"
    "Documento gerado a partir do protótipo navegável (estado atual)."
).font.size = Pt(10)
doc.add_paragraph()

uo = FORM_BY_ID[UO_ID]

# 1. História
h(doc, "1. História de usuário", 1)
para(doc, HISTORIA)

# 2. Contexto
h(doc, "2. Contexto da história", 1)
para(doc, CONTEXTO)

# 3. Requisitos funcionais
h(doc, "3. Requisitos funcionais", 1)
for r in REQUISITOS:
    bullet(doc, r)

# 4. Regras de negócio
h(doc, "4. Regras de negócio", 1)
for r in REGRAS_NEGOCIO:
    bullet(doc, r)

# 5. Telas e campos
h(doc, "5. Telas e campos", 1)
para(
    doc,
    "A tela é organizada em abas. Os blocos que no sistema são tabelas vinculadas "
    "estão apresentados abaixo como parte da própria aba, com seus campos listados.",
    italic=True,
)

def render_fields_block(doc, flds):
    """Renderiza campos simples numa tabela e expande embutidos como subseções."""
    simple = [f for f in flds if f.get("type") not in ("embeddedReference",)]
    # avisos (alert) renderizados como nota antes da tabela
    for f in flds:
        if f.get("type") == "alert":
            alert_note(doc, f)
    simple_no_alert = [f for f in simple if f.get("type") != "alert"]
    if simple_no_alert:
        add_field_table(doc, simple_no_alert)
        doc.add_paragraph()
    # embutidos
    for f in flds:
        if f.get("type") != "embeddedReference":
            continue
        title = EMBED_TITLES.get(f["id"], f.get("label", "Tabela"))
        h(doc, title, 4)
        linked = FORM_BY_ID.get(f.get("linkedFormId"))
        intro = f.get("spec") or ""
        readonly = " (somente leitura)" if f.get("readOnly") else ""
        para(
            doc,
            f"Tabela com várias linhas{readonly}. {intro} Cada linha tem os campos:".strip(),
            italic=True, size=10,
        )
        if linked:
            add_field_table(doc, linked.get("fields", []))
            # regras internas do formulário embutido
            irules = linked.get("fieldVisibilityRules", [])
            if irules:
                para(doc, "Regras de exibição desta tabela:", italic=True, size=9.5, space_after=2)
                for r in irules:
                    bullet(doc, rule_to_text(r))
        doc.add_paragraph()


def render_form_sections(doc, form, aba_level=2):
    """Renderiza abas/subseções/campos de qualquer formulário (com ou sem seções)."""
    secs = form.get("sections", [])
    flds = form.get("fields", [])
    if not secs:
        render_fields_block(doc, flds)
        return
    tops = [s for s in secs if not s.get("parentSectionId")]
    for sec in tops:
        h(doc, f"Aba: {sec.get('title')}", aba_level)
        direct = [f for f in flds if f.get("sectionId") == sec["id"]]
        if direct:
            render_fields_block(doc, direct)
        subs = [s for s in secs if s.get("parentSectionId") == sec["id"]]
        for sub in subs:
            h(doc, sub.get("title"), aba_level + 1)
            sflds = [f for f in flds if f.get("sectionId") == sub["id"]]
            if sflds:
                render_fields_block(doc, sflds)
            else:
                para(doc, "—", italic=True)


sections = uo.get("sections", [])
top_sections = [s for s in sections if not s.get("parentSectionId")]
fields = uo.get("fields", [])
render_form_sections(doc, uo)

# 6. Regras de exibição condicional (campos ocultos)
h(doc, "6. Regras de exibição condicional (campos que aparecem/ocultam)", 1)
para(
    doc,
    "As regras abaixo controlam quando cada campo aparece, sai da tela ou fica somente "
    "leitura, conforme o que o usuário seleciona.",
    italic=True,
)
for r in uo.get("fieldVisibilityRules", []):
    bullet(doc, rule_to_text(r))

# 7. Métodos e ações
h(doc, "7. Métodos e ações", 1)
methods = uo.get("methods", [])
if not methods and CFG.get("metodos_nota"):
    para(doc, CFG["metodos_nota"], italic=True)
for m in methods:
    h(doc, m.get("name"), 3)
    inp = FORM_BY_ID.get(m.get("inputFormId"))
    if inp and inp.get("metadata"):
        para(doc, inp["metadata"], italic=True, size=10)
    if inp and inp.get("fields"):
        para(doc, "Campos solicitados pela ação:", size=10, space_after=2)
        add_field_table(doc, inp.get("fields", []))
    doc.add_paragraph()

# 8. Exemplo de uso
h(doc, "8. Exemplo de uso", 1)
para(
    doc,
    "Cenários reais cadastrados no protótipo (presets de exemplo desta classe):",
    italic=True,
)
all_presets = uo.get("exampleValuePresets", [])
canonical_ids = CFG["canonical"]
# campos de identidade/destaque para resumir cada preset
identity_ids = [f["id"] for f in fields if f.get("relevance") in ("identity", "highlight")]
canon = [p for p in all_presets if p.get("id") in canonical_ids]
others = [p for p in all_presets if p.get("id") not in canonical_ids]
shown = canon + others[: max(0, 9 - len(canon))]
for preset in shown:
    name = preset.get("name", "")
    fv = preset.get("fieldValues", {})
    extra = []
    for fid in identity_ids[:3]:
        val = fv.get(fid)
        if val not in (None, "", []):
            lbl = LABEL_BY_ID.get(fid, fid)
            extra.append(f"{lbl}: {val}")
    desc = name
    if extra:
        desc += " — " + "; ".join(extra)
    bullet(doc, desc)

restante = len(all_presets) - len(shown)
if restante > 0:
    para(doc, f"… e mais {restante} exemplos cadastrados no protótipo.", italic=True, size=9.5)

para(doc, "")
para(doc, CFG["fluxo"], size=10.5)

# 9. Anexos (formulários relacionados: envelope, painel, etc.)
anexos = CFG.get("anexos_forms", [])
if anexos:
    h(doc, "9. Telas relacionadas", 1)
    para(
        doc,
        "Telas que compõem o tema mas são configuradas/operadas em formulários próprios.",
        italic=True,
    )
    for ax in anexos:
        fm = FORM_BY_ID.get(ax["form_id"])
        if not fm:
            continue
        h(doc, ax["titulo"], 2)
        if ax.get("intro"):
            para(doc, ax["intro"], italic=True)
        render_form_sections(doc, fm, aba_level=3)
        rules = fm.get("fieldVisibilityRules", [])
        if rules:
            para(doc, "Regras de exibição desta tela:", italic=True, size=9.5, space_after=2)
            for r in rules:
                bullet(doc, rule_to_text(r))
        ax_methods = fm.get("methods", [])
        if ax_methods:
            para(doc, "Ações desta tela:", italic=True, size=9.5, space_after=2)
            for m in ax_methods:
                nome = m.get("name", "")
                espec = m.get("spec", "")
                p = doc.add_paragraph(style="List Bullet")
                rr = p.add_run(f"{nome}")
                rr.bold = True
                rr.font.size = Pt(10)
                if espec:
                    r2 = p.add_run(f" — {espec}")
                    r2.font.size = Pt(10)
            inp_forms = [m.get("inputFormId") for m in ax_methods if m.get("inputFormId")]
            for ifid in inp_forms:
                ifm = FORM_BY_ID.get(ifid)
                if ifm and ifm.get("fields"):
                    para(doc, f"Campos da ação «{ifm.get('name','')}»:", italic=True, size=9.5, space_after=2)
                    add_field_table(doc, ifm.get("fields", []))

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
doc.save(OUT_PATH)
print("Documento gerado:", OUT_PATH)
print("Abas:", len(top_sections))
print("Campos diretos:", len(fields))
print("Regras de exibição:", len(uo.get("fieldVisibilityRules", [])))
print("Métodos:", len(uo.get("methods", [])))
print("Exemplos:", len(uo.get("exampleValuePresets", [])))
