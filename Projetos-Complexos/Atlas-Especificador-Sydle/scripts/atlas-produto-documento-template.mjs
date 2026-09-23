/**
 * Modelo HTML de documento — classe Produto cadastro (`form-atlas-produto-cadastro`).
 * Placeholders `{{id_do_campo}}` são substituídos no preview quando a etapa HTML
 * vincula `linkedFormId` a esse formulário.
 */

export const FORM_PRODUTO_CADASTRO_DOC = 'form-atlas-produto-cadastro'

export const PRODUTO_CADASTRO_DOCUMENT_HTML = `<style>
  .atlas-doc { font-family: "Segoe UI", system-ui, sans-serif; color: #0f172a; max-width: 920px; margin: 0 auto; line-height: 1.45; }
  .atlas-doc__header { border-bottom: 3px solid #0c1ba8; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  .atlas-doc__brand { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin: 0 0 0.25rem; }
  .atlas-doc__title { font-size: 1.5rem; font-weight: 700; color: #0c1ba8; margin: 0; }
  .atlas-doc__subtitle { font-size: 0.95rem; color: #475569; margin: 0.35rem 0 0; }
  .atlas-doc__meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: #64748b; margin-top: 0.75rem; }
  .atlas-doc__section { margin-bottom: 1.25rem; }
  .atlas-doc__section h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; color: #0c1ba8; border-left: 4px solid #0c1ba8; padding-left: 0.5rem; margin: 0 0 0.75rem; }
  .atlas-doc__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem 1.25rem; }
  .atlas-doc__grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 640px) { .atlas-doc__grid, .atlas-doc__grid--3 { grid-template-columns: 1fr; } }
  .atlas-doc__field { margin: 0; }
  .atlas-doc__label { display: block; font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
  .atlas-doc__value { display: block; font-size: 0.95rem; margin-top: 0.15rem; word-break: break-word; }
  .atlas-doc__value--highlight { font-weight: 600; color: #0c1ba8; }
  .atlas-doc__value--money::before { content: "R$ "; font-weight: 600; }
  .atlas-doc__desc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem 1rem; margin: 0; }
  .atlas-doc__footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.7rem; color: #94a3b8; }
  .atlas-doc__legenda code { font-size: 0.65rem; background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 3px; }
</style>

<article class="atlas-doc">
  <header class="atlas-doc__header">
    <p class="atlas-doc__brand">Atlas · Catálogo comercial MTI</p>
    <h1 class="atlas-doc__title">Ficha de produto — cadastro</h1>
    <p class="atlas-doc__subtitle">Modelo de documento gerado a partir da classe <strong>Produto — cadastro</strong></p>
    <div class="atlas-doc__meta">
      <span>Classe Sydle: <code>{{atlas-pcad-codigo-atlas}}</code></span>
      <span>Documento: especificação / impressão</span>
    </div>
  </header>

  <section class="atlas-doc__section">
    <h2>Identificação e códigos</h2>
    <div class="atlas-doc__grid atlas-doc__grid--3">
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Código Atlas</span>
        <span class="atlas-doc__value atlas-doc__value--highlight">{{atlas-pcad-codigo-atlas}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Código Siag</span>
        <span class="atlas-doc__value">{{atlas-pcad-siag}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Código Protheus / Info center</span>
        <span class="atlas-doc__value">{{atlas-pcad-protheus}}</span>
      </p>
    </div>
  </section>

  <section class="atlas-doc__section">
    <h2>Dados comerciais</h2>
    <p class="atlas-doc__field" style="margin-bottom: 0.75rem;">
      <span class="atlas-doc__label">Descrição produto</span>
      <span class="atlas-doc__desc">{{atlas-pcad-descricao}}</span>
    </p>
    <div class="atlas-doc__grid">
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Solução</span>
        <span class="atlas-doc__value">{{atlas-pcad-solucao}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Métrica</span>
        <span class="atlas-doc__value">{{atlas-pcad-metrica}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Cobrança</span>
        <span class="atlas-doc__value">{{atlas-pcad-cobranca}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Valor unitário</span>
        <span class="atlas-doc__value atlas-doc__value--money">{{atlas-pcad-valor-unitario}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Fator de conversão (FC)</span>
        <span class="atlas-doc__value">{{atlas-pcad-fc}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Link catálogo de parceria</span>
        <span class="atlas-doc__value">{{atlas-pcad-link-parceria}}</span>
      </p>
    </div>
  </section>

  <section class="atlas-doc__section">
    <h2>Responsáveis e parceiro</h2>
    <div class="atlas-doc__grid">
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">FOCAL Vendas</span>
        <span class="atlas-doc__value">{{atlas-pcad-focal-vendas}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">FOCAL Pós Vendas</span>
        <span class="atlas-doc__value">{{atlas-pcad-focal-pos}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Unidade DTIC</span>
        <span class="atlas-doc__value">{{atlas-pcad-unidade-dtic}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Parceiro</span>
        <span class="atlas-doc__value">{{atlas-pcad-parceiro}}</span>
      </p>
    </div>
  </section>

  <section class="atlas-doc__section">
    <h2>Parametrização no catálogo</h2>
    <div class="atlas-doc__grid atlas-doc__grid--3">
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Status do produto</span>
        <span class="atlas-doc__value">{{atlas-prod-status}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Exibir na tela vigentes</span>
        <span class="atlas-doc__value">{{atlas-prod-exibir-vigentes}}</span>
      </p>
      <p class="atlas-doc__field">
        <span class="atlas-doc__label">Ordem na grade</span>
        <span class="atlas-doc__value">{{atlas-prod-ordem-grade}}</span>
      </p>
    </div>
    <p class="atlas-doc__field" style="margin-top: 0.75rem;">
      <span class="atlas-doc__label">Observações</span>
      <span class="atlas-doc__desc">{{atlas-prod-observacoes}}</span>
    </p>
  </section>

  <footer class="atlas-doc__footer">
    <p class="atlas-doc__legenda">
      Placeholders <code>{{campo}}</code> mapeiam aos ids da classe <code>form-atlas-produto-cadastro</code>.
      No Sydle ONE, o motor de documentos substitui pelos valores da instância ao gerar PDF ou ofício.
    </p>
  </footer>
</article>`
