/** Shell visual tipo Convocação Pública (referência do portal de cotação). */
export const PORTAL_CONVOCACAO_SHELL_HTML = `<style>
  .conv { font-family: "Segoe UI", Roboto, sans-serif; background: #fafafa; color: #212121; max-width: 1100px; margin: 0 auto; }
  .conv__bar { background: #1565c0; color: #fff; padding: 0.85rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
  .conv__bar-back { opacity: 0.9; font-size: 1.25rem; }
  .conv__bar-title { flex: 1; text-align: center; font-size: 1.1rem; font-weight: 600; margin: 0; }
  .conv__body { padding: 1.5rem 1.25rem 2rem; }
  .conv__field { margin-bottom: 1.1rem; }
  .conv__label { display: block; font-size: 0.8rem; color: #757575; margin-bottom: 0.2rem; }
  .conv__label--req::after { content: " *"; color: #d32f2f; }
  .conv__input { display: block; width: 100%; border: none; border-bottom: 1px solid #bdbdbd; background: transparent; padding: 0.35rem 0; font-size: 0.95rem; min-height: 1.6rem; }
  .conv__input--filled { color: #212121; }
  .conv__section-title { font-size: 1rem; font-weight: 600; color: #424242; margin: 1.75rem 0 1rem; padding-bottom: 0.35rem; border-bottom: 1px solid #e0e0e0; }
  .conv__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem 1.25rem; }
  .conv__grid--2 { grid-template-columns: repeat(2, 1fr); }
  .conv__span2 { grid-column: span 2; }
  .conv__span4 { grid-column: 1 / -1; }
  .conv__toolbar { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .conv__tool { width: 36px; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; color: #616161; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; }
  .conv__table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .conv__table th { text-align: left; color: #757575; font-weight: 600; border-bottom: 2px solid #1565c0; padding: 0.5rem; }
  .conv__table td { border-bottom: 1px solid #eee; padding: 0.5rem; }
  .conv__note { font-size: 0.75rem; color: #9e9e9e; margin-top: 1.5rem; }
  @media (max-width: 768px) { .conv__grid { grid-template-columns: 1fr 1fr; } .conv__span2, .conv__span4 { grid-column: 1 / -1; } }
</style>
<div class="conv">
  <header class="conv__bar">
    <span class="conv__bar-back" aria-hidden="true">←</span>
    <h1 class="conv__bar-title">Cotação comercial — Portal MTI</h1>
  </header>
  <div class="conv__body">
    <div class="conv__field conv__span4">
      <label class="conv__label conv__label--req">Selecione a solução / linha de cotação desejada</label>
      <div class="conv__input conv__input--filled">{{atlas-portal-cot-solucao}}</div>
    </div>

    <h2 class="conv__section-title">Dados do Solicitante</h2>
    <div class="conv__grid">
      <div class="conv__field conv__span2"><label class="conv__label">Nome</label><div class="conv__input conv__input--filled">{{atlas-portal-sol-nome}}</div></div>
      <div class="conv__field"><label class="conv__label">CPF</label><div class="conv__input conv__input--filled">{{atlas-portal-sol-cpf}}</div></div>
      <div class="conv__field"><label class="conv__label">RG</label><div class="conv__input">{{atlas-portal-sol-rg}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">Telefone</label><div class="conv__input">{{atlas-portal-sol-telefone}}</div></div>
      <div class="conv__field conv__span2"><label class="conv__label conv__label--req">E-mail</label><div class="conv__input conv__input--filled">{{atlas-portal-sol-email}}</div></div>
      <div class="conv__field conv__span2"><label class="conv__label conv__label--req">Cargo / Função</label><div class="conv__input">{{atlas-portal-sol-cargo}}</div></div>
    </div>

    <h2 class="conv__section-title">Dados do Representante Legal</h2>
    <div class="conv__grid">
      <div class="conv__field conv__span2"><label class="conv__label conv__label--req">Nome</label><div class="conv__input">{{atlas-portal-rep-nome}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">CPF</label><div class="conv__input">{{atlas-portal-rep-cpf}}</div></div>
      <div class="conv__field"><label class="conv__label">RG</label><div class="conv__input">{{atlas-portal-rep-rg}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">Telefone</label><div class="conv__input">{{atlas-portal-rep-telefone}}</div></div>
      <div class="conv__field conv__span2"><label class="conv__label conv__label--req">E-mail</label><div class="conv__input">{{atlas-portal-rep-email}}</div></div>
      <div class="conv__field conv__span2"><label class="conv__label conv__label--req">Cargo / Função</label><div class="conv__input">{{atlas-portal-rep-cargo}}</div></div>
    </div>

    <h2 class="conv__section-title">Dados da Empresa e Cliente</h2>
    <div class="conv__grid conv__grid--2">
      <div class="conv__field"><label class="conv__label conv__label--req">Razão social</label><div class="conv__input">{{atlas-portal-emp-razao}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">Nome fantasia</label><div class="conv__input">{{atlas-portal-emp-fantasia}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">CNPJ</label><div class="conv__input">{{atlas-portal-emp-cnpj}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">CEP</label><div class="conv__input">{{atlas-portal-emp-cep}}</div></div>
      <div class="conv__field"><label class="conv__label conv__label--req">Cliente / órgão</label><div class="conv__input conv__input--filled">{{atlas-portal-cli-orgao}}</div></div>
      <div class="conv__field"><label class="conv__label">UF</label><div class="conv__input conv__input--filled">{{atlas-portal-cli-uf}}</div></div>
    </div>

    <h2 class="conv__section-title">Itens da cotação (catálogos)</h2>
    <div class="conv__toolbar" aria-label="Ações da grade">
      <span class="conv__tool" title="Adicionar">+</span>
      <span class="conv__tool" title="Editar">✎</span>
      <span class="conv__tool" title="Excluir">🗑</span>
    </div>
    <table class="conv__table">
      <thead>
        <tr>
          <th>Catálogo</th>
          <th>Código Atlas</th>
          <th>Descrição</th>
          <th>Qtd</th>
          <th>Valor total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Serviços</td>
          <td>ATLAS-SRV-0012401</td>
          <td>Treinamento técnico presencial — cloud</td>
          <td>8</td>
          <td>R$ 10.000,00</td>
        </tr>
        <tr>
          <td>Licenças</td>
          <td>ATLAS-LIC-001666G</td>
          <td>EXECUÇÃO DE ANÁLISE DAST</td>
          <td>2</td>
          <td>R$ 121.874,40</td>
        </tr>
        <tr>
          <td>Produtos vigentes</td>
          <td>ATLAS-PRD-0010796</td>
          <td>MTI Autonomy — Robotização</td>
          <td>1</td>
          <td>R$ 185.000,00</td>
        </tr>
      </tbody>
    </table>
    <p class="conv__note">Preview de referência visual. O formulário operacional está na etapa «Montar cotação»; placeholders <code>{{campo}}</code> vêm de <code>form-atlas-portal-cotacao</code>.</p>
  </div>
</div>`
