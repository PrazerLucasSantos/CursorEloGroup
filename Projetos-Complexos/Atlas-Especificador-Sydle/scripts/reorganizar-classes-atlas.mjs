#!/usr/bin/env node
/**
 * Reorganiza as classes do épico atlas-prototipo por grupos/subgrupos
 * (Embutidas, Métodos) na ORDEM de configuração → processo.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const CG_PATH = path.join(EPIC, 'class-groups.json')
const FORMS_PATH = path.join(EPIC, 'forms.json')

const P = 'form-patlasv4-proto-'

// Domínios na ordem configuração → processo. emb = Embutidas, met = Métodos.
const DOMAINS = [
  { id: 'grp-01-organizacao', name: '01 · Organização',
    main: [`${P}unidade-organizacional`],
    emb: [`${P}uo-conta-bancaria`, `${P}uo-documento`, `${P}uo-doc-execucao`, `${P}uo-tributo`, `${P}uo-tributo-linha`, `${P}uo-cargo-atribuido`, `${P}uo-pessoa-cargo`],
    met: [`${P}metodo-cadastrar-cargo`, `${P}metodo-migrar-cargos-uo`, `${P}metodo-adicionar-grupos-mipp`, `${P}metodo-precadastro-acesso`, `${P}metodo-aprovar-cadastro-org`, `${P}metodo-solicitar-ajuste-org`] },
  { id: 'grp-02-cargo', name: '02 · Cargo',
    main: [`${P}cargo`], emb: [`${P}cargo-ocupante`], met: [] },
  { id: 'grp-03-pessoa', name: '03 · Pessoa',
    main: [`${P}pessoa`],
    emb: [`${P}pessoa-filiacao`, `${P}pessoa-habilidade`, `${P}pessoa-exp-academica`, `${P}pessoa-exp-profissional`, `${P}pessoa-telefone`, `${P}pessoa-email`, `${P}pessoa-endereco`, `${P}pessoa-rede-social`, `${P}pessoa-atribuicao-resumo`],
    met: [`${P}metodo-criar-pessoa`, `${P}metodo-opcoes-pessoa`, `${P}metodo-atribuir-cargo-pessoa`] },
  { id: 'grp-04-convite', name: '04 · Convite & Vínculo',
    main: [`${P}portal-parceiro`, `${P}solicitacao-vinculo`], emb: [], met: [] },
  { id: 'grp-05-tipo-doc', name: '05 · Tipo de Documento',
    main: [`${P}tipo-documento`], emb: [], met: [] },
  { id: 'grp-06-versoes', name: '06 · Versões de Processo',
    main: [`${P}config-processo`], emb: [`${P}versao-processo`, 'mqb5ag1k51kz2u'], met: [] },
  { id: 'grp-07-template', name: '07 · Template',
    main: [`${P}template`], emb: [`${P}template-bloco`, `${P}revisao-bloco`, `${P}hist-edicao-bloco`], met: [] },
  { id: 'grp-08-modelo-contrato', name: '08 · Modelo de Contrato',
    main: [`${P}modelo-contrato`], emb: [], met: [] },
  { id: 'grp-09-catalogo', name: '09 · Catálogo & Produto',
    main: [`${P}cat-produto`, `${P}cat-catalogo`, `${P}cat-universal`, `${P}cat-dados-parceria`],
    sup: [`${P}cat-parceria`, `${P}cat-solucao`, `${P}cat-tipo-cobranca`, `${P}cat-metrica`, `${P}cat-categoria`, `${P}cat-grupo`, `${P}cat-modelo-venda`] },
  { id: 'grp-10-processos', name: '10 · Processos (hub)',
    main: [`${P}processos`], emb: [], met: [] },
  { id: 'grp-11-proposta', name: '11 · Proposta',
    main: [`${P}proposta`], emb: [`${P}proposta-item-catalogo`, `${P}proposta-bloco-produto`, `${P}revisao-documento`], met: [`${P}metodo-preparar-proposta`, `${P}metodo-aprovar-bloco-produto`] },
  { id: 'grp-12-documentos', name: '12 · Documentos gerados',
    main: [`${P}documentos`], emb: [`${P}geracao-pdf-saida`], met: [] },
  { id: 'grp-13-contrato', name: '13 · Contrato',
    main: [`${P}contrato`], emb: [`${P}contrato-ordem-servico`, `${P}contrato-produto-contratado`], met: [] },
  { id: 'grp-14-os', name: '14 · Ordem de Serviço',
    main: [`${P}emissao-ordem-servico`], emb: [], met: [`${P}metodo-criar-os`, `${P}metodo-zerar-pedido-venda`] },
  { id: 'grp-15-projeto', name: '15 · Projeto (Homologação + RAER)',
    main: [`${P}projeto`], emb: [`${P}raer-indicador`, `${P}raer-entrega`, `${P}raer-plano-acao`], met: [] },
  { id: 'grp-16-assinatura', name: '16 · Assinatura',
    main: ['mqebasqyphbwea', `${P}painel-assinaturas-pendentes`],
    emb: [`${P}workflow-etapa`, `${P}assinatura-documentos`, `${P}assinatura-signatario`, `${P}assinatura-controle-acesso`, `${P}painel-assinatura-item`, `${P}processo-envelope-historico`],
    met: [`${P}metodo-enviar-assinatura`, `${P}metodo-recusar-assinatura`, `${P}metodo-selecionar-metodo-assinatura`] },
  { id: 'grp-17-entrega-valor', name: '17 · Entrega de Valor',
    main: [`${P}dossie-entrega-valor`],
    emb: [`${P}ev-kpi`, `${P}ev-kpi-medicao`, `${P}ev-plano-acao`, `${P}ev-transicao-status`, `${P}ev-timeline-marco`],
    met: [`${P}ev-metodo-devolver`] },
  { id: 'grp-18-notificacoes', name: '18 · Notificações',
    main: [`${P}notificacao`], emb: [`${P}notificacao-destinatario`], met: [] },
  { id: 'grp-servidor', name: '· Servidor (backend)',
    main: [`${P}servidor`, `${P}servidor-permissao`, `${P}metodo-enviar-protheus`], emb: [], met: [] },
  { id: 'grp-backlog', name: '· Backlog',
    main: [`${P}convite-cadastro`, `${P}metodo-gerar-convite`, `${P}metodo-gerar-convite-saida`], emb: [], met: [] },
]

const groups = []
const assignments = {}
const memberOrderByGroup = {}

for (const d of DOMAINS) {
  groups.push({ id: d.id, name: d.name })
  memberOrderByGroup[d.id] = [...(d.main || [])]
  for (const f of d.main || []) assignments[f] = d.id
  if (d.emb && d.emb.length) {
    const sub = `${d.id}-emb`
    groups.push({ id: sub, name: 'Embutidas', parentGroupId: d.id })
    memberOrderByGroup[sub] = [...d.emb]
    for (const f of d.emb) assignments[f] = sub
  }
  if (d.met && d.met.length) {
    const sub = `${d.id}-met`
    groups.push({ id: sub, name: 'Métodos', parentGroupId: d.id })
    memberOrderByGroup[sub] = [...d.met]
    for (const f of d.met) assignments[f] = sub
  }
  if (d.sup && d.sup.length) {
    const sub = `${d.id}-sup`
    groups.push({ id: sub, name: 'Entidades de suporte', parentGroupId: d.id })
    memberOrderByGroup[sub] = [...d.sup]
    for (const f of d.sup) assignments[f] = sub
  }
}

// validação: garante que todo form existente foi alocado
const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const allIds = new Set(forms.map((f) => f.id))
const assigned = new Set(Object.keys(assignments))
const faltando = [...allIds].filter((id) => !assigned.has(id))
const inexistentes = [...assigned].filter((id) => !allIds.has(id))

memberOrderByGroup['__sem_grupo__'] = faltando

fs.writeFileSync(CG_PATH, `${JSON.stringify({ groups, assignments, memberOrderByGroup }, null, 2)}\n`, 'utf8')

console.log('Reorganização concluída.')
console.log('Grupos:', groups.filter((g) => !g.parentGroupId).length, '| subgrupos:', groups.filter((g) => g.parentGroupId).length)
console.log('Classes alocadas:', assigned.size)
if (faltando.length) console.log('⚠ Sem grupo (', faltando.length, '):', faltando.join(', '))
if (inexistentes.length) console.log('⚠ IDs inexistentes:', inexistentes.join(', '))
