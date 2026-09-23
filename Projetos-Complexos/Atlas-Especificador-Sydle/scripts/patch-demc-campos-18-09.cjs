/**
 * Patch Atlas Demanda Completa (demc) + portais demcli/dempar — 18/09
 * Authority: Luis 17/09 + discoveries (no invention).
 */
const fs = require("fs");
const path = require("path");

const SRC =
  "c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/espec-sydle-run/data/subprojects/atlas-prototipo/epics/prototipo/forms.json";
const DEST_SYNC =
  "c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/Projetos-Complexos/Atlas-Especificador-Sydle/data/subprojects/atlas-prototipo/epics/prototipo/forms.json";
const REPORT =
  "c:/Users/LucasSantos/OneDrive - EloGroup/Área de Trabalho/Cursor/espec-sydle-run/docs/conhecimento-atlas-demanda/01-analises-senior/demc-campos-ajustados-fontes-18-09.md";

const stats = {
  demc: { removedFields: [], removedSections: [], updatedSpecs: [], requiredFixed: [], presetsMigrated: 0, presetsKeysAdded: 0 },
  demcli: { removedFields: [], removedSections: [], updatedSpecs: [], requiredFixed: [] },
  dempar: { removedFields: [], removedSections: [], updatedSpecs: [], requiredFixed: [] },
};

function fieldBySuffix(form, prefix, suffix) {
  return form.fields.find((f) => f.id === `${prefix}${suffix}`);
}

function setSpec(form, prefix, suffix, spec, bucket) {
  const f = fieldBySuffix(form, prefix, suffix);
  if (!f) return false;
  f.spec = spec;
  bucket.updatedSpecs.push(`${prefix}${suffix}`);
  return true;
}

function setRequired(form, prefix, suffix, required, bucket) {
  const f = fieldBySuffix(form, prefix, suffix);
  if (!f) return false;
  if (f.required !== required) {
    f.required = required;
    bucket.requiredFixed.push(`${prefix}${suffix}=${required}`);
  }
  return true;
}

function removeIndefinidos(form, secId, prefix, bucket) {
  const before = form.fields.length;
  const removed = form.fields.filter((f) => f.sectionId === secId);
  form.fields = form.fields.filter((f) => f.sectionId !== secId);
  bucket.removedFields.push(...removed.map((f) => f.id));
  const secBefore = form.sections.length;
  form.sections = form.sections.filter((s) => s.id !== secId);
  if (form.sections.length < secBefore) bucket.removedSections.push(secId);
  return { fieldsRemoved: before - form.fields.length, sectionRemoved: form.sections.length < secBefore };
}

function patchSuporteBacklog(form, prefix, bucket) {
  const suporteSuffixes = [
    "suporte-24x7",
    "suporte-grupo",
    "suporte-profissionais",
    "suporte-criterio-distribuicao",
    "pos-venda",
  ];
  const backlogNote =
    "BACKLOG F3 — fora do tronco Consumo (call Luis 17/09). Campo mantido só para referência futura; não faz parte do fluxo Consumo desta fase.";

  const specs = {
    "suporte-24x7": `Função: Flag de atendimento 24×7 / sobreaviso (cenário Suporte).\nRegra: ${backlogNote} Visível apenas quando Tipo = Suporte.`,
    "suporte-grupo": `Função: Grupo(s) de apoio do atendimento de Suporte.\nRegra: ${backlogNote} Visível apenas quando Tipo = Suporte.`,
    "suporte-profissionais": `Função: Profissionais atribuídos por grupo (Suporte).\nRegra: ${backlogNote} Visível apenas quando Tipo = Suporte.`,
    "suporte-criterio-distribuicao": `Função: Critério de distribuição entre profissionais/grupos (Suporte).\nRegra: ${backlogNote} Visível apenas quando Tipo = Suporte.`,
    "pos-venda": `Função: Responsável de pós-venda (cenário Suporte).\nRegra: ${backlogNote} Visível apenas quando Tipo = Suporte.`,
  };

  const targetIds = [];
  for (const suf of suporteSuffixes) {
    const f = fieldBySuffix(form, prefix, suf);
    if (!f) continue;
    f.hidden = true;
    if (f.relevance === "highlight") f.relevance = "common";
    if (specs[suf]) {
      f.spec = specs[suf];
      bucket.updatedSpecs.push(f.id);
    }
    // Project schema uses fieldVisibilityRules; mirror intent as visibleWhen for clarity
    f.visibleWhen = {
      fieldId: `${prefix}tipo`,
      equals: "Suporte",
    };
    targetIds.push(f.id);
  }

  // Ensure / update visibility rule
  form.fieldVisibilityRules = form.fieldVisibilityRules || [];
  let rule = form.fieldVisibilityRules.find((r) => r.id === "rule-demc-f3-suporte-grupo" || (r.sourceFieldId === `${prefix}tipo` && r.expectedOptionText === "Suporte" && (r.targetFieldIds || []).some((id) => id.includes("suporte"))));
  if (!rule) {
    rule = {
      id: "rule-demc-f3-suporte-grupo",
      operator: "eq",
      sourceFieldId: `${prefix}tipo`,
      sourceKind: "textOptions",
      expectedOptionText: "Suporte",
      action: "show",
      targetFieldIds: targetIds,
    };
    form.fieldVisibilityRules.push(rule);
  } else {
    const set = new Set([...(rule.targetFieldIds || []), ...targetIds]);
    rule.targetFieldIds = [...set];
    rule.sourceFieldId = `${prefix}tipo`;
  }
}

function patchFilaSpecs(form, prefix, bucket) {
  setSpec(
    form,
    prefix,
    "fila-regra",
    "Função: Sistema deriva automaticamente a regra de roteamento da fila.\nRegra: Consumo → «Consumo · gerente + titular da parceria». Se parceiro notificado → «Parceiro notificado · fila parceria». Suporte → backlog F3 (fora do tronco Consumo). Somente leitura / não editável pelo analista.",
    bucket
  );
  const fila = fieldBySuffix(form, prefix, "fila-regra");
  if (fila) {
    fila.readOnly = true;
    fila.options = [
      "Consumo · gerente + titular da parceria",
      "Parceiro notificado · fila parceria",
      "Suporte · BACKLOG F3",
      "Aguardando definição",
    ];
  }

  setSpec(
    form,
    prefix,
    "resp-gerente",
    "Função: Gerente da parceria (papel da fila Consumo).\nRegra: Compõe a fila automática Consumo junto com o titular da parceria. Não confundir com gerente de área/operação.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "resp-titular",
    "Função: Responsável titular do atendimento/OS.\nRegra: Titular operacional da demanda na fila Consumo. Cadeia de cobertura: titular → substituto 1 → substituto 2 (gerente).",
    bucket
  );
  setSpec(
    form,
    prefix,
    "subst-1",
    "Função: Substituto 1 — qualquer pessoa da equipe (Luís, discovery 11/09).\nRegra: Entra na cadeia quando o titular está indisponível. Pode ser qualquer membro da equipe da parceria.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "subst-2",
    "Função: Substituto 2 — sempre o gerente da parceria (Luís, discovery 11/09).\nRegra: Último nível da cadeia de substituição; valor = gerente (mesmo papel de resp-gerente). Não é livre escolha do analista.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "indisponibilidade",
    "Função: Indisponibilidade / férias do responsável — dispara a cadeia titular → subst. 1 → subst. 2 (gerente).\nRegra: Campo mantido. Detalhe fino operacional (PRE3–PRE4) ainda aberto — não inventar regras além da cadeia confirmada.",
    bucket
  );
}

function patchAberturaSpecs(form, prefix, bucket) {
  setRequired(form, prefix, "descricao", true, bucket);
  setRequired(form, prefix, "produto", false, bucket);
  setRequired(form, prefix, "ref-contrato", false, bucket);
  setRequired(form, prefix, "tipo", true, bucket);

  setSpec(
    form,
    prefix,
    "descricao",
    "Função: Descrição da necessidade do solicitante.\nRegra: Único campo obrigatório na abertura (Luis 17/09). Sem descrição o mínimo de abertura não é atendido. Contrato e solução são opcionais; MTI qualifica depois.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "produto",
    "Função: Solução/produto ao qual a necessidade se refere.\nRegra: Opcional na abertura (Luis 17/09). MTI qualifica/requalifica produto e parceiro. Não bloqueia abertura se vazio.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "ref-contrato",
    "Função: Contrato(s) vinculados à demanda (quando houver cobertura).\nRegra: Opcional na abertura (Luis 17/09). MTI pode qualificar depois. Faturamento (#03) exige contrato registrado com saldo — independente da obrigatoriedade de OS.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "tipo",
    "Função: Tipo da demanda: Consumo ou Suporte.\nRegra: Obrigatório. Consumo = tronco F3 (fluxo desta fase). Suporte = BACKLOG F3 / fora do tronco Consumo (call Luis 17/09). Opção Suporte permanece no formulário só para referência; não desenvolver rito de suporte nesta fase.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "contrato-natureza",
    "Função: Natureza da cobertura do atendimento (próprio / patrocinado / sem contrato).\nRegra: Opcional na abertura junto com o contrato. Distinto da natureza imutável serviço ≠ licenciamento/SN (tipo na análise). Patrocinado e próprio seguem trilhas comerciais distintas após qualificação MTI.",
    bucket
  );
}

function patchTipoAnaliseAndOsProjeto(form, prefix, bucket) {
  setSpec(
    form,
    prefix,
    "tipo-analise",
    "Função: Natureza da análise: licenciamento ou serviço (derivação/automação).\nRegra: Natureza do contrato/serviço é imutável — serviço (UST/HST) ≠ licenciamento/SN; aditivo não troca a métrica (Luis 17/09). Condicional; altera campos exigidos (comprovação × prazo/OS).",
    bucket
  );

  setSpec(
    form,
    prefix,
    "ref-oses-operacional",
    "Função: OS vinculada(s) operacionalmente à demanda (classe satélite).\nRegra: Modelar OS Global × Dedicada no vínculo/produto (Luis 17/09). Faturamento (#03): não exige OS — condição é contrato registrado com saldo; sem saldo → valores a reaver. OS permanece instrumento operacional típico do tronco feliz pós-autorização.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "ref-oses",
    "Função: Ordens de serviço vinculadas (consulta).\nRegra: Atalho às OS da demanda. Tipos operacionais incluem Global × Dedicada. Faturamento (#03) = contrato + saldo, não obrigatoriedade de OS.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "orc-numero",
    "Função: Identificador do orçamento relacionado à demanda.\nRegra: Caminho sem cobertura direta / sob demanda. Após aceite, pode gerar/vincular OS (Global ou Dedicada). Faturamento (#03) segue contrato+saldo.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "detalhamento-orcamento",
    "Função: Detalhamento da proposta orçamentária.\nRegra: Base para decisão do cliente e eventual geração de OS. Faturamento (#03): cobrança condicionada a contrato com saldo, não à existência da OS.",
    bucket
  );
  setSpec(
    form,
    prefix,
    "forma-pagamento",
    "Função: Forma de pagamento / viabilização quando sem cobertura adequada.\nRegra: Visível em cenário sem contrato. Faturamento (#03) no tronco contratado = contrato registrado com saldo.",
    bucket
  );

  // Projeto section
  const projetoSpecs = {
    projeto:
      "Função: Projeto relacionado quando o serviço tem estrutura de projeto.\nRegra: Opcional — serviço avulso sem projeto é OK (Luis). Nesta fase só dilatação de prazo; ajuste de escopo → nova demanda (futuro: OS vinculável ao mesmo projeto).",
    epicos:
      "Função: Épicos do projeto relacionado.\nRegra: Condicional a serviço com projeto (projeto opcional). Detalhe de integração pendente.",
    historias:
      "Função: Histórias do projeto relacionado.\nRegra: Condicional a serviço com projeto (projeto opcional).",
    "qtd-historias":
      "Função: Quantidade de histórias.\nRegra: Indicador informativo quando há projeto.",
    sprints:
      "Função: Sprints do projeto.\nRegra: Condicional a serviço com projeto (projeto opcional).",
    atividades:
      "Função: Atividades de projeto/execução.\nRegra: Condicional. Pode sobrepor-se a atividades da entrega.",
    "quantitativos-servicos":
      "Função: Quantitativos de serviços do projeto.\nRegra: Condicional quando há projeto. Apoia medição.",
    "status-andamento-exec":
      "Função: Status do andamento da execução/projeto.\nRegra: Condicional à execução; projeto permanece opcional (avulso OK).",
    "pct-execucao-projeto":
      "Função: Percentual de execução do projeto.\nRegra: Condicional quando há projeto. Fonte/fórmula a confirmar.",
    "prazos-previsao":
      "Função: Prazos e previsão de conclusão.\nRegra: Condicional. Nesta fase a mudança de prazo suportada é dilatação; escopo adicional → nova demanda.",
  };
  for (const [suf, spec] of Object.entries(projetoSpecs)) {
    setSpec(form, prefix, suf, spec, bucket);
  }
}

function removeNivelSolicitante(form, prefix, bucket) {
  const id = `${prefix}nivel-solicitante`;
  const before = form.fields.length;
  form.fields = form.fields.filter((f) => f.id !== id);
  if (form.fields.length < before) bucket.removedFields.push(id);
  // scrub presets
  for (const pr of form.exampleValuePresets || []) {
    if (pr.fieldValues && pr.fieldValues[id] !== undefined) delete pr.fieldValues[id];
  }
}

function migratePresets(form) {
  const demcIds = new Set(form.fields.map((f) => f.id));
  let presetsTouched = 0;
  let keysAdded = 0;

  for (const pr of form.exampleValuePresets || []) {
    const fv = pr.fieldValues || (pr.fieldValues = {});
    let touched = false;
    const additions = {};

    for (const [key, val] of Object.entries(fv)) {
      if (!key.startsWith("patlasv4proto-demanda-")) continue;
      const suffix = key.slice("patlasv4proto-demanda-".length);
      const demcKey = `patlasv4proto-demc-${suffix}`;
      if (!demcIds.has(demcKey)) continue;
      if (fv[demcKey] === undefined) {
        additions[demcKey] = val;
        keysAdded++;
        touched = true;
      }
    }

    Object.assign(fv, additions);

    // Consumo scenarios: force fila-regra + subst-2 = gerente
    const tipo =
      fv["patlasv4proto-demc-tipo"] || fv["patlasv4proto-demanda-tipo"];
    const gerente =
      fv["patlasv4proto-demc-resp-gerente"] ||
      fv["patlasv4proto-demanda-resp-gerente"];

    if (tipo === "Consumo" || (!tipo && (fv["patlasv4proto-demc-fila-regra"] || fv["patlasv4proto-demanda-fila-regra"] || "").toString().includes("Consumo"))) {
      const desiredFila = "Consumo · gerente + titular da parceria";
      if (fv["patlasv4proto-demc-fila-regra"] !== desiredFila) {
        fv["patlasv4proto-demc-fila-regra"] = desiredFila;
        touched = true;
        if (!additions["patlasv4proto-demc-fila-regra"] && fv["patlasv4proto-demanda-fila-regra"] === undefined) keysAdded++;
      }
      // also keep old key consistent if present
      if (fv["patlasv4proto-demanda-fila-regra"] !== undefined) {
        fv["patlasv4proto-demanda-fila-regra"] = desiredFila;
      }
      if (gerente) {
        if (fv["patlasv4proto-demc-subst-2"] !== gerente) {
          fv["patlasv4proto-demc-subst-2"] = gerente;
          touched = true;
        }
        if (fv["patlasv4proto-demanda-subst-2"] !== undefined) {
          fv["patlasv4proto-demanda-subst-2"] = gerente;
        }
      }
    }

    // Suporte scenarios: fila backlog wording
    if (tipo === "Suporte") {
      const desired = "Suporte · BACKLOG F3";
      if (fv["patlasv4proto-demc-fila-regra"] !== desired) {
        fv["patlasv4proto-demc-fila-regra"] = desired;
        touched = true;
      }
      if (fv["patlasv4proto-demanda-fila-regra"] !== undefined) {
        fv["patlasv4proto-demanda-fila-regra"] = desired;
      }
    }

    if (touched) presetsTouched++;
  }

  stats.demc.presetsMigrated = presetsTouched;
  stats.demc.presetsKeysAdded = keysAdded;
}

function patchPortalForm(form, prefix, secIndef, bucket) {
  removeIndefinidos(form, secIndef, prefix, bucket);
  removeNivelSolicitante(form, prefix, bucket);
  patchSuporteBacklog(form, prefix, bucket);
  patchFilaSpecs(form, prefix, bucket);
  patchAberturaSpecs(form, prefix, bucket);
  patchTipoAnaliseAndOsProjeto(form, prefix, bucket);
}

function patchDemc(form) {
  const prefix = "patlasv4proto-demc-";
  const bucket = stats.demc;
  removeIndefinidos(form, "sec-demc-indefinidos", prefix, bucket);
  removeNivelSolicitante(form, prefix, bucket);
  patchSuporteBacklog(form, prefix, bucket);
  patchFilaSpecs(form, prefix, bucket);
  patchAberturaSpecs(form, prefix, bucket);
  patchTipoAnaliseAndOsProjeto(form, prefix, bucket);
  migratePresets(form);

  // OS satélite: mention Global/Dedicada + #03 if form exists in same array (handled separately)
}

function patchOsSatellite(data) {
  const os = data.find((f) => f.id === "form-patlasv4-proto-demc-os");
  if (!os) return { updated: 0 };
  let updated = 0;
  const tipo = os.fields.find((f) => f.id === "patlasv4proto-demc-os-tipo");
  if (tipo) {
    // Keep existing vínculo options; extend label/spec with Global×Dedicada model
    tipo.spec =
      "Função: Tipo de vínculo da OS (via contrato / orçamento / existente / digital) e modelo Global × Dedicada (Luis 17/09 — modelar em OS e no produto).\nRegra: CD-072 / PD12. Faturamento (#03): OS não é pré-condição de cobrança — exige contrato registrado com saldo.";
    // Add Global/Dedicada as additional options if not present — user said mention if field exists; safer to add complementary options
    const extras = ["OS Global", "OS Dedicada"];
    tipo.options = tipo.options || [];
    for (const o of extras) {
      if (!tipo.options.includes(o)) tipo.options.push(o);
    }
    updated++;
  }
  const saldo = os.fields.find((f) => f.id === "patlasv4proto-demc-os-saldo");
  if (saldo) {
    saldo.spec =
      "Função: Saldo da OS (disponibilidade operacional).\nRegra: CD-076 / PD16. Distinto do saldo contratual usado no faturamento (#03: contrato + saldo).";
    updated++;
  }
  const contrato = os.fields.find((f) => f.id === "patlasv4proto-demc-os-contrato");
  if (contrato) {
    contrato.spec =
      "Função: Contrato da Demanda que limita a vigência da OS.\nRegra: Vigência OS ≤ contrato. Faturamento (#03) usa este contrato + saldo contratual — OS não é obrigatória para faturar.";
    updated++;
  }
  return { updated };
}

function writeReport(osStats) {
  const lines = [];
  lines.push("# Ajuste campos Demanda Completa (demc) — fontes 18/09");
  lines.push("");
  lines.push("**Form:** `form-patlasv4-proto-demanda-completa` (prefixo `patlasv4proto-demc-`)");
  lines.push("**Autoridade:** Luis 17/09 + discoveries (sem invenção).");
  lines.push("**Backup pré-patch:** `demc-campos-backup-pre-ajuste-18-09.md`");
  lines.push("");
  lines.push("## Removidos (demc)");
  lines.push("");
  lines.push("### Seção");
  for (const s of stats.demc.removedSections) lines.push(`- \`${s}\``);
  lines.push("");
  lines.push("### Campos");
  for (const id of stats.demc.removedFields) lines.push(`- \`${id}\``);
  lines.push("");
  lines.push("Inclui `nivel-solicitante` (risco de confusão com N2 catálogo; não usado em presets) e todos os campos de `sec-demc-indefinidos`.");
  lines.push("");
  lines.push("## Required flags");
  for (const x of stats.demc.requiredFixed) lines.push(`- ${x}`);
  lines.push("- `descricao` = true (já estava)");
  lines.push("- `tipo` = true (já estava)");
  lines.push("- `produto` / `ref-contrato` → false");
  lines.push("");
  lines.push("## Specs reescritas (demc) — destaques");
  lines.push("");
  lines.push("| Campo | Mudança |");
  lines.push("|---|---|");
  lines.push("| `tipo` | Consumo = tronco F3; Suporte = BACKLOG F3 |");
  lines.push("| `descricao` / `produto` / `ref-contrato` | Abertura: só descrição obrigatória; MTI qualifica |");
  lines.push("| `contrato-natureza` | Opcional na abertura; distinto de serviço≠SN |");
  lines.push("| `tipo-analise` | Natureza imutável serviço ≠ licenciamento/SN |");
  lines.push("| `fila-regra` | Derivação automática; Suporte → backlog |");
  lines.push("| `resp-gerente` / `resp-titular` / `subst-1` / `subst-2` | Fila Consumo; subst2 = sempre gerente (Luís) |");
  lines.push("| `indisponibilidade` | Cadeia titular→s1→s2; PRE3–PRE4 aberto |");
  lines.push("| suporte-* / `pos-venda` | visibleWhen Tipo=Suporte + BACKLOG F3; sem highlight |");
  lines.push("| OS / orçamento | Global×Dedicada + faturamento #03 contrato+saldo |");
  lines.push("| projeto | Opcional (avulso OK); só dilatação nesta fase |");
  lines.push("");
  lines.push(`Specs atualizadas (contagem demc): **${stats.demc.updatedSpecs.length}**`);
  lines.push("");
  lines.push("## Presets");
  lines.push(`- Presets tocados: **${stats.demc.presetsMigrated}**`);
  lines.push(`- Chaves \`demc-*\` adicionadas a partir de \`demanda-*\`: **${stats.demc.presetsKeysAdded}**`);
  lines.push("- Consumo: `fila-regra` = «Consumo · gerente + titular da parceria»; `subst-2` = nome do gerente");
  lines.push("");
  lines.push("## Portais (mesma filosofia)");
  lines.push("");
  lines.push("### demcli");
  lines.push(`- Removidos: ${stats.demcli.removedFields.length} campos; seções: ${stats.demcli.removedSections.join(", ") || "—"}`);
  lines.push(`- Specs: ${stats.demcli.updatedSpecs.length}; required: ${stats.demcli.requiredFixed.join(", ") || "—"}`);
  lines.push("");
  lines.push("### dempar");
  lines.push(`- Removidos: ${stats.dempar.removedFields.length} campos; seções: ${stats.dempar.removedSections.join(", ") || "—"}`);
  lines.push(`- Specs: ${stats.dempar.updatedSpecs.length}; required: ${stats.dempar.requiredFixed.join(", ") || "—"}`);
  lines.push("");
  lines.push("## OS satélite");
  lines.push(`- Specs/options atualizados: **${osStats.updated}** (Global/Dedicada + #03)`);
  lines.push("");
  lines.push("## Itens ainda abertos (não inventar)");
  lines.push("- **PRE3–PRE4:** detalhe fino de indisponibilidade/férias / cadeia de substitutos");
  lines.push("- **HCMX:** medição paralela / cruzamento PV (fase/alfa)");
  lines.push("- Suporte: rito completo permanece backlog F3");
  lines.push("");
  lines.push("## Sync");
  lines.push(`- Cópia espelhada em Projetos-Complexos/.../forms.json`);
  fs.writeFileSync(REPORT, lines.join("\n"), "utf8");
}

function main() {
  const raw = fs.readFileSync(SRC, "utf8");
  const data = JSON.parse(raw);

  const demc = data.find((f) => f.id === "form-patlasv4-proto-demanda-completa");
  const demcli = data.find((f) => f.id === "form-patlasv4-proto-demanda-portal-cliente");
  const dempar = data.find((f) => f.id === "form-patlasv4-proto-demanda-portal-parceiro");
  if (!demc) throw new Error("demc form not found");

  patchDemc(demc);
  if (demcli) patchPortalForm(demcli, "patlasv4proto-demcli-", "sec-demcli-indefinidos", stats.demcli);
  if (dempar) patchPortalForm(dempar, "patlasv4proto-dempar-", "sec-dempar-indefinidos", stats.dempar);

  const osStats = patchOsSatellite(data);

  const out = JSON.stringify(data, null, 2) + "\n";
  // validate
  JSON.parse(out);

  fs.writeFileSync(SRC, out, "utf8");
  fs.mkdirSync(path.dirname(DEST_SYNC), { recursive: true });
  fs.writeFileSync(DEST_SYNC, out, "utf8");
  writeReport(osStats);

  // post-validate counts
  const re = JSON.parse(fs.readFileSync(SRC, "utf8"));
  const f = re.find((x) => x.id === "form-patlasv4-proto-demanda-completa");
  const summary = {
    demcFields: f.fields.length,
    demcSections: f.sections.length,
    hasIndefSection: f.sections.some((s) => s.id === "sec-demc-indefinidos"),
    produtoRequired: fieldBySuffix(f, "patlasv4proto-demc-", "produto").required,
    descricaoRequired: fieldBySuffix(f, "patlasv4proto-demc-", "descricao").required,
    nivelGone: !f.fields.some((x) => x.id.endsWith("nivel-solicitante")),
    presets: (f.exampleValuePresets || []).length,
    stats,
    osStats,
  };
  console.log(JSON.stringify(summary, null, 2));
}

main();
