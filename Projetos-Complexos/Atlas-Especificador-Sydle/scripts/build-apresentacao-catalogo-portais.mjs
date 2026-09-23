#!/usr/bin/env node
/**
 * Apresentação didática completa — Catálogo: Backoffice MTI + Portal Parceiro + Portal Cliente.
 *
 * Gera:
 *   1. Atualiza o fluxo `flow-proto-catalogo-portal-mti-cliente` em flows.json
 *   2. exports/presentations/catalogo-portais-backoffice-presentation.json
 *   3. exports/apresentacao-catalogo-portais-backoffice.html (standalone)
 *
 * Uso:
 *   node scripts/build-apresentacao-catalogo-portais.mjs
 *   node scripts/build-apresentacao-catalogo-portais.mjs --zip
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(root, 'data/subprojects/atlas-prototipo/epics/prototipo')
const wantZip = process.argv.includes('--zip')

const FLOW_ID = 'flow-proto-catalogo-portal-mti-cliente'
const BASE = 'catalogo-portais-backoffice'

const C = {
  mti: { border: '#0c1ba8', bg: '#eef2ff' },
  parc: { border: '#0b3d2e', bg: '#ecfdf5' },
  cli: { border: '#0369a1', bg: '#e0f2fe' },
  warn: { border: '#a16207', bg: '#fffbeb' },
  ok: { border: '#15803d', bg: '#f0fdf4' },
  neut: { border: '#64748b', bg: '#f8fafc' },
}

function box(title, body, colors = C.neut) {
  return `<div style="border-left:4px solid ${colors.border};background:${colors.bg};padding:14px 18px;border-radius:8px;margin:10px 0">
  <div style="font-weight:700;color:#0f172a;margin-bottom:6px;font-size:15px">${title}</div>
  <div style="color:#334155;font-size:14px;line-height:1.55">${body}</div>
</div>`
}

function wrap(title, subtitle, inner) {
  return `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:880px;padding:6px 2px;color:#0f172a">
  <h1 style="margin:0 0 6px;color:#0c1ba8;font-size:24px;line-height:1.25">${title}</h1>
  ${subtitle ? `<p style="margin:0 0 14px;color:#64748b;font-size:14px;line-height:1.5">${subtitle}</p>` : ''}
  ${inner}
</div>`
}

function ul(items) {
  return `<ul style="margin:6px 0 0;padding-left:18px;line-height:1.55">${items.map((i) => `<li style="margin:0 0 4px">${i}</li>`).join('')}</ul>`
}

function ol(items) {
  return `<ol style="margin:6px 0 0;padding-left:18px;line-height:1.55">${items.map((i) => `<li style="margin:0 0 6px">${i}</li>`).join('')}</ol>`
}

function table(headers, rows) {
  const th = headers
    .map((h) => `<th style="padding:8px 10px;text-align:left;background:#0c1ba8;color:#fff;font-size:12px">${h}</th>`)
    .join('')
  const tr = rows
    .map(
      (r, i) =>
        `<tr style="background:${i % 2 ? '#f8fafc' : '#fff'}">${r
          .map((c) => `<td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;vertical-align:top">${c}</td>`)
          .join('')}</tr>`,
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 12px"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`
}

function htmlStep(id, title, headerTitle, htmlContent) {
  return {
    id,
    title,
    type: 'html',
    htmlPresentationShowHeader: true,
    htmlPresentationHeaderTitle: headerTitle,
    htmlContent,
  }
}

function bpmnStep(opts) {
  return {
    type: 'bpmnActivity',
    bpmnTaskType: 'entryForm',
    ...opts,
  }
}

function buildFlow() {
  const H = 'Atlas · Catálogo · Portais'
  const steps = []

  steps.push(
    htmlStep(
      'step-pres-capa',
      '0. Capa — O que vamos aprender',
      H,
      wrap(
        'Catálogo Atlas: do cadastro ao consumo',
        'Apresentação completa para quem nunca viu o fluxo. Backoffice da MTI + Portal do Parceiro + Portal do Cliente.',
        [
          box(
            'Ao final você saberá',
            ul([
              'Quem faz o quê (MTI, parceiro, cliente) e em qual tela',
              'Como configurar o “chão de fábrica” no backoffice',
              'Como o parceiro cadastra e envia catálogo/produtos',
              'Como a MTI analisa, publica e versiona',
              'Como o cliente consome sem cadastrar nada',
              'Como os status se espelham entre portal e backoffice',
            ]),
            C.mti,
          ),
          box(
            'Tempo sugerido',
            '40–60 minutos (pode pausar em cada etapa e abrir o formulário vinculado quando houver).',
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-contexto',
      '1. Contexto — por que existe catálogo',
      H,
      wrap(
        'Por que a MTI precisa de catálogo?',
        'Pense em um cardápio oficial de produtos e serviços de TI que o governo pode contratar.',
        [
          box(
            'Problema que resolve',
            'Sem catálogo padronizado, cada contratação vira uma lista solta. Com catálogo versionado, a MTI e os parceiros publicam itens oficiais; o contrato do cliente aponta para uma <b>versão</b> desse cardápio; demandas e ordens de serviço debitam o saldo contratado.',
            C.mti,
          ),
          box(
            'Analogia simples',
            ul([
              '<b>Catálogo</b> = cardápio da parceria (ex.: MTI SIMPLIFICA v1.5)',
              '<b>Produto</b> = prato do cardápio (ex.: Implantação Simplifica)',
              '<b>Contrato</b> = “você comprou o cardápio v1.5” — não muda sozinho quando sai v1.7',
              '<b>Apostilamento</b> = formalizar a troca de cardápio no contrato',
            ]),
            C.ok,
          ),
          box(
            'Três formas de contratar (resumo)',
            table(
              ['Tipo', 'O que se compra', 'O que se pode consumir'],
              [
                ['1', 'Item específico', 'Só aquele item'],
                ['2', '“Moeda” do catálogo (USN/UST/HST)', 'Itens daquele catálogo na métrica'],
                ['3 — CGS', 'Créditos MTI de TI/Serviço', 'Produtos ativos nas métricas universais'],
              ],
            ),
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-atores',
      '2. Três atores, dois canais',
      H,
      wrap(
        'Quem entra onde',
        'Regra de ouro: MTI só no backoffice; parceiro e cliente só nos portais.',
        [
          table(
            ['Ator', 'Canal', 'Pode cadastrar catálogo?', 'Papel em uma frase'],
            [
              [
                '<b>MTI</b> (analista / DIRC)',
                'Backoffice Atlas',
                'Sim (interno) + analisa o que o parceiro envia',
                'Configura, homologa, publica, versiona e apostila',
              ],
              [
                '<b>Parceiro</b>',
                'Portal do Parceiro',
                'Sim — só rascunho da sua parceria',
                'Monta o cardápio e envia para a MTI analisar',
              ],
              [
                '<b>Cliente</b> (órgão)',
                'Portal do Cliente',
                '<b>Não</b>',
                'Consulta a versão do contrato e consome (cotação, demanda, OS)',
              ],
            ],
          ),
          box(
            'O que “se conversam” significa',
            'Não é o parceiro logando no backoffice. É o <b>mesmo registro</b> de catálogo/produto com um <b>status de fluxo</b> que o portal e o backoffice mostram juntos. Quando o parceiro clica “Enviar à MTI”, o status muda para “Aguardando análise” e a MTI vê isso na análise. Quando a MTI solicita ajuste, o portal do parceiro mostra a justificativa.',
            C.warn,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-glossario',
      '3. Glossário — palavras que vão aparecer',
      H,
      wrap(
        'Dicionário rápido',
        'Leia uma vez; volte aqui se alguma palavra parecer nova.',
        table(
          ['Termo', 'Significado em linguagem simples'],
          [
            ['Backoffice', 'Sistema interno da MTI (Atlas) — telas de classe/formulário, métodos, análise'],
            ['Portal', 'Site externo (parceiro ou cliente) com login próprio'],
            ['Organização', 'Empresa/órgão com CNPJ (ex.: EloGroup, SEPLAG)'],
            ['Parceria', 'Acordo comercial MTI + organização (ex.: MTI HOST). Uma org pode ter várias parcerias'],
            ['Solução', 'Oferta da parceria (com fabricante em texto, sem classe Fabricante)'],
            ['Catálogo', 'Lista versionada de produtos de uma parceria'],
            ['Produto', 'Item do catálogo (licença ou serviço) com preço e métrica'],
            ['Métrica', 'Unidade de medida/moeda: USN, UST, HST…'],
            ['Homologar', 'MTI aprova oficialmente'],
            ['Publicar', 'Coloca em Produção (visível para consumo quando o contrato apontar)'],
            ['Versão', 'Número do cardápio (1.5, 1.7). Contratos “congelam” uma versão'],
            ['Apostilar', 'Atualizar o contrato para outra versão do catálogo'],
            ['CSV', 'Planilha para importar muitos produtos de uma vez'],
            ['Parecer / Análise', 'Decisão da MTI: aprovar, pedir ajuste ou reprovar'],
            ['OS', 'Ordem de Serviço — consumo formal sobre itens do contrato'],
          ],
        ),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-status',
      '4. Mapa de status (portal ↔ backoffice)',
      H,
      wrap(
        'O fio que une os sistemas',
        'Todo catálogo/produto enviado pelo parceiro carrega um status de fluxo. Ambos os lados leem o mesmo valor.',
        [
          table(
            ['Status', 'Quem colocou', 'O que acontece'],
            [
              ['Rascunho (parceiro)', 'Parceiro', 'Editável no portal; MTI ainda não analisa'],
              ['Aguardando análise MTI', 'Parceiro (ao enviar)', 'Portal bloqueia edição; backoffice abre análise'],
              ['Ajuste solicitado', 'MTI', 'Portal mostra justificativa; parceiro corrige e reenvia'],
              ['Homologado', 'MTI (aprovar)', 'Aprovado; ainda pode faltar publicar'],
              ['Ativo (publicado)', 'MTI (publicar)', 'Em Produção; cliente só vê após apostilamento'],
              ['Reprovado', 'MTI', 'Ciclo encerrado; novo rascunho se quiser tentar de novo'],
              ['Paralisado', 'MTI', 'Fora de novas homologações/consumo'],
            ],
          ),
          box(
            'Lembrete',
            'Status do <b>objeto de negócio</b> (Ativo/Homologado no cadastro) ≠ status do <b>fluxo portal↔MTI</b>. No protótipo os dois existem; o espelho é o campo “Status do fluxo”.',
            C.warn,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-config-visao',
      '5. Configuração — visão geral (backoffice)',
      H,
      wrap(
        'Antes do parceiro cadastrar, a MTI prepara a base',
        'Sem metadados e parceria, o produto “não fecha”. Isso é trabalho de backoffice.',
        [
          box(
            'Ordem recomendada de configuração',
            ol([
              '<b>Metadados</b>: Métrica, Tipo de cobrança, Grupo, Modelo de venda, Categoria',
              '<b>Organização</b> do parceiro (já vem da Fase 1 — cadastro organizacional homologado)',
              '<b>Parceria</b> ligada à organização (primeiro cadastro pela MTI)',
              '<b>Solução(ões)</b> da parceria (fabricante em texto + docs)',
              'Só então: catálogo + produtos (MTI interno <i>ou</i> parceiro via portal)',
            ]),
            C.mti,
          ),
          box(
            'Onde fica no protótipo',
            'Workspace / pacote Fase 2 — Catálogo. Classes do grupo [Atlas] Produtos + Parceria em Organização.',
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-config-metadados',
      title: '6. Configuração — metadados (métrica etc.)',
      bpmnActivityKey: 'Cadastrar metadados base',
      bpmnDescription:
        'MTI cadastra tabelas reutilizáveis. Exemplo: métrica UST = Unidade de Serviço Técnico. Sem métrica, o produto não tem “unidade de moeda”.',
      assigneeRole: 'Analista MTI (backoffice)',
      assigneeRoleDetail: 'Só backoffice. Parceiro e cliente não configuram metadados.',
      bpmnInputs: 'Lista aprovada DIRC de siglas e descrições.',
      bpmnOutputs: 'Registros ativos para referência nos produtos.',
      bpmnRuleList: [
        'Identificador (sigla) único por tipo',
        'Não excluir metadado já usado em produto homologado — inativar',
        'USN / UST / HST são as métricas universais tipicamente usadas nos Tipos 2 e 3',
      ],
      bpmnPossiblePaths: [{ key: 'Metadados ok', value: 'step-pres-config-parceria' }],
      linkedFormId: 'form-patlasv4-proto-cat-metrica',
      bpmnSla: '2 dias úteis',
      bpmnFormConfirmNavigateStepId: 'step-pres-config-parceria',
    }),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-config-parceria',
      title: '7. Configuração — parceria e solução',
      bpmnActivityKey: 'Cadastrar parceria + solução',
      bpmnDescription:
        'Parceria = vínculo MTI com a organização parceira (ex.: MTI SIMPLIFICA). Solução = oferta dentro da parceria, com fabricante em campos texto (não há classe Fabricante).',
      assigneeRole: 'Analista MTI (backoffice)',
      bpmnInputs: 'Organização homologada + nome da parceria + soluções.',
      bpmnOutputs: 'Parceria Homologada/Ativa referenciável por catálogo.',
      bpmnRuleList: [
        'Primeiro cadastro da parceria pela MTI',
        'Uma organização pode ter N parcerias',
        'Status Homologada exige governança DIREX quando aplicável',
      ],
      bpmnPossiblePaths: [{ key: 'Parceria ok', value: 'step-pres-mapa-fluxo' }],
      linkedFormId: 'form-patlasv4-proto-cat-parceria',
      bpmnFormConfirmNavigateStepId: 'step-pres-mapa-fluxo',
    }),
  )

  steps.push(
    htmlStep(
      'step-pres-mapa-fluxo',
      '8. Mapa do fluxo ponta a ponta',
      H,
      wrap(
        'Do rascunho do parceiro ao consumo do cliente',
        'Guarde este mapa — as próximas etapas detalham cada caixa.',
        [
          box(
            'Sequência feliz',
            ol([
              'Parceiro monta catálogo/produtos no <b>Portal do Parceiro</b> (rascunho / CSV)',
              'Parceiro clica <b>Enviar à MTI</b> → status Aguardando análise',
              'MTI abre <b>Análise de catálogo</b> no backoffice → Aprovar / Ajuste / Reprovar',
              'Se ajuste: parceiro corrige no portal e reenvia (volta ao passo 2)',
              'Se aprovar: MTI pode <b>Publicar</b> e/ou <b>Criar nova versão</b>',
              'MTI <b>apostila</b> a versão no contrato do cliente',
              'Cliente no <b>Portal do Cliente</b> consulta e consome (cotação / demanda / OS)',
            ]),
            C.ok,
          ),
          box(
            'Caminhos de retorno',
            ul([
              '<b>Solicitar ajuste</b> → volta ao parceiro com justificativa',
              '<b>Reprovar</b> → fim do ciclo (novo rascunho se necessário)',
              '<b>Nova versão sem apostila</b> → cliente continua vendo a versão antiga do contrato (RN-VER-03)',
            ]),
            C.warn,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-portal-parceiro-intro',
      '9. Portal do Parceiro — o que é',
      H,
      wrap(
        'Canal exclusivo do parceiro',
        'URL do protótipo: /portal-parceiro.html · comando: npm run dev:portal-parceiro',
        [
          box(
            'O que o parceiro PODE fazer',
            ul([
              'Ver “Meus catálogos” da sua organização/parceria',
              'Criar/editar rascunho (identificador, versão de trabalho, produtos)',
              'Importar CSV (carga em massa)',
              'Enviar à MTI e acompanhar status',
              'Corrigir quando a MTI solicitar ajuste',
            ]),
            C.parc,
          ),
          box(
            'O que o parceiro NÃO faz',
            ul([
              'Não acessa o backoffice Atlas',
              'Não publica em Produção',
              'Não cria a versão contratual oficial nem apostila contrato',
              'Não decide o parecer (aprovar/reprovar) — isso é MTI',
            ]),
            C.warn,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-parceiro-cadastro',
      title: '10. Parceiro — cadastrar catálogo e produtos',
      bpmnActivityKey: 'Montar rascunho no portal',
      bpmnDescription:
        'No portal: escolher a parceria → preencher catálogo → incluir produtos (manual ou CSV). Status fica “Rascunho (parceiro)”. No Atlas, o formulário espelho é “Portal Parceiro — Meus catálogos e produtos”.',
      assigneeRole: 'Parceiro (portal)',
      assigneeRoleDetail: 'Usuário da organização parceira autenticado no portal.',
      bpmnInputs: 'Parceria homologada + planilha ou itens manuais.',
      bpmnOutputs: 'Catálogo/produtos em rascunho com status de fluxo.',
      bpmnRuleList: [
        'Só dados da parceria do usuário logado',
        'Produto pertence a exatamente 1 catálogo',
        'Preço/métrica/grupo/tipo preenchidos antes do envio',
      ],
      bpmnPossiblePaths: [{ key: 'Rascunho pronto', value: 'step-pres-parceiro-enviar' }],
      linkedFormId: 'form-patlasv4-proto-portal-parceiro-catalogo',
      bpmnFormConfirmNavigateStepId: 'step-pres-parceiro-enviar',
    }),
  )

  steps.push(
    htmlStep(
      'step-pres-parceiro-produto-campos',
      '11. O que preencher em cada produto',
      H,
      wrap(
        'Campos essenciais (linguagem simples)',
        'O formulário de produto é uma página só — sem abas escondidas.',
        [
          table(
            ['Campo', 'Para que serve', 'Exemplo'],
            [
              ['Identificador', 'Nome comercial do item', 'Implantação MTI Simplifica'],
              ['Part Number / SKU', 'Código do fabricante/parceiro', 'Q501011'],
              ['Tipo', 'Licença ou Serviço', 'Serviço'],
              ['Grupo', 'Agrupamento para filtro/relatório', 'Implantação'],
              ['Métrica', 'Unidade de consumo/moeda', 'UST'],
              ['Valor unitário', 'Preço base em R$', '22.679'],
              ['Universal / Individualizado', 'Dois interruptores: entra na moeda do catálogo e/ou vende avulso', 'Universal = Sim'],
              ['Catálogo', 'A qual cardápio pertence (obrigatório 1)', 'MTI SIMPLIFICA'],
              ['Unidade DTIC', 'UO MTI responsável', 'DIRC / área técnica'],
            ],
          ),
          box(
            'Markup',
            'O markup (margem MTI × parceiro) <b>não</b> fica no formulário do Produto. Fica em “Dados de Parceria por Produto” (custo do parceiro, % parceiro, % MTI = 100%).',
            C.warn,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-parceiro-enviar',
      title: '12. Parceiro — enviar à MTI',
      bpmnActivityKey: 'Enviar à MTI',
      bpmnDescription:
        'Botão “Enviar à MTI”. Status → Aguardando análise MTI. Edição no portal fica bloqueada até a MTI devolver (ajuste) ou concluir. Mensagem opcional ao analista acompanha o envio.',
      assigneeRole: 'Parceiro (portal)',
      bpmnInputs: 'Rascunho completo ou correção pós-ajuste.',
      bpmnOutputs: 'Pedido visível na análise do backoffice.',
      bpmnRuleList: [
        'Status espelhado imediatamente no backoffice',
        'Parceiro não edita enquanto “Aguardando análise”',
      ],
      bpmnPossiblePaths: [{ key: 'Enviado', value: 'step-pres-mti-analise' }],
      linkedFormId: 'form-patlasv4-proto-portal-parceiro-catalogo',
      bpmnFormConfirmNavigateStepId: 'step-pres-mti-analise',
    }),
  )

  steps.push(
    htmlStep(
      'step-pres-mti-analise-intro',
      '13. Backoffice — chegada da análise',
      H,
      wrap(
        'A MTI trabalha só no backoffice',
        'Classe/formulário: Análise de catálogo / produto (MTI).',
        [
          box(
            'O que a tela mostra',
            ul([
              'Origem: Portal do Parceiro (ou cadastro interno MTI)',
              'Organização e parceria',
              'Status atual do fluxo',
              'Catálogo embutido (somente leitura) + lista de produtos',
              'Decisão: Aprovar · Solicitar ajuste · Reprovar',
              'Assinatura digital obrigatória (quem assinou + data)',
            ]),
            C.mti,
          ),
          box(
            'Campos condicionais',
            ul([
              'Ajuste ou Reprovar → justificativa obrigatória (+ anexo opcional)',
              'Aprovar → observação opcional + flag “Publicar após aprovar”',
            ]),
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-mti-analise',
      title: '14. MTI — decidir o parecer',
      bpmnActivityKey: 'Confirmar decisão da análise',
      bpmnDescription:
        'Analista revisa valores, métricas e CSV. Escolhe a decisão, preenche justificativa se necessário, assina e confirma. O status do fluxo atualiza e aparece no Portal do Parceiro.',
      assigneeRole: 'Analista MTI (backoffice)',
      assigneeRoleDetail: 'Sem acesso operacional via portal do parceiro/cliente para esta decisão.',
      bpmnInputs: 'Catálogo/produtos enviados + mensagem do parceiro.',
      bpmnOutputs: 'Novo status + justificativa/obs + assinatura.',
      bpmnRuleList: [
        'Assinatura obrigatória',
        'Aprovar → Homologado (e Ativo se publicar)',
        'Solicitar ajuste → Ajuste solicitado + justificativa',
        'Reprovar → Reprovado',
      ],
      bpmnPossiblePaths: [
        { key: 'Solicitar ajuste', value: 'step-pres-parceiro-ajuste' },
        { key: 'Aprovar', value: 'step-pres-mti-publicar' },
        { key: 'Reprovar', value: 'step-pres-fim-reprovado' },
      ],
      linkedFormId: 'form-patlasv4-proto-analise-catalogo',
      bpmnSla: '5 dias úteis',
    }),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-parceiro-ajuste',
      title: '15. Parceiro — corrigir e reenviar',
      bpmnActivityKey: 'Tratar ajuste solicitado',
      bpmnDescription:
        'No portal, o catálogo volta editável. A justificativa da MTI aparece em destaque. Parceiro altera produtos/valores (ou reimporta CSV) e envia de novo.',
      assigneeRole: 'Parceiro (portal)',
      bpmnInputs: 'Justificativa MTI (+ anexo).',
      bpmnOutputs: 'Novo envio em Aguardando análise.',
      bpmnRuleList: ['Só edita em Ajuste solicitado ou Rascunho', 'Reenvio reinicia a análise'],
      bpmnPossiblePaths: [{ key: 'Reenviar', value: 'step-pres-parceiro-enviar' }],
      linkedFormId: 'form-patlasv4-proto-portal-parceiro-catalogo',
      bpmnFormConfirmNavigateStepId: 'step-pres-parceiro-enviar',
    }),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-mti-publicar',
      title: '16. MTI — publicar e versionar',
      bpmnActivityKey: 'Publicar / criar nova versão',
      bpmnDescription:
        'No formulário Catálogo (backoffice): método Publicar coloca em Produção; método Criar nova versão copia produtos para vN+1 sem apagar a versão antiga (contratos antigos continuam válidos).',
      assigneeRole: 'Analista MTI (backoffice)',
      bpmnInputs: 'Catálogo homologado.',
      bpmnOutputs: 'Status Ativo (publicado) e/ou nova versão.',
      bpmnRuleList: [
        'Não sobrescrever versão publicada — usar nova versão',
        'Versão anterior permanece para contratos que a referenciam',
        'Cliente ainda não “muda de cardápio” até apostilar (próximo passo)',
      ],
      bpmnPossiblePaths: [{ key: 'Publicado', value: 'step-pres-mti-apostila' }],
      linkedFormId: 'form-patlasv4-proto-cat-catalogo',
      bpmnFormConfirmNavigateStepId: 'step-pres-mti-apostila',
    }),
  )

  steps.push(
    htmlStep(
      'step-pres-mti-apostila',
      '17. MTI — apostilar a versão no contrato',
      H,
      wrap(
        'O elo com o Portal do Cliente',
        'Publicar ≠ cliente já vê a versão nova. O contrato precisa apontar para ela.',
        [
          box(
            'Regra RN-VER-03 (explique para qualquer pessoa)',
            'Imagine que o cliente comprou o cardápio 1.5. A MTI lançou o cardápio 1.7 no sistema. O restaurante já tem o cardápio novo na cozinha, mas a mesa do cliente ainda tem o 1.5 impresso — até alguém trocar formalmente (apostilamento).',
            C.warn,
          ),
          box(
            'Quem faz',
            'Somente MTI no backoffice (gestão contratual / área responsável). Parceiro e cliente não apostilam.',
            C.mti,
          ),
          box(
            'Depois do apostilamento',
            'O Portal do Cliente passa a listar os produtos da nova versão e permitir cotação/OS sobre ela (respeitando o tipo de contrato 1/2/3).',
            C.cli,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-cliente-intro',
      '18. Portal do Cliente — consumo apenas',
      H,
      wrap(
        'Canal exclusivo do cliente (órgão)',
        'URL do protótipo: /portal-cliente.html · npm run dev:portal-cliente',
        [
          box(
            'Mensagem que deve ficar clara na tela',
            '<b>Cliente não cadastra catálogo nem produto.</b> Quem cadastra é o parceiro (portal) e a MTI (backoffice). O cliente consulta e consome.',
            C.cli,
          ),
          table(
            ['Ação do cliente', 'Para que serve'],
            [
              ['Catálogo MTI', 'Ver itens em Produção e o que está no contrato'],
              ['Nova cotação', 'Montar pedido → gera demanda para a MTI'],
              ['Demandas', 'Acompanhar andamento'],
              ['Ordens de serviço', 'Consumir formalmente itens contratados'],
              ['Meus contratos', 'Ver saldo, versão do catálogo, consumo'],
            ],
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    bpmnStep({
      id: 'step-pres-cliente-consumo',
      title: '19. Cliente — consultar e consumir',
      bpmnActivityKey: 'Usar catálogo da versão do contrato',
      bpmnDescription:
        'No portal, o cliente filtra o catálogo (no contrato / ausente), abre cotação ou OS informando contrato + versão. Nada disso altera o cadastro mestre do catálogo.',
      assigneeRole: 'Cliente (portal)',
      bpmnInputs: 'Contrato vigente com versão apostilada.',
      bpmnOutputs: 'Cotação/demanda/OS.',
      bpmnRuleList: [
        'Sem botão de cadastrar produto',
        'Itens fora do contrato aparecem marcados / sem consumo',
        'Tipo 1/2/3 limita o que pode ser consumido',
      ],
      bpmnPossiblePaths: [{ key: 'Consumo ok', value: 'step-pres-espelho' }],
      linkedFormId: 'form-patlasv4-proto-portal-cliente-catalogo',
      bpmnFormConfirmNavigateStepId: 'step-pres-espelho',
    }),
  )

  steps.push(
    htmlStep(
      'step-pres-espelho',
      '20. Como backoffice e portais se conversam',
      H,
      wrap(
        'Mesmo dado, canais diferentes',
        'Não há “cópia manual” entre sistemas no desenho alvo — há um registro único com visões.',
        [
          table(
            ['Evento', 'Onde nasce', 'O que o outro lado vê'],
            [
              ['Salvar rascunho', 'Portal Parceiro', 'Backoffice ainda não trata como fila de análise'],
              ['Enviar à MTI', 'Portal Parceiro', 'Backoffice: item na análise / status Aguardando'],
              ['Solicitar ajuste', 'Backoffice', 'Portal: status Ajuste + justificativa'],
              ['Aprovar / Publicar', 'Backoffice', 'Portal: Homologado / Ativo'],
              ['Apostilar', 'Backoffice', 'Portal Cliente: nova versão disponível'],
              ['Cotação / OS', 'Portal Cliente', 'Backoffice/operações: demanda e consumo'],
            ],
          ),
          box(
            'Protótipo',
            'No Portal do Parceiro há botões “Simular backoffice MTI” só para demonstração. Em produção a MTI usa exclusivamente o backoffice.',
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-checklist',
      '21. Checklist de configuração e go-live',
      H,
      wrap(
        'Antes de liberar o fluxo real',
        'Use como roteiro de implantação / homologação.',
        [
          box(
            'Backoffice MTI',
            ol([
              'Metadados ativos (métrica, cobrança, grupo, modelo de venda)',
              'Organização parceiro homologada (Fase 1)',
              'Parceria criada e status correto',
              'Soluções cadastradas',
              'Usuários MTI com permissão de Análise / Publicar / Nova versão',
              'Classe Análise de catálogo disponível no workspace',
              'Template CSV oficial publicado para o parceiro',
            ]),
            C.mti,
          ),
          box(
            'Portal Parceiro',
            ol([
              'Usuários do parceiro com acesso só às suas parcerias',
              'Telas: listagem, detalhe, envio, ajuste',
              'Mensagens de status compreensíveis',
              'Bloqueio de edição em “Aguardando análise”',
            ]),
            C.parc,
          ),
          box(
            'Portal Cliente',
            ol([
              'Aviso visível: não cadastra catálogo',
              'Contrato mostra versão do catálogo',
              'Catálogo filtra contratado vs ausente',
              'Cotação e OS amarradas à versão',
            ]),
            C.cli,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-erros',
      '22. Erros comuns e como explicar',
      H,
      wrap(
        'Perguntas que sempre aparecem',
        '',
        [
          box(
            '“Por que o cliente não vê o produto que acabei de publicar?”',
            'Porque publicar coloca em Produção, mas o contrato dele ainda aponta para a versão antiga. Falta apostilar (RN-VER-03).',
            C.warn,
          ),
          box(
            '“O parceiro pode aprovar o próprio catálogo?”',
            'Não. Parecer é exclusivo da MTI no backoffice.',
            C.warn,
          ),
          box(
            '“Posso editar a versão 1.5 que já está em contrato?”',
            'Não sobrescreva. Crie a versão 1.6/1.7. Contratos antigos continuam na 1.5.',
            C.warn,
          ),
          box(
            '“Markup no produto?”',
            'Não. Use Dados de Parceria por Produto (% parceiro + % MTI = 100).',
            C.warn,
          ),
          box(
            '“Cliente pediu para incluir um item novo no portal dele”',
            'Orientar: item nasce no parceiro/MTI; depois de homologar/publicar/apostilar, o cliente consome.',
            C.ok,
          ),
        ].join(''),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-fim-reprovado',
      'Fim alternativo — reprovado',
      H,
      wrap(
        'Quando a MTI reprova',
        'Status Reprovado espelha no Portal do Parceiro. O ciclo daquele envio encerra.',
        box(
          'Próximo passo possível',
          'Parceiro abre novo rascunho (ou corrige estruturalmente) e inicia novo envio. A justificativa da reprovação deve permanecer auditável.',
          C.warn,
        ),
      ),
    ),
  )

  steps.push(
    htmlStep(
      'step-pres-resumo',
      '23. Resumo final',
      H,
      wrap(
        'Em uma página',
        '',
        [
          table(
            ['Canal', 'Ações'],
            [
              [
                '<b>Portal Parceiro</b>',
                'Rascunho · CSV · Enviar · Corrigir ajuste · Ver status',
              ],
              [
                '<b>Backoffice MTI</b>',
                'Metadados · Parceria · Análise · Publicar · Nova versão · Apostilar',
              ],
              [
                '<b>Portal Cliente</b>',
                'Consultar versão do contrato · Cotação · Demanda · OS — sem cadastro de catálogo',
              ],
            ],
          ),
          box(
            'Frase para levar',
            'Parceiro monta e envia · MTI decide e publica · Cliente consome a versão do contrato.',
            C.ok,
          ),
          box(
            'Onde praticar no protótipo',
            ul([
              'Fluxo Atlas: <code>flow-proto-catalogo-portal-mti-cliente</code>',
              'Portal parceiro: <code>npm run dev:portal-parceiro</code>',
              'Portal cliente: <code>npm run dev:portal-cliente</code>',
              'Spec: <code>exports/especificacao-catalogo-produtos-atlas.md</code>',
              'Esta apresentação HTML: <code>exports/apresentacao-catalogo-portais-backoffice.html</code>',
            ]),
            C.neut,
          ),
        ].join(''),
      ),
    ),
  )

  return {
    id: FLOW_ID,
    name: 'Apresentação — Catálogo: Backoffice + Portais (passo a passo)',
    metadata:
      'Apresentação didática completa (leigo → operacional). Configuração MTI, fluxo parceiro→análise→publicação→apostila→consumo cliente. Forms e portais do protótipo atlas-prototipo.',
    steps,
  }
}

function collectLinkedFormIds(seedIds, forms) {
  const formById = new Map(forms.map((f) => [f.id, f]))
  const out = new Set(seedIds.filter((id) => formById.has(id)))
  const queue = [...out]
  while (queue.length) {
    const id = queue.shift()
    const form = formById.get(id)
    if (!form) continue
    for (const field of form.fields ?? []) {
      if (field.linkedFormId && formById.has(field.linkedFormId) && !out.has(field.linkedFormId)) {
        out.add(field.linkedFormId)
        queue.push(field.linkedFormId)
      }
    }
    for (const method of form.methods ?? []) {
      if (method.inputFormId && formById.has(method.inputFormId) && !out.has(method.inputFormId)) {
        out.add(method.inputFormId)
        queue.push(method.inputFormId)
      }
    }
  }
  return [...out]
}

function buildStandaloneHtml(flow) {
  const toc = flow.steps
    .map((s, i) => `<li><a href="#s${i}">${escapeHtml(s.title)}</a></li>`)
    .join('\n')

  const sections = flow.steps
    .map((s, i) => {
      let body = ''
      if (s.type === 'html') {
        body = s.htmlContent
      } else {
        body = wrap(
          escapeHtml(s.title),
          escapeHtml(s.bpmnDescription || ''),
          [
            box('Responsável', escapeHtml(s.assigneeRole || '—'), C.neut),
            s.bpmnInputs ? box('Entradas', escapeHtml(s.bpmnInputs), C.neut) : '',
            s.bpmnOutputs ? box('Saídas', escapeHtml(s.bpmnOutputs), C.ok) : '',
            s.bpmnRuleList?.length
              ? box('Regras', ul(s.bpmnRuleList.map(escapeHtml)), C.warn)
              : '',
            s.linkedFormId
              ? box(
                  'Formulário no protótipo',
                  `<code>${escapeHtml(s.linkedFormId)}</code>`,
                  C.mti,
                )
              : '',
            s.bpmnPossiblePaths?.length
              ? box(
                  'Caminhos',
                  ul(s.bpmnPossiblePaths.map((p) => `<b>${escapeHtml(p.key)}</b> → ${escapeHtml(p.value)}`)),
                  C.neut,
                )
              : '',
          ].join(''),
        )
      }
      return `<section id="s${i}"><div class="slide-num">Etapa ${i + 1} de ${flow.steps.length}</div>${body}</section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Apresentação — Catálogo Atlas: Backoffice + Portais</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600&display=swap" rel="stylesheet"/>
<style>
:root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#eef2f7;--paper:#fff;--brand:#0c1ba8;--brand-soft:#eef2ff}
*{box-sizing:border-box} html{scroll-behavior:smooth}
body{margin:0;font-family:"IBM Plex Sans",system-ui,sans-serif;background:var(--bg);color:var(--ink);line-height:1.55;font-size:15px}
a{color:var(--brand);text-decoration:none} a:hover{text-decoration:underline}
.top{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top-inner{max-width:1120px;margin:0 auto;padding:10px 20px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
.brand{font-weight:700;font-size:13px;color:var(--brand)}
.btn{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:8px 12px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;color:var(--ink);text-decoration:none}
.btn.primary{background:var(--brand);border-color:var(--brand);color:#fff}
.layout{max-width:1120px;margin:0 auto;padding:24px 20px 80px;display:grid;grid-template-columns:240px minmax(0,1fr);gap:22px}
.toc{position:sticky;top:58px;align-self:start;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 12px;max-height:calc(100vh - 70px);overflow:auto;font-size:12px}
.toc h2{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.toc ol{margin:0;padding-left:16px}.toc li{margin:0 0 5px}.toc a{color:#334155}
.sheet{background:var(--paper);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,.06)}
.cover{background:linear-gradient(145deg,#07145c 0%,#0c1ba8 55%,#1d4ed8 100%);color:#fff;padding:36px 40px}
.cover h1{font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(22px,3vw,32px);margin:0 0 10px;line-height:1.2}
.cover p{margin:0;opacity:.93;max-width:65ch}
.body{padding:28px 40px 48px}
section{margin:0 0 40px;padding-bottom:28px;border-bottom:1px solid var(--line);scroll-margin-top:70px}
section:last-child{border-bottom:none}
.slide-num{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}
@media(max-width:920px){.layout{grid-template-columns:1fr}.toc{position:static;max-height:none}.cover,.body{padding:22px 18px}}
@media print{.top,.toc,.btn{display:none!important}.layout{display:block;padding:0}.sheet{box-shadow:none;border:none} section{break-inside:avoid}}
</style>
</head>
<body>
<header class="top"><div class="top-inner">
  <div class="brand">Atlas · Catálogo · Backoffice + Portais</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <a class="btn" href="../portal-parceiro.html">Portal Parceiro</a>
    <a class="btn" href="../portal-cliente.html">Portal Cliente</a>
    <button class="btn primary" type="button" onclick="window.print()">Imprimir / PDF</button>
  </div>
</div></header>
<div class="layout">
<aside class="toc" aria-label="Sumário"><h2>Sumário</h2><ol>${toc}</ol></aside>
<div class="sheet">
  <div class="cover">
    <h1>Catálogo Atlas: do cadastro ao consumo</h1>
    <p>Apresentação passo a passo — configuração no backoffice MTI, envio pelo Portal do Parceiro e consumo no Portal do Cliente. Feita para quem não conhece o fluxo.</p>
  </div>
  <div class="body">${sections}</div>
</div>
</div>
</body>
</html>`
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function main() {
  const flow = buildFlow()
  const flowsPath = path.join(epicDir, 'flows.json')
  const flows = JSON.parse(fs.readFileSync(flowsPath, 'utf8'))
  const idx = flows.findIndex((f) => f.id === FLOW_ID)
  if (idx >= 0) flows[idx] = flow
  else flows.unshift(flow)
  fs.writeFileSync(flowsPath, `${JSON.stringify(flows, null, 2)}\n`, 'utf8')
  console.log('Flow atualizado:', FLOW_ID, '—', flow.steps.length, 'etapas')

  const forms = JSON.parse(fs.readFileSync(path.join(epicDir, 'forms.json'), 'utf8'))
  const workspaces = JSON.parse(fs.readFileSync(path.join(epicDir, 'workspaces.json'), 'utf8'))
  const portals = JSON.parse(fs.readFileSync(path.join(epicDir, 'portals.json'), 'utf8'))

  const linked = collectLinkedFormIds(
    flow.steps.map((s) => s.linkedFormId).filter(Boolean),
    forms,
  )
  const formsBundle = forms.filter((f) => linked.includes(f.id))

  const payload = {
    version: 1,
    meta: {
      epicName: 'Atlas protótipo',
      flowName: flow.name,
      exportedAt: new Date().toISOString(),
    },
    bundle: { forms: formsBundle, workspaces, portals },
    flow,
    initialStepId: flow.steps[0]?.id,
  }

  const presDir = path.join(root, 'exports/presentations')
  fs.mkdirSync(presDir, { recursive: true })
  const jsonPath = path.join(presDir, `${BASE}-presentation.json`)
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log('Wrote', jsonPath)

  const htmlPath = path.join(root, 'exports/apresentacao-catalogo-portais-backoffice.html')
  fs.writeFileSync(htmlPath, buildStandaloneHtml(flow), 'utf8')
  console.log('Wrote', htmlPath)

  if (wantZip) {
    const distPres = path.join(root, 'dist/presentation.html')
    if (!fs.existsSync(distPres)) {
      console.log('Executando npm run build...')
      const r = spawnSync('npm', ['run', 'build'], { cwd: root, shell: true, stdio: 'inherit' })
      if (r.status !== 0) process.exit(r.status ?? 1)
    }
    const z = spawnSync(process.execPath, [path.join(__dirname, 'zip-presentation-export.mjs'), jsonPath], {
      cwd: root,
      stdio: 'inherit',
    })
    if (z.status !== 0) process.exit(z.status ?? 1)
    console.log(`ZIP: exports/zips/${BASE}-presentation.zip`)
  }
}

main()
