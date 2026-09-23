"""Atualiza Organização (Atlas) para alinhar com UI Sydle dos anexos."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

EPIC = Path(__file__).resolve().parents[1] / "data/subprojects/atlas-prototipo/epics/prototipo"
FORMS = EPIC / "forms.json"

HTML_PROTHEUS = """<div class="proto-alert proto-alert--warn">
  <strong>Protheus</strong>
  <p>Não foi possível se conectar ao Protheus para obtenção automática do código do Cliente/Parceiro. Se desejar, pode inserir manualmente.</p>
</div>
<style>
  .proto-alert { margin: 0 0 12px; padding: 10px 12px; border-radius: 8px; border: 1px solid #f1c40f55; background: #fef9e7; color: #6b5a00; font-size: 0.9rem; }
  .proto-alert p { margin: 4px 0 0; }
  .proto-alert--warn { border-color: #eab30866; background: #fefce8; color: #854d0e; }
  .proto-alert--info { border-color: #f59e0b66; background: #fffbeb; color: #92400e; }
</style>"""

HTML_CNPJ_API = """<div class="proto-alert proto-alert--info">
  <strong>Consulta CNPJ</strong>
  <p>Não foi possível se conectar à API de Consulta de CNPJ para obtenção automática das informações do Cliente/Parceiro. Use Validar CNPJ ou preencha manualmente.</p>
</div>"""


def field_by_id(fields: list, fid: str) -> dict | None:
    return next((f for f in fields if f.get("id") == fid), None)


def ensure_field(fields: list, field: dict, after_id: str | None = None) -> None:
    existing = field_by_id(fields, field["id"])
    if existing:
        existing.update({k: v for k, v in field.items() if k != "id"})
        return
    if after_id:
        for i, f in enumerate(fields):
            if f.get("id") == after_id:
                fields.insert(i + 1, field)
                return
    fields.append(field)


def main() -> None:
    forms = json.loads(FORMS.read_text(encoding="utf-8"))
    org = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")

    # --- Sections rename / structure ---
    org["sectionLayout"] = "accordion"
    child_to_parent = {
        s["id"]: s["parentSectionId"]
        for s in org["sections"]
        if s.get("parentSectionId")
    }
    for field in org["fields"]:
        sid = field.get("sectionId")
        if sid in child_to_parent:
            field["sectionId"] = child_to_parent[sid]
    org["sections"] = [s for s in org["sections"] if not s.get("parentSectionId")]

    for s in org["sections"]:
        sid = s["id"]
        if sid == "sec-patlasv4proto-uo-dados":
            s["title"] = "Dados do Cadastro"
            s["icon"] = "badge"
        elif sid == "sec-mqgzc7zd-iw61vf1":
            s["title"] = "Informações Adicionais"
            s["icon"] = "info"
        elif sid == "sec-patlasv4proto-uo-ajustes":
            s["title"] = "Dados da Organização"
            s["icon"] = "business"
        elif sid == "sec-patlasv4proto-uo-permissoes":
            s["title"] = "Permissões"
        elif sid == "sec-patlasv4proto-uo-dados-contato":
            s["title"] = "Contato"
        elif sid == "sec-patlasv4proto-uo-sub-habilitacao":
            s["title"] = "Habilitação documental"

    fields = org["fields"]

    # --- Dados do Cadastro ---
    ensure_field(
        fields,
        {
            "id": "patlasv4proto-uo-html-alerta-protheus",
            "type": "html",
            "label": "",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-patlasv4proto-uo-dados",
            "htmlContent": HTML_PROTHEUS,
            "spec": "Alerta quando a integração Protheus não retorna o código automaticamente.",
        },
        after_id=None,
    )
    # move alert to top of dados section: put first among that section
    alert = field_by_id(fields, "patlasv4proto-uo-html-alerta-protheus")
    if alert:
        fields.remove(alert)
        # insert before first field of dados section
        idx = next(i for i, f in enumerate(fields) if f.get("sectionId") == "sec-patlasv4proto-uo-dados")
        fields.insert(idx, alert)

    for fid, label, spec in [
        ("patlasv4proto-uo-nome", "Nome", "Nome da organização."),
        ("patlasv4proto-uo-sigla", "Sigla", "Sigla / nome curto."),
        ("patlasv4proto-uo-cnpj", "CNPJ", "CNPJ da organização (raiz)."),
        (
            "patlasv4proto-uo-codigo-cliente-parceiro",
            "Código do cliente/parceiro",
            "Código no Protheus. Pode ser preenchido manualmente se a integração falhar.",
        ),
        ("patlasv4proto-uo-ativo", "Ativo", "Organização ativa no sistema."),
    ]:
        f = field_by_id(fields, fid)
        if f:
            f["label"] = label
            f["sectionId"] = "sec-patlasv4proto-uo-dados"
            if spec:
                f["spec"] = spec

    # hide data ultima atualizacao from main cadastro view or keep - screenshots don't show it
    f = field_by_id(fields, "patlasv4proto-uo-data-ultima-atualizacao")
    if f:
        f["hidden"] = True

    # --- Dados da Organização alerts + labels ---
    ensure_field(
        fields,
        {
            "id": "patlasv4proto-uo-html-alerta-cnpj-api",
            "type": "html",
            "label": "",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-patlasv4proto-uo-ajustes",
            "htmlContent": HTML_CNPJ_API,
            "spec": "Alerta quando a API de consulta CNPJ não está disponível.",
            "hidden": True,
        },
        after_id=None,
    )
    # place before validar cnpj
    api_alert = field_by_id(fields, "patlasv4proto-uo-html-alerta-cnpj-api")
    validar = field_by_id(fields, "patlasv4proto-uo-html-validar-cnpj")
    if api_alert and validar:
        fields.remove(api_alert)
        fields.insert(fields.index(validar), api_alert)

    for fid, label in [
        ("mqgzalmsd6b805", "Razão social"),
        ("mqh1rbjlh7gf7u", "Nome fantasia"),
        ("mqh1xpb25qx8tu", "Natureza jurídica"),
        ("patlasv4proto-uo-inscricao-municipal", "Inscrição municipal"),
        ("patlasv4proto-uo-inscricao-estadual", "Inscrição estadual"),
        ("patlasv4proto-uo-cnae", "CNAE (atividade principal)"),
        ("mqh1uw9rst5eo8", "CNAE (atividade secundária)"),
    ]:
        f = field_by_id(fields, fid)
        if f:
            f["label"] = label

    cnae2 = field_by_id(fields, "mqh1uw9rst5eo8")
    if cnae2:
        cnae2["hidden"] = True  # shown via empresa rule

    # Contas bancárias: stay hidden by default, shown when empresa
    contas = field_by_id(fields, "patlasv4proto-uo-contas-bancarias")
    if contas:
        contas["label"] = "Contas bancárias"
        contas["hidden"] = True

    # --- Informações Adicionais ---
    empresa = field_by_id(fields, "patlasv4proto-uo-empresa")
    if empresa:
        empresa["label"] = "Organização raiz"
        empresa["sectionId"] = "sec-mqgzc7zd-iw61vf1"
        empresa["required"] = True
        empresa["spec"] = "Indica se esta é a organização raiz (sem unidade pai)."

    tipo = field_by_id(fields, "patlasv4proto-uo-tipo-organizacao")
    if tipo:
        tipo["label"] = "Tipo de organização"
        tipo["sectionId"] = "sec-mqgzc7zd-iw61vf1"
        tipo["options"] = ["MTI", "Parceiro", "Cliente"]
        tipo["required"] = True
        tipo["spec"] = "MTI, Parceiro ou Cliente. Controla campos condicionais (Parcerias, Poder, habilitação)."

    poder = field_by_id(fields, "patlasv4proto-uo-poder")
    if poder:
        poder["label"] = "Poder da organização"
        poder["sectionId"] = "sec-mqgzc7zd-iw61vf1"
        poder["options"] = [
            "Executivo",
            "Legislativo",
            "Judiciário",
            "Independente / Fiscalizador",
        ]
        poder["spec"] = "Visível quando Tipo de organização = Cliente."

    # Parcerias: reuse produto-parceria as visible Parcerias for Parceiro
    parc = field_by_id(fields, "patlasv4proto-uo-produto-parceria")
    if parc:
        parc["label"] = "Parcerias"
        parc["sectionId"] = "sec-mqgzc7zd-iw61vf1"
        parc["hidden"] = True  # shown by visibility rule for Parceiro
        parc["required"] = False
        parc["type"] = "textOptions"
        parc["multiple"] = True
        parc.pop("linkedFormId", None)
        parc["options"] = [
            "Parceria tecnológica",
            "Parceria comercial",
            "Parceria de capacitação",
            "Parceria de inovação",
            "Outra",
        ]
        parc["spec"] = "Obrigatório quando Tipo = Parceiro. Selecione as parcerias vinculadas."
        parc["relevance"] = "common"

    resp = field_by_id(fields, "patlasv4proto-uo-responsavel")
    if resp:
        resp["label"] = "Responsável"
        resp["sectionId"] = "sec-mqgzc7zd-iw61vf1"

    ensure_field(
        fields,
        {
            "id": "patlasv4proto-uo-observacoes",
            "label": "Observações da organização",
            "type": "text",
            "size": "large",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-mqgzc7zd-iw61vf1",
            "textLong": True,
            "spec": "Observações livres da organização (rich text no Sydle; no protótipo como texto longo).",
        },
        after_id="patlasv4proto-uo-responsavel",
    )

    # Hide hierarchy clutter from Informações Adicionais default view
    for fid in (
        "patlasv4proto-uo-unidade-pai",
        "patlasv4proto-uo-caminho",
        "patlasv4proto-uo-nivel",
        "patlasv4proto-uo-substituida",
    ):
        f = field_by_id(fields, fid)
        if f:
            f["hidden"] = True
            f["sectionId"] = "sec-mqgzc7zd-iw61vf1"

    # --- Habilitação: NDA + Acesso comercial ---
    ensure_field(
        fields,
        {
            "id": "patlasv4proto-uo-nda-assinado",
            "label": "NDA assinado",
            "type": "boolean",
            "size": "medium",
            "readOnly": False,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "sectionId": "sec-patlasv4proto-uo-documentos-aba",
            "hidden": True,
            "spec": "Indica se o NDA da organização parceira foi assinado.",
        },
        after_id="patlasv4proto-uo-habilitacao-status",
    )

    acesso = field_by_id(fields, "patlasv4proto-uo-acesso-comercial-bloqueado")
    if acesso:
        # Keep id for compatibility; change label to match Sydle "Acesso comercial"
        # Semantics in Sydle: ON = has access. Old field was "bloqueado" (true=blocked).
        # Invert meaning: store as "acesso liberado" conceptually via label + spec.
        acesso["label"] = "Acesso comercial"
        acesso["id"] = "patlasv4proto-uo-acesso-comercial"  # new clearer id
        acesso["readOnly"] = False
        acesso["hidden"] = True
        acesso["spec"] = (
            "Sim = acesso comercial liberado. Em geral fica Não até Status = Aprovada pela MTI."
        )

    # Fix references to old acesso field id in rules/presets later
    hab = field_by_id(fields, "patlasv4proto-uo-habilitacao-status")
    if hab:
        hab["label"] = "Status de habilitação documental"
        # keep options; make showable via rules (hidden default)

    # Docs execução: show for partner via rules; update label
    docs_ex = field_by_id(fields, "patlasv4proto-uo-docs-execucao")
    if docs_ex:
        docs_ex["label"] = "Documentos de execução da parceria"
        docs_ex["hidden"] = True

    # Tributos labels
    for fid, label in [
        ("patlasv4proto-uo-regime-tributacao", "Regime de tributação"),
        ("patlasv4proto-uo-isento-icms", "Isento de ICMS"),
        ("patlasv4proto-uo-isento-icms-doc", "Documento comprobatório — Isenção ICMS"),
        ("patlasv4proto-uo-isento-inscricao-estadual", "Isento de inscrição estadual"),
        ("patlasv4proto-uo-isento-ie-doc", "Documento comprobatório — Isenção Inscrição Estadual"),
        ("mqmdvi11ofo8m3", "Tributos e encargos"),
    ]:
        f = field_by_id(fields, fid)
        if f:
            f["label"] = label

    mods = field_by_id(fields, "patlasv4proto-uo-modulos-visiveis")
    if mods:
        mods["label"] = "Módulos visíveis"
        mods["options"] = [
            "Administração",
            "Catálogo e Proposta",
            "Workflow de Assinatura",
            "Integrações",
            "Publicações",
            "Relatórios",
        ]

    # Hide pessoas-nos-cargos extra (screenshot only shows cargos atribuídos)
    pessoas = field_by_id(fields, "patlasv4proto-uo-pessoas-nos-cargos")
    if pessoas:
        pessoas["hidden"] = True

    cargos = field_by_id(fields, "patlasv4proto-uo-cargos-atribuidos")
    if cargos:
        cargos["label"] = "Cargos atribuídos"

    # --- Visibility rules updates ---
    rules = org.get("fieldVisibilityRules") or []

    def replace_target(old: str, new: str) -> None:
        for r in rules:
            tids = r.get("targetFieldIds") or []
            r["targetFieldIds"] = [new if t == old else t for t in tids]

    replace_target("patlasv4proto-uo-acesso-comercial-bloqueado", "patlasv4proto-uo-acesso-comercial")

    # Ensure empresa show/hide includes new fields
    for r in rules:
        if r.get("id") == "rule-uo-show-ajustes-empresa":
            extra = [
                "patlasv4proto-uo-html-alerta-cnpj-api",
                "patlasv4proto-uo-html-validar-cnpj",
                "mqh1uw9rst5eo8",
            ]
            tids = r.setdefault("targetFieldIds", [])
            for e in extra:
                if e not in tids:
                    tids.append(e)
        if r.get("id") == "rule-uo-hide-ajustes-nao-empresa":
            extra = [
                "patlasv4proto-uo-html-alerta-cnpj-api",
                "patlasv4proto-uo-html-validar-cnpj",
                "mqh1uw9rst5eo8",
            ]
            tids = r.setdefault("targetFieldIds", [])
            for e in extra:
                if e not in tids:
                    tids.append(e)
        if r.get("id") == "rule-uo-show-habilitacao-parceiro":
            extra = [
                "patlasv4proto-uo-nda-assinado",
                "patlasv4proto-uo-acesso-comercial",
                "patlasv4proto-uo-docs-execucao",
            ]
            tids = r.setdefault("targetFieldIds", [])
            # remove old id if present
            tids[:] = [t for t in tids if t != "patlasv4proto-uo-acesso-comercial-bloqueado"]
            for e in extra:
                if e not in tids:
                    tids.append(e)
        if r.get("id") == "rule-uo-hide-habilitacao-nao-parceiro":
            extra = [
                "patlasv4proto-uo-nda-assinado",
                "patlasv4proto-uo-acesso-comercial",
                "patlasv4proto-uo-docs-execucao",
            ]
            tids = r.setdefault("targetFieldIds", [])
            tids[:] = [t for t in tids if t != "patlasv4proto-uo-acesso-comercial-bloqueado"]
            for e in extra:
                if e not in tids:
                    tids.append(e)

    # Rename product rules already target produto-parceria - keep as Parcerias field id
    # Ensure show produto when parceiro still works (same id)

    # Make Parcerias required visually via rule - already show/hide

    # --- Presets: migrate acesso-comercial-bloqueado → acesso-comercial (invert) ---
    for p in org.get("exampleValuePresets") or []:
        fv = p.setdefault("fieldValues", {})
        if "patlasv4proto-uo-acesso-comercial-bloqueado" in fv:
            blocked = fv.pop("patlasv4proto-uo-acesso-comercial-bloqueado")
            # old true=blocked → new true=has access
            fv["patlasv4proto-uo-acesso-comercial"] = False if blocked else True
        if "patlasv4proto-uo-nda-assinado" not in fv and fv.get("patlasv4proto-uo-tipo-organizacao") == "Parceiro":
            fv["patlasv4proto-uo-nda-assinado"] = False
        if "patlasv4proto-uo-observacoes" not in fv:
            fv["patlasv4proto-uo-observacoes"] = ""
        # Ensure empresa key still works (Organização raiz)
        if "patlasv4proto-uo-empresa" not in fv:
            fv["patlasv4proto-uo-empresa"] = True

    # --- Telefone: add Ramal if missing ---
    tel = next((f for f in forms if f["id"] == "form-patlasv4-proto-pessoa-telefone"), None)
    if tel and not field_by_id(tel["fields"], "patlasv4proto-ptel-ramal"):
        tel["fields"].append(
            {
                "id": "patlasv4proto-ptel-ramal",
                "label": "Ramal",
                "type": "text",
                "size": "small",
                "readOnly": False,
                "required": False,
                "multiple": False,
                "relevance": "common",
                "spec": "Ramal opcional.",
            }
        )
    if tel:
        tipo_tel = field_by_id(tel["fields"], "patlasv4proto-ptel-tipo")
        if tipo_tel and tipo_tel.get("type") == "text":
            tipo_tel["type"] = "textOptions"
            tipo_tel["options"] = ["Atendimento", "Comercial", "Pessoal", "WhatsApp", "Outro"]

    # --- Conta bancária options closer to screenshot ---
    ban = next((f for f in forms if f["id"] == "form-patlasv4-proto-uo-conta-bancaria"), None)
    if ban:
        tc = field_by_id(ban["fields"], "patlasv4proto-uoban-tipo-conta")
        if tc:
            tc["options"] = ["Corrente", "Poupança", "Salário", "Pagamento"]
        # also update visibility rules that reference Conta corrente
        for r in ban.get("fieldVisibilityRules") or []:
            if r.get("expectedOptionText") == "Conta corrente":
                r["expectedOptionText"] = "Corrente"
            if r.get("expectedOptionText") == "Conta poupança":
                r["expectedOptionText"] = "Poupança"
            if r.get("expectedOptionText") == "Conta salário":
                r["expectedOptionText"] = "Salário"
        pix = field_by_id(ban["fields"], "patlasv4proto-uoban-tipo-chave-pix")
        if pix:
            pix["options"] = ["CPF", "CNPJ", "E-mail", "Celular", "Chave aleatória"]
            # Telefone → Celular for Sydle match; update rules if Telefone
            for r in ban.get("fieldVisibilityRules") or []:
                if r.get("expectedOptionText") == "Telefone":
                    r["expectedOptionText"] = "Celular"
        banco = field_by_id(ban["fields"], "patlasv4proto-uoban-nome-banco")
        if banco:
            banco["options"] = [
                "Itaú / 341",
                "Banco do Brasil / 001",
                "Bradesco / 237",
                "Caixa Econômica Federal / 104",
                "Santander / 033",
                "Nubank / 260",
                "Inter / 077",
                "Sicoob / 756",
                "Sicredi / 748",
                "Outro",
            ]

    # Migrate bank account preset values Conta corrente → Corrente etc.
    def migrate_bank_rows(rows):
        for row in rows or []:
            tc = row.get("patlasv4proto-uoban-tipo-conta")
            if tc == "Conta corrente":
                row["patlasv4proto-uoban-tipo-conta"] = "Corrente"
            elif tc == "Conta poupança":
                row["patlasv4proto-uoban-tipo-conta"] = "Poupança"
            elif tc == "Conta salário":
                row["patlasv4proto-uoban-tipo-conta"] = "Salário"
            tk = row.get("patlasv4proto-uoban-tipo-chave-pix")
            if tk == "Telefone":
                row["patlasv4proto-uoban-tipo-chave-pix"] = "Celular"
            b = row.get("patlasv4proto-uoban-nome-banco")
            mapping = {
                "Itaú Unibanco": "Itaú / 341",
                "Banco do Brasil": "Banco do Brasil / 001",
                "Bradesco": "Bradesco / 237",
                "Caixa Econômica Federal": "Caixa Econômica Federal / 104",
                "Santander": "Santander / 033",
                "Nubank": "Nubank / 260",
                "Inter": "Inter / 077",
                "Sicoob": "Sicoob / 756",
                "Sicredi": "Sicredi / 748",
            }
            if isinstance(b, str) and b in mapping:
                row["patlasv4proto-uoban-nome-banco"] = mapping[b]

    for p in org.get("exampleValuePresets") or []:
        emb = p.get("embeddedRowsByFieldId") or {}
        migrate_bank_rows(emb.get("patlasv4proto-uo-contas-bancarias"))

    # Doc execução: ensure Ativa label
    dex = next((f for f in forms if f["id"] == "form-patlasv4-proto-uo-doc-execucao"), None)
    if dex:
        for f in dex["fields"]:
            if f["id"] == "patlasv4proto-uodexec-ativo":
                f["label"] = "Ativa"
            if f["id"] == "patlasv4proto-uodexec-observacao":
                f["label"] = "Observações"
            if f["id"] == "patlasv4proto-uodexec-tipo":
                # screenshot shows LOGO
                opts = f.get("options") or []
                if "LOGO" not in opts and "Logo Marca" in opts:
                    pass
                if "LOGO" not in opts:
                    opts = list(opts) + ["LOGO"]
                    f["options"] = opts
            if f["id"] == "mr402bu2sr5m9a":
                f["hidden"] = True
                f["spec"] = "Campo legado oculto na tabela de documentos de execução."

    # --- Cargos atribuídos: tabela Cargo + Ocupante (detalhes em Visualizar) ---
    ocupante = next(
        (f for f in forms if f["id"] == "form-patlasv4-proto-cargo-ocupante"),
        None,
    )
    if ocupante:
        ocupante["defaultCanvasMode"] = "read"
        ocupante["metadata"] = (
            "Detalhes do ocupante exibidos ao clicar em Visualizar na tabela Cargos atribuídos."
        )
        for f in ocupante["fields"]:
            f["readOnly"] = True
        servidor = field_by_id(
            ocupante["fields"], "patlasv4proto-cargo-ocupantes-servidor"
        )
        if servidor:
            options = servidor.setdefault("options", [])
            bernardo = (
                "Bernardo Alves Bicalho Varges / bernardo.bicalho@elogroup.com.br"
            )
            if bernardo not in options:
                options.append(bernardo)
        if not field_by_id(
            ocupante["fields"], "patlasv4proto-cargo-ocupantes-matricula"
        ):
            servidor_idx = next(
                i
                for i, f in enumerate(ocupante["fields"])
                if f["id"] == "patlasv4proto-cargo-ocupantes-servidor"
            )
            ocupante["fields"].insert(
                servidor_idx + 1,
                {
                    "id": "patlasv4proto-cargo-ocupantes-matricula",
                    "label": "Matrícula",
                    "type": "text",
                    "size": "medium",
                    "readOnly": True,
                    "required": False,
                    "multiple": False,
                    "relevance": "common",
                    "spec": "Matrícula funcional do servidor ocupante.",
                },
            )

    cargo_atribuido = next(
        (f for f in forms if f["id"] == "form-patlasv4-proto-uo-cargo-atribuido"),
        None,
    )
    if cargo_atribuido:
        cargo = field_by_id(cargo_atribuido["fields"], "patlasv4proto-uoca-cargo")
        if cargo:
            cargo["label"] = "Cargo"
            cargo["readOnly"] = True
            options = cargo.setdefault("options", [])
            if "Gerente de Projetos / PM" not in options:
                options.append("Gerente de Projetos / PM")
        ocupante_field = {
            "id": "patlasv4proto-uoca-ocupante",
            "label": "Ocupante",
            "type": "embeddedReference",
            "size": "large",
            "readOnly": True,
            "required": False,
            "multiple": False,
            "relevance": "common",
            "linkedFormId": "form-patlasv4-proto-uo-cargo-ocupante-detalhe",
            "embeddedDisplay": "form",
            "spec": "Clique em Visualizar para abrir servidor, matrícula, condição, região, vigência e status.",
        }
        cargo_atribuido["fields"] = [
            cargo if cargo else cargo_atribuido["fields"][0],
            ocupante_field,
        ]
        cargo_atribuido["metadata"] = (
            "Espelho somente leitura com Cargo e Ocupante. "
            "Os dados do ocupante abrem em Visualizar."
        )

    # Converte as linhas existentes de cargos para o detalhe aninhado do Ocupante.
    for p in org.get("exampleValuePresets") or []:
        rows = (p.get("embeddedRowsByFieldId") or {}).get(
            "patlasv4proto-uo-cargos-atribuidos"
        )
        for index, row in enumerate(rows or []):
            if "patlasv4proto-uoca-ocupante" in row:
                continue
            servidor = row.get("patlasv4proto-uoca-pessoa-titular")
            detalhe = {
                "patlasv4proto-cargo-ocupantes-servidor": servidor,
                "patlasv4proto-cargo-ocupantes-matricula": (
                    "123" if index == 0 else str(124 + index)
                ),
                "patlasv4proto-cargo-ocupantes-condicao": row.get(
                    "patlasv4proto-uoca-condicao", "Titular"
                ),
                "patlasv4proto-cargo-ocupantes-regiao-atuacao": row.get(
                    "patlasv4proto-uoca-regiao"
                ),
                "patlasv4proto-cargo-ocupantes-data-de-inicio": row.get(
                    "patlasv4proto-uoca-data-inicio"
                ),
                "patlasv4proto-cargo-ocupantes-data-de-fim": row.get(
                    "patlasv4proto-uoca-data-fim"
                ),
                "patlasv4proto-cargo-ocupantes-ativo": row.get(
                    "patlasv4proto-uoca-ativo", True
                ),
            }
            cargo_value = row.get("patlasv4proto-uoca-cargo")
            row.clear()
            row["patlasv4proto-uoca-cargo"] = cargo_value
            row["patlasv4proto-uoca-ocupante"] = {
                "embeddedDemoInstances": [detalhe]
            }

    # Cenário ativo igual ao anexo: uma linha com Gerente de Projetos / PM.
    active_org = next(
        (
            p
            for p in org.get("exampleValuePresets") or []
            if p["id"] == org.get("activeExamplePresetId")
        ),
        None,
    )
    if active_org:
        active_org.setdefault("embeddedRowsByFieldId", {})[
            "patlasv4proto-uo-cargos-atribuidos"
        ] = [
            {
                "patlasv4proto-uoca-cargo": "Gerente de Projetos / PM",
                "patlasv4proto-uoca-ocupante": {
                    "embeddedDemoInstances": [
                        {
                            "patlasv4proto-cargo-ocupantes-servidor": (
                                "Bernardo Alves Bicalho Varges / "
                                "bernardo.bicalho@elogroup.com.br"
                            ),
                            "patlasv4proto-cargo-ocupantes-matricula": "123",
                            "patlasv4proto-cargo-ocupantes-condicao": "Titular",
                            "patlasv4proto-cargo-ocupantes-regiao-atuacao": None,
                            "patlasv4proto-cargo-ocupantes-data-de-inicio": None,
                            "patlasv4proto-cargo-ocupantes-data-de-fim": None,
                            "patlasv4proto-cargo-ocupantes-ativo": True,
                        }
                    ]
                },
            }
        ]

    # Metadata
    org["metadata"] = (
        "Protótipo Atlas — Organização alinhada à UI Sydle: Dados do Cadastro, Dados da Organização, "
        "Informações Adicionais (raiz / tipo / parcerias / poder), Habilitação (status, NDA, acesso comercial), "
        "Documentos de execução, Permissões, Tributos, Contato e Usuários."
    )

    # Also update portalClienteOrgData if it references bloqueado - optional, check later

    FORMS.write_text(json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # sanity
    org2 = next(f for f in forms if f["id"] == "form-patlasv4-proto-unidade-organizacional")
    ids = [f["id"] for f in org2["fields"]]
    assert "patlasv4proto-uo-nda-assinado" in ids
    assert "patlasv4proto-uo-observacoes" in ids
    assert "patlasv4proto-uo-acesso-comercial" in ids
    assert "patlasv4proto-uo-acesso-comercial-bloqueado" not in ids
    print("sections:", [(s["id"], s["title"]) for s in org2["sections"] if not s.get("parentSectionId")])
    print("ok fields", len(ids))


if __name__ == "__main__":
    main()
