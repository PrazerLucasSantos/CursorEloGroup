# -*- coding: utf-8 -*-
"""Replace Opção 1/2/3 placeholders with real domain examples in forms.json."""
from __future__ import annotations

import json
import re
from pathlib import Path

FALLBACK_BY_LINKED = {
    "form-patlasv4-proto-cat-metrica": ["USN", "UST", "HST", "UST-IA"],
    "form-patlasv4-proto-cat-tipo-cobranca": [
        "Sob Demanda",
        "Mensal",
        "Anual",
        "Homologação",
        "Pro-Rata",
    ],
    "form-patlasv4-proto-cat-categoria": [
        "Cloud / Infra",
        "Desenvolvimento",
        "Segurança",
        "Suporte",
    ],
    "form-patlasv4-proto-cat-grupo": [
        "MTI Host",
        "MTI Simplifica",
        "MTI CLOUD",
        "MTI Autonomy",
    ],
    "form-patlasv4-proto-cat-modelo-venda": [
        "Por Licença",
        "Serviço",
        "Homologação",
        "Assinatura",
    ],
    "form-patlasv4-proto-cat-parceria": ["MTI SIMPLIFICA", "MTI HOST", "MTI CLOUD"],
    "form-patlasv4-proto-cat-solucao": [
        "MTI Simplifica — Desburocratização",
        "MTI CLOUD — Serviços em nuvem",
        "MTI Autonomy — Robotização",
    ],
    "form-patlasv4-proto-cat-produto": [
        "Licença MTI Simplifica — pacote anual",
        "Serviço de implantação Cloud",
        "Suporte Premium 24x7",
        "Treinamento operacional",
    ],
    "form-patlasv4-proto-cat-catalogo": [
        "MTI HOST",
        "MTI SIMPLIFICA",
        "MTI CLOUD — Serviços",
        "MTI Autonomy — Licenças",
    ],
    "form-patlasv4-proto-cat-universal": ["Catálogo Universal MTI"],
    "form-patlasv4-proto-cat-grupo-atendimento": [
        "UG-DTIC",
        "GO-Vendas",
        "GO-Pós-vendas",
    ],
    "form-patlasv4-proto-unidade-organizacional": [
        "Empresa Mato-grossense de Tecnologia da Informação",
        "EloGroup Consultoria e Treinamento LTDA",
        "Secretaria de Estado de Planejamento e Gestão",
    ],
    "form-patlasv4-proto-pessoa": [
        "Ana Paula Souza",
        "Carlos Eduardo Lima",
        "Ricardo Almeida Ferreira",
        "Mariana Costa",
    ],
    "form-patlasv4-proto-processos": [
        "Demanda #2026-1187",
        "Proposta CSPS",
        "OS-2026-0042",
    ],
    "form-patlasv4-proto-grupo-documento": [
        "Habilitação Jurídica",
        "Qualificação Técnica",
        "Qualificação Econômica e Financeira",
        "Compliance (adendo)",
        "Pré-rito parceria",
        "Documentos de execução",
    ],
    "form-patlasv4-proto-modelo-contrato": [
        "Padrão MTI",
        "Parceria EloGroup",
        "Cliente SEPLAG",
    ],
}

FALLBACK_BY_FIELD_ID = {
    "patlasv4proto-processos-proposta-itens-da-proposta": [
        "Licença MTI Simplifica — pacote anual",
        "Serviço de implantação Cloud",
        "Suporte Premium 24x7",
    ],
    "patlasv4proto-processos-workflow-assinaturas-responsaveis-aptos": [
        "Gestor de Contratos",
        "Analista DIRC",
        "Analista DTIC",
        "Diretor de Tecnologia",
    ],
    "patlasv4proto-processos-produtos-e-servicos-tipo-do-item": ["Licença", "Serviço"],
    "patlasv4proto-processos-produtos-e-servicos-metrica": ["USN", "UST", "HST"],
    "patlasv4proto-processos-ordem-de-servico-tipo-de-os": [
        "Serviço (com orçamento prévio)",
        "Licença (orçamento dispensável)",
        "Suporte",
        "Implantação",
    ],
    "patlasv4proto-processos-historico-acao-realizada": [
        "Criou demanda",
        "Enviou proposta",
        "Aprovou orçamento",
        "Recusou com motivo",
        "Autorizou OS",
        "Assinou contrato",
    ],
    "patlasv4proto-uo-substituida": [
        "Nenhuma (unidade ativa)",
        "UO-DTIC (substituta)",
        "UO-DIRC (substituta)",
    ],
}

FALLBACK_BY_LABEL = {
    "métrica": ["USN", "UST", "HST"],
    "metrica": ["USN", "UST", "HST"],
    "tipo do item": ["Licença", "Serviço"],
    "tipo de os": [
        "Serviço (com orçamento prévio)",
        "Licença (orçamento dispensável)",
    ],
    "cobrança": ["Sob Demanda", "Mensal", "Anual"],
    "cobranca": ["Sob Demanda", "Mensal", "Anual"],
    "grupo": ["MTI Host", "MTI Simplifica", "MTI CLOUD"],
    "categoria": ["Cloud / Infra", "Desenvolvimento", "Segurança"],
    "modelo de venda": ["Por Licença", "Serviço", "Homologação"],
    "parceria": ["MTI SIMPLIFICA", "MTI HOST", "MTI CLOUD"],
    "solução": [
        "MTI Simplifica — Desburocratização",
        "MTI CLOUD — Serviços em nuvem",
    ],
    "solucao": [
        "MTI Simplifica — Desburocratização",
        "MTI CLOUD — Serviços em nuvem",
    ],
    "catálogo": ["MTI HOST", "MTI SIMPLIFICA", "MTI CLOUD — Serviços"],
    "catalogo": ["MTI HOST", "MTI SIMPLIFICA", "MTI CLOUD — Serviços"],
    "produto": [
        "Licença MTI Simplifica — pacote anual",
        "Serviço de implantação Cloud",
    ],
    "parceiro": [
        "EloGroup Consultoria e Treinamento LTDA",
        "Empresa Mato-grossense de Tecnologia da Informação",
    ],
    "focal": ["Ana Paula Souza", "Carlos Eduardo Lima"],
    "unidade dtic": ["DTIC — Diretoria de Tecnologia", "DIRC — Diretoria Comercial"],
    "responsáveis aptos": [
        "Gestor de Contratos",
        "Analista DIRC",
        "Analista DTIC",
    ],
    "acao realizada": [
        "Criou demanda",
        "Aprovou orçamento",
        "Autorizou OS",
    ],
    "ação realizada": [
        "Criou demanda",
        "Aprovou orçamento",
        "Autorizou OS",
    ],
    "itens da proposta": [
        "Licença MTI Simplifica — pacote anual",
        "Serviço de implantação Cloud",
    ],
}


def is_placeholder(o: object) -> bool:
    return isinstance(o, str) and bool(
        re.match(r"^Op[cç][ãa]o\s*\d+$", o.strip(), re.I)
    )


def identity_samples(form: dict) -> list[str]:
    ident = next(
        (x for x in form.get("fields", []) if x.get("relevance") == "identity"),
        None,
    )
    if not ident:
        return []
    iid = ident["id"]
    vals: list[str] = []
    for preset in form.get("exampleValuePresets") or []:
        if not isinstance(preset, dict):
            continue
        for key in ("values", "fieldValues", "demoValues", "data"):
            rows = preset.get(key)
            if isinstance(rows, dict) and isinstance(rows.get(iid), str) and rows[iid].strip():
                vals.append(rows[iid].strip())
            elif isinstance(rows, list):
                for row in rows:
                    if isinstance(row, dict) and isinstance(row.get(iid), str) and row[iid].strip():
                        vals.append(row[iid].strip())
        if isinstance(preset.get(iid), str) and preset[iid].strip():
            vals.append(preset[iid].strip())
    return list(dict.fromkeys(vals))


def resolve_options(field: dict, linked_map: dict[str, list[str]]) -> list[str] | None:
    fid = field.get("id") or ""
    if fid in FALLBACK_BY_FIELD_ID:
        return FALLBACK_BY_FIELD_ID[fid]
    linked = field.get("linkedFormId") or field.get("referenceFormId")
    if linked and linked in linked_map and linked_map[linked]:
        return linked_map[linked]
    if linked and linked in FALLBACK_BY_LINKED:
        return FALLBACK_BY_LINKED[linked]
    label = (field.get("label") or "").strip().lower()
    for key, opts in FALLBACK_BY_LABEL.items():
        if key in label:
            return opts
    opts = field.get("options") or []
    if opts and not any(is_placeholder(o) for o in opts):
        return opts
    return None


def fix_value_maps(obj: object, fopts: dict[str, list], linked_map: dict, form: dict) -> int:
    updated = 0
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            if is_placeholder(v):
                choices = fopts.get(k) or FALLBACK_BY_FIELD_ID.get(k) or []
                if choices and not is_placeholder(choices[0]):
                    obj[k] = choices[0]
                    updated += 1
                else:
                    fld = next((f for f in form.get("fields", []) if f.get("id") == k), None)
                    resolved = resolve_options(fld, linked_map) if fld else None
                    if resolved:
                        obj[k] = resolved[0]
                        updated += 1
            else:
                updated += fix_value_maps(v, fopts, linked_map, form)
    elif isinstance(obj, list):
        for item in obj:
            updated += fix_value_maps(item, fopts, linked_map, form)
    return updated


def process(path: Path) -> None:
    forms = json.loads(path.read_text(encoding="utf-8"))
    linked_map: dict[str, list[str]] = {}
    for form in forms:
        samples = identity_samples(form)
        if samples:
            linked_map[form["id"]] = samples
        elif form["id"] in FALLBACK_BY_LINKED:
            linked_map[form["id"]] = FALLBACK_BY_LINKED[form["id"]]

    fields_updated = 0
    values_updated = 0
    typos = 0

    for form in forms:
        for field in form.get("fields", []):
            opts = field.get("options")
            if isinstance(opts, list):
                new_opts = []
                changed = False
                for o in opts:
                    if o == "Aprodao":
                        new_opts.append("Homologado")
                        changed = True
                        typos += 1
                    else:
                        new_opts.append(o)
                if changed:
                    field["options"] = new_opts
                    opts = new_opts

            t = field.get("type")
            need = False
            if t in ("reference", "referenceMultiple") and (
                not opts or any(is_placeholder(o) for o in (opts or []))
            ):
                need = True
            if t == "textOptions" and (
                not opts or any(is_placeholder(o) for o in (opts or []))
            ):
                need = True
            if need:
                resolved = resolve_options(field, linked_map)
                if resolved:
                    field["options"] = resolved
                    fields_updated += 1

        fopts = {
            f["id"]: f.get("options") or []
            for f in form.get("fields", [])
            if f.get("id")
        }
        values_updated += fix_value_maps(form, fopts, linked_map, form)

    path.write_text(
        json.dumps(forms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"{path}: fields_updated={fields_updated}, values_updated={values_updated}, typos={typos}"
    )


def main() -> None:
    roots = [
        Path("data/subprojects/atlas-prototipo/epics/prototipo/forms.json"),
        Path("data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json"),
    ]
    for p in roots:
        if p.exists():
            process(p)
        else:
            print("missing", p)


if __name__ == "__main__":
    main()
