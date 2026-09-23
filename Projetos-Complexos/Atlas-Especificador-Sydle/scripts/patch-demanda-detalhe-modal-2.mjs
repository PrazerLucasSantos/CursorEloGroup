#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/portalCliente/DemandasPage.tsx')
let s = fs.readFileSync(file, 'utf8')

s = s.replace('id="homolog"', 'id="entregavel"')
s = s.replace(
  `{ id: 'entregavel', title: 'Homologação' },`,
  `{ id: 'entregavel', title: 'Homologação' },`,
)

const startMarker = `          {painel === 'detalhe' && selecionada && !criando && (
            <article className="pc-dem-detail">
              <header className="pc-page-head">
                <div>
                  <button type="button" className="pc-linkish" onClick={abrirLista}>
                    ← Voltar
                  </button>
                  <h1>{selecionada.numero}</h1>
                  <p className="pc-dem-detail__status">
                    <span className={\`pc-badge \${badgeClassStatusDemanda(selecionada.status)}\`}>
                      {selecionada.status}
                    </span>
                    <span
                      className={\`pc-badge \${
                        selecionada.tipo === 'Consumo' ? 'pc-badge--consumo' : 'pc-badge--suporte'
                      }\`}
                    >
                      {selecionada.tipo}
                    </span>
                    {selecionada.parceiroNotificado && (
                      <span className="pc-dem-meta">Parceiro: {selecionada.parceiroNome ?? 'sim'}</span>
                    )}
                    {!selecionada.qualificado && !selecionada.parceiroNotificado && (
                      <span className="pc-dem-meta">Aguardando qualificação MTI</span>
                    )}
                  </p>
                </div>
                {podeAbrirDemanda && (
                  <button
                    type="button"
                    className={listaSydle ? 'pp-dem-btn-solicitar' : 'pc-btn'}
                    onClick={abrirNova}
                  >
                    {listaSydle ? 'Solicitar Nova Demanda' : 'Nova demanda'}
                  </button>
                )}
              </header>

              {acoes.length > 0 && (
                <div className="pc-dem-acoes">
                  <span className="pc-dem-acoes__label">Ações ({labelAtor})</span>
                  {acoes.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={\`pc-btn\${a.kind === 'primary' ? ' pc-btn--primary' : ''}\${a.kind === 'danger' ? ' pc-btn--danger' : ''}\`}
                      onClick={() => abrirAcao(a)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
              {acoes.length === 0 && (
                <p className="pc-dem-acoes-empty">
                  Nenhuma ação para <strong>{labelAtor}</strong> neste status.
                  {perfil === 'Parceiro' && !selecionada.parceiroNotificado
                    ? ' Parceiro ainda não foi notificado.'
                    : ''}
                </p>
              )}

              {acaoAtiva && (
                <div className="pc-dem-acao-panel sy-dem-form">
                  <h3 className="sy-dem-section__title">{acaoAtiva.label}</h3>`

const startReplacement = `          {painel === 'detalhe' && selecionada && !criando && (
            <div
              className="pc-modal-backdrop"
              role="presentation"
              onClick={abrirLista}
            >
              <div
                className="pc-modal pc-modal--demanda pc-modal--carta"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dem-detalhe-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pc-modal__topbar sy-carta-topbar">
                  <div className="pc-modal__topbar-title">
                    <div>
                      <h2 id="dem-detalhe-title">{selecionada.numero}</h2>
                      <p className="pc-dem-detail__status">
                        <span className={\`pc-badge \${badgeClassStatusDemanda(selecionada.status)}\`}>
                          {selecionada.status}
                        </span>
                        <span
                          className={\`pc-badge \${
                            selecionada.tipo === 'Consumo' ? 'pc-badge--consumo' : 'pc-badge--suporte'
                          }\`}
                        >
                          {selecionada.tipo}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="sy-carta-topbar__actions">
                    <button type="button" className="pc-modal__icon-btn" aria-label="Notificações" title="Notificações">
                      <span className="material-symbols-outlined" aria-hidden>
                        notifications
                      </span>
                    </button>
                    <button type="button" className="pc-modal__close" aria-label="Fechar" onClick={abrirLista}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <div className="pc-modal__scroll sy-carta-scroll">
                  <div className="sy-carta-tabs-wrap">
                    <span className="sy-carta-tabs-label">
                      Dados <span className="pc-req">*</span>
                    </span>
                    <div className="sy-carta-tabs" role="tablist" aria-label="Seções da demanda">
                      {DEMANDA_DETAIL_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          id={\`dem-tab-btn-\${tab.id}\`}
                          aria-selected={detailTab === tab.id}
                          aria-controls={\`dem-tab-\${tab.id}\`}
                          className={\`sy-carta-tab\${detailTab === tab.id ? ' is-active' : ''}\`}
                          onClick={() => setDetailTab(tab.id)}
                        >
                          {tab.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sy-dem-form sy-dem-form--panel sy-carta-body">
                    <DemandaTabPanel id="acoes" activeId={detailTab}>
                      <div className="sy-carta-help" role="note">
                        <span className="material-symbols-outlined sy-carta-help__icon" aria-hidden>
                          help
                        </span>
                        <p>
                          Revise os dados da demanda e, se houver ação disponível para{' '}
                          <strong>{labelAtor}</strong>, marque <strong>Sim</strong> para preencher os
                          campos e confirme com o botão verde.
                        </p>
                      </div>

                      {acoes.length === 0 ? (
                        <p className="pc-dem-acoes-empty">
                          Nenhuma ação para <strong>{labelAtor}</strong> neste status.
                          {perfil === 'Parceiro' && !selecionada.parceiroNotificado
                            ? ' Parceiro ainda não foi notificado.'
                            : ''}
                        </p>
                      ) : (
                        <div className="sy-carta-acoes">
                          {acoes.map((a) => (
                            <SySimNao
                              key={a.id}
                              label={\`\${a.label}?\`}
                              required
                              value={acaoAtiva?.id === a.id ? true : acaoAtiva ? false : null}
                              onChange={(sim) => {
                                if (sim) {
                                  abrirAcao(a)
                                  return
                                }
                                if (acaoAtiva?.id === a.id) setAcaoAtiva(null)
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {acaoAtiva && (
                        <div className="sy-sim-nao-expand sy-dem-form">`

if (!s.includes(startMarker.slice(0, 80))) {
  // try flexible match - check if already patched
  if (s.includes('pc-modal--carta')) {
    console.log('Already has carta modal — skip start')
  } else {
    console.error('Start marker not found')
    // show nearby
    const i = s.indexOf("painel === 'detalhe'")
    console.log('snippet', s.slice(i, i + 200))
    process.exit(1)
  }
} else {
  s = s.replace(startMarker, startReplacement)
  console.log('OK start')
}

// Remove confirm/cancel buttons and close acao panel + insert tabpanels wrapper change
const btnsOld = `                  <div className="pc-dem-acao-panel__btns">
                    {/* Ação/parecer: botões textuais — não usa FABs circulares vermelho/verde */}
                    <button type="button" className="pc-btn pc-btn--primary" onClick={confirmarAcao}>
                      Confirmar
                    </button>
                    <button type="button" className="pc-btn" onClick={() => setAcaoAtiva(null)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}`

const btnsNew = `                        </div>
                      )}`

if (s.includes('pc-dem-acao-panel__btns')) {
  s = s.replace(btnsOld, btnsNew)
  console.log('OK buttons')
} else {
  console.warn('buttons block not found')
}

// After orcamento block ends, before detail body — close acoes tab and open other tabs without accordion wrapper
const bodyOld = `              <div className="pc-dem-detail__body sy-dem-form sy-dem-form--panel">
                <div className="sy-accordion" role="list">
                  <DemandaTabPanel id="andamento" activeId={detailTab}>`

const bodyNew = `                    </DemandaTabPanel>

                  <DemandaTabPanel id="andamento" activeId={detailTab}>`

// Problem: orcamento is BETWEEN acao panel and body. Need to include orcamento inside acoes tab before closing.

// Current structure after our start replace:
// acoes tab opened
// acao fields
// )  // end acaoAtiva  
// orcamento block
// body with accordion tabs

// We need: after orcamento, close DemandaTabPanel acoes, then other tabs, then close modal.

const bodyOld2 = `              {selecionada.orcamento && (
                <div className="pc-consumo-aviso" style={{ marginBottom: '1.25rem' }}>`

// Check if orcamento still at wrong level - leave orcamento where it is but close acoes after it

const closeOld = `                  </DemandaTabPanel>
                </div>
              </div>
            </article>
          )}`

const closeNew = `                  </DemandaTabPanel>
                  </div>
                </div>

                <div className="pc-fab-footer pc-modal__footer sy-carta-fabs" role="toolbar" aria-label="Confirmar ou fechar">
                  <button
                    type="button"
                    className="pc-fab pc-fab--cancel"
                    onClick={abrirLista}
                    aria-label="Fechar modal"
                    title="Fechar"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      close
                    </span>
                  </button>
                  <button
                    type="button"
                    className="pc-fab pc-fab--save"
                    onClick={() => {
                      if (!acaoAtiva) {
                        onToast('Marque Sim em uma ação na aba Ações para registrar.')
                        setDetailTab('acoes')
                        return
                      }
                      confirmarAcao()
                    }}
                    aria-label="Confirmar e registrar ação"
                    title="Confirmar e registrar"
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      check
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}`

if (s.includes(bodyOld)) {
  // First close acoes before andamento — but orcamento is before body. 
  // Insert close of acoes after orcamento section ends (before bodyOld)
  s = s.replace(bodyOld, bodyNew)
  console.log('OK body wrapper')
} else {
  console.warn('bodyOld not found', s.includes('pc-dem-detail__body'), s.includes('DemandaTabPanel id="andamento"'))
}

if (s.includes(closeOld)) {
  s = s.replace(closeOld, closeNew)
  console.log('OK close')
} else {
  console.warn('closeOld not found')
  const i = s.lastIndexOf('</DemandaTabPanel>')
  console.log(s.slice(i, i + 120))
}

fs.writeFileSync(file, s)
console.log('done')
