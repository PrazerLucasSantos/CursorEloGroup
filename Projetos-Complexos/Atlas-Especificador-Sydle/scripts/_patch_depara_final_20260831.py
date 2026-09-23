# -*- coding: utf-8 -*-
import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "exports" / "de-para-planilhas-prototipo-final-20260831.html"
content = path.read_text(encoding="utf-8")

t1 = [
  ["Código Siag", "Produto", "#CÓDIGO SIAG - ITEM", "Importa e edita", "F2: somente códigos ERP importáveis (Luís 31/08). N1 = item. Parceiro não visualiza."],
  ["Código Protheus/Infocenter", "Produto", "?CÓDIGO PROTEUS - ITEM", "Importa e edita", "Código item Protheus/Infocenter. ≠ Código Atlas. Parceiro não visualiza."],
  ["Código Atlas", "Produto", "Código Atlas", "Só visualização (gerado)", "Gerado no Atlas (prefixo/sigla Parceria + sequencial). Não importa da planilha."],
  ["Vertical Atuação", "Parceria", "#Vertical de serviço de TI", "Só cadastra no Atlas", "Pertence à Parceria (não ao parceiro/empresa). Exibir no Catálogo RO; MTI cadastra."],
  ["Descrição Produto", "Produto", "!Nome do produto (item de catálogo)", "Só cadastra no Atlas", "Item de catálogo — parceiro preenche col. C. Dado nasce no Atlas (não import ERP)."],
  ["Classe: Solução*", "Solução", "#Nome → vínculo Catálogo/Produto", "Só cadastra no Atlas", "MTI/sistema vincula; seleção de N soluções. Não importação ERP."],
  ["Classe: Métrica*", "Métrica", "Nome → Produto.!Métrica", "Só cadastra no Atlas", "Cadastrar UST/HST/USN etc. antes; disponibilizar no catálogo."],
  ["Classe: Tipo Cobrança*", "Tipo de Cobrança", "Nome → Produto.!Tipo de cobrança", "Só cadastra no Atlas", "Recorrência mensal/anual etc. Cadastro Atlas."],
  ["Preço de Venda", "Produto", "!#Valor unitário", "Só cadastra no Atlas", "Parceiro vê valor unitário do item (não preço final pós-rateio). Calculado: custo (parceiro) × markup (MTI)."],
  ["Fator de Conversão - FC (valor moeda universal)", "Produto", "Valor da moeda universal", "Só cadastra no Atlas", "Entra no Atlas na classe Produto, condicional catálogo Universal. Fator de conversão de consumo = Fase 3."],
  ["FOCAL Vendas", "Catálogo", "#FOCAL Vendas", "Só cadastra no Atlas", "Catálogo de parceria. MTI informa; parceiro só visualiza."],
  ["FOCAL Pós Vendas", "Catálogo", "#FOCAL Pós-vendas", "Só cadastra no Atlas", "Catálogo de parceria. MTI informa; parceiro só visualiza."],
  ["Unidade DTIC*", "Catálogo", "#Unidade DTIC", "Só cadastra no Atlas", "Catálogo de parceria. MTI informa; parceiro só visualiza."],
  ["Parceiro", "Parceria", "#Parceiro (organização)", "Só cadastra no Atlas", "Nome/referência da parceira na Parceria; parceiro visualiza vínculo."],
  ["Grupo Produto", "Fora do Atlas / Proteus", "Grupo ERP (grupo 32…)", "Fora Fase 2", "Grupo 32 padrão Protheus excluído desta fase. Usar Grupo comercial Atlas."],
  ["Código Produto", "Produto", "?CÓDIGO PROTEUS - ITEM", "Importa e edita", "Repetido na planilha por integração. Importável (código). Parceiro não vê."],
  ["Código Parceiro", "Parceria", "Código da parceira", "Importa e edita", "Classe Parceria (código + nome). Editável pós-importação somente administrador."],
  ["% Parceiro", "Dados de Parceria por Produto", "Distribuição do parceiro", "Herdado / só visualização", "Calculado automaticamente (custo+markup). Parceiro visualiza nos próprios produtos; não edita."],
  ["Parceria", "Parceria", "Indicador parceria (Sim/Não)", "Só cadastra no Atlas", "Necessário: catálogos/produtos exclusivos MTI = parceria Não."],
  ["Local padrão", "Fora do Atlas / Proteus", "—", "Fora Fase 2", "Não importar, cadastrar nem visualizar no Atlas F2 (Luís 31/08)."],
  ["Descrição Prod.", "Fora do Atlas / Proteus", "— (descrição curta Proteus)", "Fora Fase 2", "Campo ERP; usar descrição/item comercial no Atlas."],
  ["Tipo", "Produto", "!Tipo de produto (Licença | Serviço)", "Só cadastra no Atlas", "Por item; catálogo pode conter licença e serviço juntos. ≠ tipo Proteus SC/IT."],
  ["Unidade", "Métrica", "→ Produto.!Métrica (cadastro)", "Só cadastra no Atlas", "Coluna unidade (hora, UST…) → cadastrar métrica e selecionar. Não campo literal Unidade."],
  ["Nome Científico", "Produto", "!#Nome científico / comercialização", "Só cadastra no Atlas", "MTI define; NÃO montar automaticamente. Relacionado à comercialização e métricas lic./serv."],
  ["Grupo Tributário", "Fora do Atlas / Proteus", "DELETE / oculto no Produto", "DELETE / oculto", "Fiscal Proteus — fora F2."],
  ["Origem", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
  ["Imposto de Renda", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
  ["Calcula INSS", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
  ["Retem PIS", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
  ["Retem COF", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
  ["Retem CSLL", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal — fora F2."],
]

t2 = [
  ["Parceria", "Parceria", "#Nome", "Só cadastra no Atlas", "Referência da parceria no catálogo/produto. Produto MTI pode ficar sem parceria (Gabriel/Luís 31/08)."],
  ["OBJETO COMERCIAL*", "Catálogo / Solução", "Objeto de comercialização (col. B = col. E)", "Só cadastra no Atlas", "Nome comercial registrado CIAG + Protheus. MTI define; parceiro preenche col. B/E conforme planilha."],
  ["Produto Catálogo Comercial*", "Produto", "!Nome do produto (item de catálogo)", "Só cadastra no Atlas", "Termo validado: item de catálogo (≠ nome da solução). Parceiro preenche col. C."],
  ["Métrica Comum", "Produto", "!Métrica + licenciamento/serviço do item", "Só cadastra no Atlas", "Métrica do produto: licenciamento OU serviço; usada para filtros/grupo."],
  ["Valor Unitário", "Produto", "!#Valor unitário", "Só cadastra no Atlas", "Mesmo que Preço de Venda. Calculado ou exibido após custo+markup."],
  ["Versão Catálogo", "Catálogo", "#Versão", "Só visualização (gerado)", "Nasce 1.0; incremento por evento (inclusão/exclusão). Filtro para versões anteriores."],
  ["PART NUMBER", "Produto", "!Part Number (SKU)", "Só cadastra no Atlas", "Cadastro no Atlas; dado nasce no sistema."],
  ["Grupo", "Grupo", "Nome → Produto.!#Grupo comercial", "Só cadastra no Atlas", "Grupo comercial (ex. análise e modelagem). Exibido Catálogo + Produto. ≠ grupo 32."],
  ["Recorrência da Cobrança*", "Tipo de Cobrança", "Nome → Produto.!Tipo de cobrança", "Só cadastra no Atlas", "Tratar como tipo/recorrência de cobrança (mensal, anual…)."],
  ["Modelo de Venda*", "Modelo de Venda", "Nome → Produto.!Modelo de venda", "Só cadastra no Atlas", "Permanece como modelado. Perpétuo → cobrança única."],
  ["Custo*", "Dados de Parceria por Produto", "Custo do parceiro", "Só cadastra no Atlas", "Parceiro preenche (obrigatório). Classe DP, não Produto."],
  ["MARKUP*", "Dados de Parceria por Produto", "#MARKUP", "Só cadastra no Atlas", "MTI preenche/aplica. Participa do cálculo do valor unitário e rateio."],
  ["% Parceiro", "Dados de Parceria por Produto", "Distribuição do parceiro", "Herdado / só visualização", "Automático. Parceiro vê nos próprios produtos."],
  ["% MTI", "Dados de Parceria por Produto", "Distribuição da MTI", "Herdado / só visualização", "Automático a partir de custo+markup."],
  ["Período Mínimo*", "Dados de Parceria por Produto", "Período mínimo", "Só cadastra no Atlas", "Parceiro preenche (obrigatório). 12–60 meses."],
  ["Código N1 Siag", "Produto", "#CÓDIGO SIAG - ITEM", "Importa e edita", "N1 produto. Importável. Parceiro não visualiza."],
  ["Código N1 Protheus", "Produto", "?CÓDIGO PROTEUS - ITEM", "Importa e edita", "N1 produto. Importável. Parceiro não visualiza."],
  ["Código N2 Siag", "Catálogo", "#CÓDIGO N2 — SIAG", "Importa e edita", "N2 catálogo parceria. Visível só Catálogo; parceiro não vê."],
  ["Código N2 Protheus", "Catálogo", "?CÓDIGO N2 — PROTHEUS", "Importa e edita", "N2 catálogo. Parceiro não vê."],
  ["Código N3 Siag", "Catálogo", "#CÓDIGO N3 — SIAG", "Importa e edita", "N3 universal (se aplicável). Parceiro não vê."],
  ["Código N3 Protheus", "Catálogo", "?CÓDIGO N3 — PROTHEUS", "Importa e edita", "N3 universal. Parceiro não vê."],
  ["Código Atlas", "Produto", "Código Atlas", "Só visualização (gerado)", "Prefixo Parceria (#Sigla). Não importa."],
  ["UNIVERSAL N3", "Catálogo", "#É catálogo universal + códigos N3", "Só cadastra no Atlas", "MTI define/publica. Pode coexistir c/ individualizado. Parceiro vê após publicação."],
  ["INDIVIDUALIZADO N1", "Catálogo", "#Tipo de oferta (Individualizado)", "Só cadastra no Atlas", "MTI define. Produto herda (RO). Pode ser só individualizado ou universal+individualizado."],
  ["Status Parceria", "Parceria", "!#Status", "Só cadastra no Atlas", "Rascunho, Aguardando Análise, Ajuste Solicitado, Reprovado, Homologado, Ativo, Paralisado."],
  ["Data Atualização Preço", "Catálogo / Produto", "Data de atualização (evento)", "Só cadastra no Atlas", "Exibir na classe Produto e Catálogo quando houver alteração/preço."],
  ["Indice de Reajuste", "Parceria", "#Índice de reajuste (sigla)", "Só cadastra no Atlas", "Sigla por parceria (IPCA, IGPM, INPC, CPI…). Cálculo numérico automático após aprovação (12 meses). Manifestação ≠ índice."],
  ["Última Homologação", "Parceria / Catálogo", "Data/método última homologação", "Só cadastra no Atlas", "Citado na planilha; fluxo homologar catálogo/parceria."],
  ["Grupo Protheus", "Fora do Atlas / Proteus", "—", "Fora Fase 2", "Grupo 32 padrão — excluído F2."],
  ["Código Produto", "Fora do Atlas / Proteus", "— (repetição ERP)", "Fora Fase 2", "Repetição integração; tratar via Código Protheus item no Produto."],
  ["Código Parceiro", "Parceria", "Código da parceira", "Importa e edita", "Mesma regra T1 — classe Parceria."],
  ["Local padrão", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fora F2."],
  ["Descrição Prod.", "Fora do Atlas / Proteus", "—", "Fora Fase 2", "ERP."],
  ["Tipo", "Fora do Atlas / Proteus", "Tipo Proteus SC/IT/SV/SW", "Fora Fase 2", "Tipo Atlas = Licença/Serviço no Produto."],
  ["Unidade", "Fora do Atlas / Proteus", "—", "Fora Fase 2", "No Atlas → Métrica."],
  ["Nome Científico", "Produto", "!#Nome científico / comercialização", "Só cadastra no Atlas", "Mesma regra T1."],
  ["Grupo Tributário", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Origem", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Imposto de Renda", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Calcula INSS", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Retem PIS", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Retem COF", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Retem CSLL", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", ""],
  ["Conta Contábil", "Fora do Atlas / Proteus", "DELETE / oculto", "DELETE / oculto", "Fiscal/contábil Proteus."],
]


def fmt_rows(rows):
    lines = []
    for p, c, campo, papel, obs in rows:
        obs_esc = obs.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'    ["{p}", "{c}", "{campo}", "{papel}", "{obs_esc}"],')
    return "\n".join(lines)


defaults_block = f"""const DEFAULTS = {{
  t1: [
{fmt_rows(t1)}
  ],
  t2: [
{fmt_rows(t2)}
  ]
}};"""

pattern = r"const DEFAULTS = \{[\s\S]*?\n\};"
if not re.search(pattern, content):
    raise SystemExit("DEFAULTS block not found")
content = re.sub(pattern, defaults_block, content, count=1)

replacements = [
  (
    "<title>De-para Planilhas × Protótipo Atlas F2</title>",
    "<title>De-para Planilhas × Protótipo Atlas F2 — Validado 31/08/2026</title>",
  ),
  (
    "<h1>De-para editável — Planilhas × Protótipo Atlas Fase 2</h1>",
    "<h1>De-para — Planilhas × Protótipo Atlas F2 (validado 31/08/2026)</h1>",
  ),
  (
    "<p>Tabela ampliada · ordenação · classes e colunas custom · visão unificada. Salva no navegador.</p>",
    "<p>Validação reunião ATLAS Catálogo 31/08 · Luís Santos. Regra geral: dados nascem no Atlas; import ERP = somente códigos.</p>",
  ),
  (
    'const STORAGE_KEY = "atlas-depara-planilhas-v2";',
    'const STORAGE_KEY = "atlas-depara-planilhas-final-20260831";',
  ),
  (
    "<code>exports/de-para-planilhas-prototipo-usuario.json</code> (ou o arquivo dos Downloads).",
    "<code>exports/de-para-planilhas-prototipo-final-20260831.html</code> (este arquivo) ou JSON exportado.",
  ),
  (
    'document.getElementById("savedMsg").textContent = "Restaurado para o padrão do protótipo.";',
    'document.getElementById("savedMsg").textContent = "Restaurado para o de-para validado 31/08/2026.";',
  ),
]
for old, new in replacements:
    content = content.replace(old, new)

old_build = """function buildDefaults() {
  return {
    customClasses: [],
    customColumns: [],
    t1: DEFAULTS.t1.map((r) => rowFromDefault(r, "t1")),
    t2: DEFAULTS.t2.map((r) => rowFromDefault(r, "t2"))
  };
}"""

new_build = """const COL_VALIDACAO = "col-validacao-3108";
const COL_REUNIAO = "col-reuniao-3108";

function buildDefaults() {
  const st = {
    customClasses: ["Índice de Reajuste (cadastro auxiliar)"],
    customColumns: [
      { id: COL_VALIDACAO, name: "VALIDAÇÃO 31/08" },
      { id: COL_REUNIAO, name: "Fonte reunião" }
    ],
    t1: DEFAULTS.t1.map((r) => rowFromDefault(r, "t1")),
    t2: DEFAULTS.t2.map((r) => rowFromDefault(r, "t2"))
  };
  for (const row of [...st.t1, ...st.t2]) {
    row.extras[COL_VALIDACAO] = "OK";
    row.extras[COL_REUNIAO] = "31/08 ATLAS Catálogo";
  }
  return st;
}"""

if old_build not in content:
    raise SystemExit("buildDefaults not found")
content = content.replace(old_build, new_build)

path.write_text(content, encoding="utf-8")
print(f"OK: {path} (T1={len(t1)}, T2={len(t2)})")
