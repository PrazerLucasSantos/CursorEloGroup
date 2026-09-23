# -*- coding: utf-8 -*-
"""Patch accents on the partnership flow (post-generate)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOWS = ROOT / "data/subprojects/atlas-prototipo/epics/prototipo/flows.json"

TITLE_MAP = {
    "0. Visao geral": "0. Visão geral",
    "0a. Glossario — vencimento x validacao dos anexos": "0a. Glossário — vencimento × validação dos anexos",
    "1. Criar organizacao raiz (Tipo=Parceiro, Empresa=Sim)": "1. Criar organização raiz (Tipo=Parceiro, Empresa=Sim)",
    "2. Completar dados minimos": "2. Completar dados mínimos",
    "4. Pre-cadastrar responsavel (CPF)": "4. Pré-cadastrar responsável (CPF)",
    "5a. Status da habilitacao \u2192 Em apresentacao": "5a. Status da habilitação → Em apresentação",
    "5b. Notificar responsavel (e-mail / link)": "5b. Notificar responsável (e-mail / link)",
    "7. Ha parecer de ajuste da MTI?": "7. Há parecer de ajuste da MTI?",
    "9a. Selecionar tipo exigido ainda sem anexo valido": "9a. Selecionar tipo exigido ainda sem anexo válido",
    "10b. Preencher Data de vencimento (origem = OCR automatico)": "10b. Preencher Data de vencimento (origem = OCR automático)",
    "10c. OCR falhou — parceiro informa a data (correcao OCR)": "10c. OCR falhou — parceiro informa a data (correção OCR)",
    "10d. Calcular vencimento pela recorrencia do Tipo": "10d. Calcular vencimento pela recorrência do Tipo",
    "11. A Data de vencimento ja passou?": "11. A Data de vencimento já passou?",
    "15. Enviar para analise": "15. Enviar para análise",
    "15a. Status da habilitacao \u2192 Completa – aguardando MTI": "15a. Status da habilitação → Completa – aguardando MTI",
    "16. Analisar dados do cadastro (visao geral)": "16. Analisar dados do cadastro (visão geral)",
    "17d. Ainda ha documento Pendente para analisar?": "17d. Ainda há documento Pendente para analisar?",
    "18. Decisao do CADASTRO (org inteira)": "18. Decisão do CADASTRO (org inteira)",
    "20a. Status da habilitacao \u2192 Aprovada pela MTI": "20a. Status da habilitação → Aprovada pela MTI",
    "20b. Status da habilitacao \u2192 Em apresentacao": "20b. Status da habilitação → Em apresentação",
    "21a. Notificar aprovacao": "21a. Notificar aprovação",
    "21c. Notificar reprovacao": "21c. Notificar reprovação",
    "23. Fim — Sem acesso ao servico": "23. Fim — Sem acesso ao serviço",
}

GLOSS = """
<div style="font-family:Segoe UI,Arial,sans-serif;max-width:940px;padding:8px 4px;color:#0f172a;line-height:1.55;font-size:14px">
  <h1 style="margin:0 0 10px;color:#004a8d;font-size:22px">Como funcionam documentos, vencimento e análise</h1>
  <p style="margin:0 0 12px;color:#475569">São <strong>duas coisas diferentes</strong>. Misturá-las causava a confusão no desenho anterior.</p>

  <h2 style="margin:18px 0 8px;font-size:16px">Campos do Tipo de Documento (catálogo)</h2>
  <ul style="margin:0 0 12px;padding-left:18px">
    <li><strong>Obrigatório para parceiro *</strong> — entra na grade do portal.</li>
    <li><strong>Obrigatório MTI *</strong> — exigido no back-office MTI.</li>
    <li><strong>Modo de vencimento *</strong> — Automático | Calculado | Manual.</li>
    <li><strong>Periodicidade *</strong> — Anual, Semestral, Trimestral ou Mensal (visível/obrigatória só se modo = Calculado).</li>
  </ul>

  <h2 style="margin:18px 0 8px;font-size:16px">1) Obter a DATA DE VENCIMENTO (sistema, no upload)</h2>
  <table style="border-collapse:collapse;width:100%;margin-bottom:12px;font-size:13px">
    <thead><tr style="background:#e2e8f0;text-align:left">
      <th style="padding:8px;border:1px solid #cbd5e1">Modo</th>
      <th style="padding:8px;border:1px solid #cbd5e1">Após o upload</th>
      <th style="padding:8px;border:1px solid #cbd5e1">Origem</th>
    </tr></thead>
    <tbody>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Automático</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">OCR lê a data. Se falhar, parceiro informa.</td>
        <td style="padding:8px;border:1px solid #cbd5e1">OCR (automático) ou Manual (correção OCR)</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Calculado</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Calcula pela Periodicidade (Anual/Semestral/Trimestral/Mensal).</td>
        <td style="padding:8px;border:1px solid #cbd5e1">Calculado (periodicidade)</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #cbd5e1"><strong>Manual</strong></td>
        <td style="padding:8px;border:1px solid #cbd5e1">Responsável informa a data (sem OCR nem cálculo).</td>
        <td style="padding:8px;border:1px solid #cbd5e1">Manual</td>
      </tr>
    </tbody>
  </table>
  <p style="margin:0 0 14px;padding:10px;background:#fff7ed;border-left:4px solid #ea580c">
    <strong>Importante:</strong> obter a data de vencimento <u>não aprova</u> o documento.
  </p>

  <h2 style="margin:18px 0 8px;font-size:16px">2) STATUS DE VALIDAÇÃO do documento</h2>
  <table style="border-collapse:collapse;width:100%;margin-bottom:12px;font-size:13px">
    <thead><tr style="background:#e2e8f0;text-align:left">
      <th style="padding:8px;border:1px solid #cbd5e1">Status</th>
      <th style="padding:8px;border:1px solid #cbd5e1">Quando</th>
      <th style="padding:8px;border:1px solid #cbd5e1">Quem</th>
    </tr></thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Pendente</strong></td><td style="padding:8px;border:1px solid #cbd5e1">Anexo + vencimento vigente.</td><td style="padding:8px;border:1px solid #cbd5e1">Sistema</td></tr>
      <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Vencido</strong></td><td style="padding:8px;border:1px solid #cbd5e1">Data &lt; hoje → reanexar.</td><td style="padding:8px;border:1px solid #cbd5e1">Sistema</td></tr>
      <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Aprovado</strong></td><td style="padding:8px;border:1px solid #cbd5e1">MTI aceita o anexo.</td><td style="padding:8px;border:1px solid #cbd5e1"><strong>MTI (F1)</strong></td></tr>
      <tr><td style="padding:8px;border:1px solid #cbd5e1"><strong>Recusado</strong></td><td style="padding:8px;border:1px solid #cbd5e1">MTI rejeita o anexo.</td><td style="padding:8px;border:1px solid #cbd5e1"><strong>MTI (F1)</strong></td></tr>
    </tbody>
  </table>
</div>
""".strip()


def main() -> None:
    data = json.loads(FLOWS.read_text(encoding="utf-8"))
    flow = next(f for f in data if f["id"] == "flow-proto-cadastro-parceria-portal")
    for s in flow["steps"]:
        t = s["title"]
        if t in TITLE_MAP:
            s["title"] = TITLE_MAP[t]
        # also try without special arrow variants
        for k, v in TITLE_MAP.items():
            if t.replace("→", "\u2192") == k or t == k:
                s["title"] = v
        if s["id"] == "step-proto-parc-glossario-docs":
            s["htmlContent"] = GLOSS
            s["title"] = "0a. Glossário — vencimento × validação dos anexos"
    FLOWS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched OK")


if __name__ == "__main__":
    main()
