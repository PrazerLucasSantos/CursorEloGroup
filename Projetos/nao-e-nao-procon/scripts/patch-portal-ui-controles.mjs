/**
 * UI do portal: seletor cápsula (anexo 1), upload circular (anexo 2), ajuda (anexos 3–5).
 * node scripts/patch-portal-ui-controles.mjs
 */
import fs from 'node:fs'

const path = 'public/portal-selo-nao-e-nao.html'
let html = fs.readFileSync(path, 'utf8')

const HELP = {
  'nen-sol-protocolo': 'Número gerado automaticamente ao protocolar a solicitação.',
  'nen-sol-status': 'Situação atual do pedido no fluxo (rascunho, protocolado, análise etc.).',
  'nen-sol-cnpj': 'Informe o CNPJ do estabelecimento que solicita o selo.',
  'nen-sol-razao': 'Razão social conforme cadastro da empresa.',
  'nen-sol-fantasia': 'Nome fantasia pelo qual o estabelecimento é conhecido.',
  'nen-sol-end': 'Endereço completo da unidade (logradouro, número, bairro).',
  'nen-sol-mun': 'Município onde o estabelecimento está localizado.',
  'nen-sol-cnae': 'CNAE / atividade econômica principal do estabelecimento.',
  'nen-sol-resp': 'Pessoa responsável pelo requerimento do selo.',
  'nen-sol-contato': 'E-mail e/ou telefone para contato sobre o pedido.',
  'nen-sol-boate': 'Indique se o estabelecimento é casa noturna ou boate.',
  'nen-sol-show': 'Informe se realiza shows ou eventos musicais em local fechado.',
  'nen-sol-alcool': 'Informe se há venda de bebida alcoólica no local.',
  'nen-sol-esporte': 'Informe se realiza competição ou evento esportivo.',
  'nen-sol-qtd-func': 'Quantidade total de funcionários / equipe do estabelecimento.',
  'nen-sol-qtd-cap': 'Quantidade de pessoas capacitadas no Protocolo Não é Não. Deve ser ≤ qtd. de funcionários; o percentual é calculado automaticamente.',
  'nen-sol-perc': 'Percentual calculado automaticamente (capacitados ÷ funcionários).',
  'nen-sol-certs': 'Anexe os certificados gerais do curso Protocolo Não é Não.',
  'nen-sol-capacitados': 'Cadastre no mínimo 2 capacitados. Em eventos com mais de 300 pessoas, observe o percentual mínimo previsto no decreto.',
  'nen-sol-banheiro': 'A sinalização no banheiro feminino deve informar o auxílio e estar em local visível.',
  'nen-sol-acionar': 'O material deve conter forma clara de acionar o protocolo.',
  'nen-sol-190': 'O material deve conter o telefone 190.',
  'nen-sol-180': 'O material deve conter o telefone 180.',
  'nen-sol-a3': 'Cartaz em formato mínimo A3 com o texto oficial do protocolo.',
  'nen-sol-fotos-sinal': 'Envie fotos nítidas da sinalização instalada no estabelecimento.',
  'nen-sol-codigo': 'Descreva o sinal ou código utilizado para acionar o protocolo.',
  'nen-sol-como-info': 'Explique como as mulheres são informadas sobre o sinal/código.',
  'nen-sol-foto-cod': 'Anexe foto do material que apresenta o sinal ou código.',
  'nen-sol-p1': 'A equipe verifica de forma reservada se a mulher necessita assistência.',
  'nen-sol-p2': 'A equipe protege e afasta a mulher do agressor, inclusive do contato visual.',
  'nen-sol-p3': 'A equipe colabora na identificação de testemunhas.',
  'nen-sol-p4': 'A equipe solicita PM/agente quando necessário.',
  'nen-sol-p5': 'A equipe preserva o local e vestígios até a chegada da autoridade.',
  'nen-sol-p6': 'A equipe auxilia até o transporte ou comunicação à polícia.',
  'nen-sol-p7': 'Cabe à mulher definir se sofreu constrangimento ou violência.',
  'nen-sol-p8': 'Suporte imediato conforme Lei 12.478/2024.',
  'nen-sol-p9': 'Orientação sobre o Código Sinal Vermelho (Lei 11.889/2022).',
  'nen-sol-p10': 'A equipe reconhece o sinal gestual universal de socorro.',
  'nen-sol-p11': 'O estabelecimento compromete-se a assegurar os direitos do protocolo.',
  'nen-sol-tem-cam': 'Se Não, o bloco de câmeras pode ser omitido; a ausência de câmeras não reprova automaticamente.',
  'nen-sol-cam-30': 'Compromisso de preservar imagens por no mínimo 30 dias (condicional se possui câmeras).',
  'nen-sol-cam-acesso': 'Garantia de acesso legal às imagens (PC, perícia e envolvidos).',
  'nen-sol-dec-impl': 'Declare a implementação do Protocolo Não é Não no estabelecimento.',
  'nen-sol-dec-ver': 'Declare a veracidade das informações prestadas neste formulário.',
  'nen-sol-sancao': 'Informe se houve sanção administrativa definitiva nos 12 meses anteriores.',
}

const uiCss = `
    /* Anexo 1 — seletor cápsula Sim/Não */
    .seg {
      display: inline-flex;
      align-items: stretch;
      padding: 0;
      margin: 4px 0 10px;
      border: 1px solid #cfcfcf;
      border-radius: 999px;
      overflow: hidden;
      background: #fff;
      width: fit-content;
      max-width: 100%;
    }
    .seg__opt {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin: 0;
      padding: 8px 22px;
      min-width: 96px;
      border: 0;
      border-radius: 0;
      border-right: 1px solid #cfcfcf;
      background: #fff;
      color: #333;
      font-size: .92rem;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: background .15s, color .15s;
    }
    .seg__opt:last-child { border-right: 0; }
    .seg__opt input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      width: 0;
      height: 0;
    }
    .seg__opt:has(input:checked) {
      background: #4a4a4a;
      color: #fff;
      font-weight: 600;
      border-color: #4a4a4a;
    }
    .seg__opt:hover:not(:has(input:checked)) { background: #f5f5f5; }

    /* Anexo 2 — botão upload circular */
    .file-upload {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 4px 0 8px;
    }
    .file-upload input[type="file"] {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      overflow: hidden;
    }
    .file-upload__btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1.5px solid #bdbdbd;
      background: #fff;
      color: #555;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: border-color .15s, background .15s;
    }
    .file-upload__btn:hover {
      border-color: var(--blue);
      background: #f7faff;
      color: var(--blue);
    }
    .file-upload__name {
      font-size: .88rem;
      color: var(--muted);
      max-width: 280px;
      word-break: break-word;
    }
    .file-upload__name.has-file { color: var(--text); font-weight: 500; }

    /* Anexos 3–5 — ícone de ajuda + tooltip */
    .field-label-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 2px;
    }
    .field-label-row > .label-text { font-size: .82rem; font-weight: 500; color: var(--text); }
    .help-wrap { position: relative; display: inline-flex; align-items: center; }
    .help-btn {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1.5px solid #5b8def;
      background: #eaf1ff;
      color: #2f6fed;
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      display: grid;
      place-items: center;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
    }
    .help-btn:hover, .help-btn.is-open {
      background: #2f6fed;
      color: #fff;
      border-color: #2f6fed;
    }
    .help-pop {
      display: none;
      position: absolute;
      left: 0;
      bottom: calc(100% + 10px);
      width: min(320px, 78vw);
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .16);
      border-left: 4px solid #2f6fed;
      padding: 12px 14px 12px 12px;
      z-index: 30;
      text-align: left;
    }
    .help-pop.is-open { display: block; }
    .help-pop__head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .help-pop__head .help-btn { pointer-events: none; }
    .help-pop__title { font-weight: 700; font-size: .9rem; color: var(--text); flex: 1; }
    .help-pop__close {
      border: 0;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 2px 4px;
    }
    .help-pop__body { font-size: .86rem; color: #4b5563; line-height: 1.45; }
`

// Replace old seg CSS block with new (from .seg { to .seg__opt input...)
html = html.replace(
  /\n    \/\* Anexo 1[\s\S]*?\.help-pop__body \{[\s\S]*?\}\n/,
  '\n',
)

if (!html.includes('Anexo 1 — seletor cápsula')) {
  html = html.replace(
    /    \.seg \{ display: flex; gap: 8px;[\s\S]*?\.seg__opt input \{ accent-color: var\(--blue\); \}\n/,
    uiCss,
  )
}

function helpBtn(fieldId) {
  const text = HELP[fieldId] || 'Preencha este campo conforme a orientação do serviço.'
  const safe = text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return `<span class="help-wrap">
      <button type="button" class="help-btn" aria-label="Ajuda" data-help-for="${fieldId}">?</button>
      <div class="help-pop" role="dialog" data-help-pop="${fieldId}">
        <div class="help-pop__head">
          <span class="help-btn" aria-hidden>?</span>
          <span class="help-pop__title">Ajuda:</span>
          <button type="button" class="help-pop__close" aria-label="Fechar" data-help-close>×</button>
        </div>
        <div class="help-pop__body">${safe}</div>
      </div>
    </span>`
}

function wrapLabel(innerLabelHtml, fieldId) {
  // innerLabelHtml may be <label>...</label> or just text content used inside
  return `<div class="field-label-row">${innerLabelHtml}${helpBtn(fieldId)}</div>`
}

// Transform each field block: add help to labels
html = html.replace(
  /<div class="field([^"]*)" data-field-id="([^"]+)">([\s\S]*?)<\/div>(?=\s*(?:<div class="field|<div class="sol-panel|<\/div>\s*<\/div>\s*<div class="sol-panel|<\/div>\s*<div class="form-actions))/g,
  (full, cls, fieldId, inner) => {
    let next = inner

    // Label with for=...
    next = next.replace(
      /<label for="([^"]+)">([\s\S]*?)<\/label>/,
      (_, forId, content) =>
        `<div class="field-label-row"><label class="label-text" for="${forId}">${content}</label>${helpBtn(fieldId)}</div>`,
    )

    // Label without for (seg questions / boolean)
    if (!next.includes('field-label-row')) {
      next = next.replace(
        /<label>([\s\S]*?)<\/label>\s*(?=<div class="seg"|<label class="toggle-row")/,
        (_, content) =>
          `<div class="field-label-row"><span class="label-text">${content}</span>${helpBtn(fieldId)}</div>`,
      )
    }

    // File inputs → circular upload
    next = next.replace(
      /<input ([^>]*type="file"[^>]*)\/>/,
      (_, attrs) => {
        const idMatch = attrs.match(/id="([^"]+)"/)
        const id = idMatch ? idMatch[1] : fieldId
        return `<div class="file-upload">
        <input ${attrs.trim()} />
        <label class="file-upload__btn" for="${id}" title="Enviar arquivo" aria-label="Enviar arquivo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden>
            <path d="M12 16V5" stroke-linecap="round"/>
            <path d="M8 9l4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 19h14" stroke-linecap="round"/>
          </svg>
        </label>
        <span class="file-upload__name" data-file-label-for="${id}">Nenhum arquivo selecionado</span>
      </div>`
      },
    )

    // Boolean → same capsule Sim/Não
    if (next.includes('toggle-row') && next.includes('type="checkbox"')) {
      const nameMatch = next.match(/name="([^"]+)"/)
      const name = nameMatch ? nameMatch[1] : fieldId
      const req = /required/.test(next) ? 'required' : ''
      const labelRow = next.match(/<div class="field-label-row">[\s\S]*?<\/div>/)?.[0] || ''
      next = `${labelRow}
      <div class="seg" role="group">
        <label class="seg__opt"><input type="radio" name="${name}" value="Sim" ${req} /> Sim</label>
        <label class="seg__opt"><input type="radio" name="${name}" value="Não" /> Não</label>
      </div>`
    }

    return `<div class="field${cls}" data-field-id="${fieldId}">${next}</div>`
  },
)

// Fix double-wrapped help if any field got help twice
html = html.replace(
  /(<div class="field-label-row">[\s\S]*?<\/div>)\s*<div class="field-label-row">[\s\S]*?<\/div>/g,
  '$1',
)

// JS for help popovers + file name labels
const uiJs = `
    // Ajuda (anexos 3–5)
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('.help-btn[data-help-for]')
      const closeBtn = e.target.closest('[data-help-close]')
      if (closeBtn) {
        closeBtn.closest('.help-pop')?.classList.remove('is-open')
        closeBtn.closest('.help-wrap')?.querySelector('.help-btn[data-help-for]')?.classList.remove('is-open')
        return
      }
      if (openBtn) {
        e.preventDefault()
        const id = openBtn.getAttribute('data-help-for')
        const pop = document.querySelector('[data-help-pop="' + id + '"]')
        const wasOpen = pop?.classList.contains('is-open')
        document.querySelectorAll('.help-pop.is-open').forEach((p) => p.classList.remove('is-open'))
        document.querySelectorAll('.help-btn.is-open').forEach((b) => b.classList.remove('is-open'))
        if (pop && !wasOpen) {
          pop.classList.add('is-open')
          openBtn.classList.add('is-open')
        }
        return
      }
      if (!e.target.closest('.help-wrap')) {
        document.querySelectorAll('.help-pop.is-open').forEach((p) => p.classList.remove('is-open'))
        document.querySelectorAll('.help-btn.is-open').forEach((b) => b.classList.remove('is-open'))
      }
    })

    // Nome do arquivo no upload circular
    document.querySelectorAll('input[type="file"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const label = document.querySelector('[data-file-label-for="' + inp.id + '"]')
        if (!label) return
        if (!inp.files || !inp.files.length) {
          label.textContent = 'Nenhum arquivo selecionado'
          label.classList.remove('has-file')
          return
        }
        const names = Array.from(inp.files).map((f) => f.name)
        label.textContent = names.length === 1 ? names[0] : names.length + ' arquivos selecionados'
        label.classList.add('has-file')
      })
    })
`

if (!html.includes('Ajuda (anexos 3–5)')) {
  html = html.replace(
    /showView\('menu', \{ push: false \}\)\s*\n\s*stack = \['menu'\]/,
    uiJs + `\n    showView('menu', { push: false })\n    stack = ['menu']`,
  )
}

fs.writeFileSync(path, html)
console.log({
  helpBtns: (html.match(/data-help-for=/g) || []).length,
  fileUpload: (html.match(/file-upload__btn/g) || []).length,
  seg: (html.match(/class="seg"/g) || []).length,
  capsuleCss: html.includes('Anexo 1 — seletor cápsula'),
})
