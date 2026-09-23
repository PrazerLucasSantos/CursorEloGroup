/**
 * Alinha épico ao FigJam:
 * https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl (PROCON-Nao-e-Nao — Fluxo Completo LR)
 *
 * node scripts/align-nnseplag-figjam.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const epicDir = path.join(
  root,
  'data/subprojects/nao-e-nao-seplag/epics/projeto-nao-e-nao-seplag-v1',
)

const FIGJAM =
  'https://www.figma.com/board/txWrswjvhQUdxYb1Ojmdtl/PROCON-Nao-e-Nao---Fluxo-Completo-LR'

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function syncMirrors() {
  const abs = [
    path.join(
      'C:\\Users\\LucasSantos\\OneDrive - EloGroup\\Área de Trabalho\\Cursor\\espec-sydle-run\\data\\subprojects\\nao-e-nao-seplag\\epics\\projeto-nao-e-nao-seplag-v1',
    ),
    path.join(
      'C:\\Users\\LucasSantos\\OneDrive - EloGroup\\Área de Trabalho\\Cursor\\Projetos-Complexos\\nao-e-nao-seplag\\data\\nao-e-nao-seplag\\epics\\projeto-nao-e-nao-seplag-v1',
    ),
  ]
  for (const dst of abs) {
    fs.mkdirSync(dst, { recursive: true })
    for (const name of ['forms.json', 'flows.json', 'context.md', 'workspaces.json']) {
      const src = path.join(epicDir, name)
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dst, name))
    }
    console.log('synced', dst)
  }
}

function buildFlow() {
  return [
    {
      id: 'flow-nen-prototipo-completo',
      name: 'Protótipo completo — Selo Não é Não (FigJam LR)',
      metadata: `Espelha o FigJam Fluxo Completo LR. Fonte: ${FIGJAM}. Escopo 10/09 aplicado (sem denúncia). Validade: FigJam mostra 12 meses; minuta/PDF/ata = 24 meses (prevalece decreto até confirmação).`,
      steps: [
        {
          id: 'step-nen-capa',
          title: 'Capa',
          type: 'html',
          htmlPresentationShowHeader: true,
          htmlPresentationHeaderTitle: 'Não é Não — Seplag v1',
          htmlContent: `<div style="padding:28px 48px;max-width:980px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;color:#0f172a;line-height:1.55;">
  <div style="font-size:0.75rem;color:#9d174d;font-weight:700;text-transform:uppercase;">FigJam · Fluxo Completo LR</div>
  <h1 style="font-size:1.7rem;margin:8px 0 12px;color:#9d174d;">Selo “Não é Não – Mulheres Seguras”</h1>
  <p>Protótipo alinhado ao board FigJam (6 seções) + decisões 03/09 e 10/09.</p>
  <ol style="padding-left:18px;color:#334155;">
    <li>Acesso e empresa (MT Login → JUCEMAT → seleção)</li>
    <li>Solicitação (formulário → revisão → PROTOCOLADO)</li>
    <li>Pré-análise PROCON (conclusão: ajustes 5 dias <em>ou</em> pronto)</li>
    <li>Decisão (deferir / indeferir → recurso?)</li>
    <li>Emissão (classe Selo + Validador MT + notificações)</li>
    <li>Pós-concessão (renovar / cancelar / revogar backoffice)</li>
  </ol>
  <p style="font-size:0.9rem;"><a href="${FIGJAM}" target="_blank" rel="noreferrer">Abrir FigJam</a></p>
</div>`,
        },
        {
          id: 'step-nen-escopo',
          title: 'Escopo (10/09 + FigJam)',
          type: 'html',
          htmlPresentationShowHeader: true,
          htmlPresentationHeaderTitle: 'Escopo',
          htmlContent: `<div style="padding:28px 48px;max-width:980px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;line-height:1.55;color:#0f172a;">
  <h1 style="color:#9d174d;font-size:1.5rem;">1 serviço — alinhado ao FigJam</h1>
  <div style="border-left:4px solid #9d174d;background:#fdf2f8;padding:14px 18px;border-radius:8px;margin-bottom:12px;">
    <strong>No FigJam / MVP:</strong> acesso, solicitação, pré-análise, diligência (ajustes), decisão, recurso, emissão, renovação, cancelamento, revogação (só backoffice).
  </div>
  <div style="border-left:4px solid #64748b;background:#f8fafc;padding:14px 18px;border-radius:8px;margin-bottom:12px;">
    <strong>Fora (ata 10/09):</strong> denúncia/fiscalização/apuração na plataforma. Revogar = método backoffice + sai da lista pública.
  </div>
  <div style="border-left:4px solid #b45309;background:#fffbeb;padding:14px 18px;border-radius:8px;">
    <strong>Atenção — validade:</strong> FigJam marca «VIGENTE 12 meses»; minuta do decreto / PDF / ata 03/09 = <strong>24 meses</strong>. Protótipo usa <strong>24 meses</strong> até o decreto fechar; parâmetro deve ser configurável.
  </div>
</div>`,
        },
        {
          id: 'step-nen-portal',
          title: 'Portal do estabelecimento',
          type: 'servicePortal',
          linkedPortalId: 'portal-nen-estabelecimentos',
          servicePortalServiceNavigateStepIds: {
            'svc-nen-solicitar': 'step-nen-acesso',
            'svc-nen-acompanhar': 'step-nen-ws',
          },
        },
        // —— FigJam §1 Acesso e empresa ——
        {
          id: 'step-nen-acesso',
          title: '1. Acesso e empresa (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'MT Login → JUCEMAT → seleciona estabelecimento',
          bpmnDescription:
            'FigJam §1: Início → MT Login → JUCEMAT lista empresas → Seleciona estabelecimento. Documento de representação quando necessário.',
          assigneeRole: 'Solicitante (estabelecimento)',
          bpmnInputs: 'MT Login; lista JUCEMAT; opcional doc. de representação.',
          bpmnOutputs: 'Estabelecimento vinculado ao requerimento.',
          bpmnRuleList: [
            'Somente empresas da JUCEMAT',
            'Requerimento por unidade',
            'Elegibilidade sócio/representante/filial: pendência de negócio',
          ],
          bpmnPossiblePaths: [{ key: 'Estabelecimento selecionado', value: 'step-nen-solicitacao' }],
          linkedFormId: 'form-nen-acesso',
          bpmnFormConfirmNavigateStepId: 'step-nen-solicitacao',
        },
        // —— FigJam §2 Solicitação ——
        {
          id: 'step-nen-solicitacao',
          title: '2. Formulário de Solicitação (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Formulário de Solicitação',
          bpmnDescription:
            'FigJam §2: Formulário de Solicitação → Revisa respostas e anexos → Protocolar → PROTOCOLADO.',
          assigneeRole: 'Solicitante (estabelecimento)',
          bpmnRuleList: [
            'Bloquear protocolização se obrigatórios faltarem',
            'Gera nº de protocolo, data/hora e comprovante',
          ],
          bpmnPossiblePaths: [{ key: 'Revisar', value: 'step-nen-revisao' }],
          linkedFormId: 'form-nen-solicitacao',
          bpmnFormConfirmNavigateStepId: 'step-nen-revisao',
        },
        {
          id: 'step-nen-revisao',
          title: '2b. Revisa e Protocolar → PROTOCOLADO',
          type: 'bpmnActivity',
          bpmnTaskType: 'userTask',
          bpmnActivityKey: 'Revisa respostas e anexos / Protocolar',
          bpmnDescription:
            'FigJam §2: Revisa respostas e anexos → Protocolar → status PROTOCOLADO. Notifica área PROCON.',
          assigneeRole: 'Solicitante (estabelecimento)',
          bpmnOutputs: 'Pedido PROTOCOLADO',
          bpmnPossiblePaths: [{ key: 'PROTOCOLADO', value: 'step-nen-analise' }],
          linkedFormId: 'form-nen-solicitacao',
          bpmnFormConfirmNavigateStepId: 'step-nen-analise',
        },
        // —— FigJam §3 Pré Análise ——
        {
          id: 'step-nen-analise',
          title: '3. Pré-análise PROCON — Formulário de Análise',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Formulario de Analise / Conclusao',
          bpmnDescription:
            'FigJam §3: Formulário de Análise → diamante Conclusão. Caminhos: «Não conforme» → Formulário de Ajustes; «Pronto» → Decisão da autoridade. Papéis: primeira análise (analista) e análise final / aprovador (autoridade) — modelados como EM ANÁLISE → PRONTO PARA DECISÃO.',
          assigneeRole: 'Analista PROCON',
          bpmnRuleList: [
            'Checklist: Conforme / Não conforme / Necessita complementação',
            'Diligência única — todas as pendências de uma vez',
            'Não deferir com item obrigatório «não conforme»',
          ],
          bpmnPossiblePaths: [
            { key: 'Não conforme → Ajustes', value: 'step-nen-ajustes' },
            { key: 'Pronto → Decisão', value: 'step-nen-decisao' },
          ],
          linkedFormId: 'form-nen-analise-decisao',
          bpmnFormConfirmNavigateStepId: 'step-nen-ajustes',
        },
        {
          id: 'step-nen-ajustes',
          title: '3b. Ajustes / diligência 5 dias (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Formulario de Ajustes → Notifica → Complementa em 5 dias',
          bpmnDescription:
            'FigJam §3: Formulário de Ajustes → Notifica solicitante → Complementa em 5 dias → retorna ao Formulário de Análise. Status EM DILIGÊNCIA; depois RESPONDIDA ou NÃO RESPONDIDA. Sem indeferimento automático.',
          assigneeRole: 'Solicitante (estabelecimento) / Analista',
          bpmnRuleList: [
            'Notificar solicitante na abertura da diligência',
            'Prazo 5 dias (Lei 7.692/2002)',
            'Volta para análise após resposta ou expiração',
          ],
          bpmnPossiblePaths: [
            { key: 'Complementado → Análise', value: 'step-nen-analise' },
            { key: 'Pronto para decisão', value: 'step-nen-decisao' },
          ],
          linkedFormId: 'form-nen-analise-decisao',
          bpmnFormConfirmNavigateStepId: 'step-nen-analise',
        },
        // —— FigJam §4 Decisão ——
        {
          id: 'step-nen-decisao',
          title: '4. Decisão — Deferir? (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Deferir? / Decisão da autoridade',
          bpmnDescription:
            'FigJam §4: diamante Deferir? Sim → Template Certificado + QR (emissão). Não → INDEFERIDO → diamante Recurso?',
          assigneeRole: 'Autoridade PROCON (aprovador)',
          bpmnRuleList: [
            'Bloquear deferimento se checklist tiver «Não conforme»',
            'Indeferimento com parecer, requisitos e fundamentos + info de recurso',
          ],
          bpmnPossiblePaths: [
            { key: 'Sim → Emissão', value: 'step-nen-certificado' },
            { key: 'Não → INDEFERIDO / Recurso?', value: 'step-nen-recurso' },
          ],
          linkedFormId: 'form-nen-analise-decisao',
          bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
        },
        {
          id: 'step-nen-recurso',
          title: '4b. Recurso? (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Recurso? → Formulário / Provido?',
          bpmnDescription:
            'FigJam §4: Recurso? Não → Finalizado. Sim → Formulário de Recurso → Provido? Sim → Certificado+QR; Não → Finalizado. (Overlay do board: «solicitante entrou com recurso?» → reanálise ou reprovado/encerrado.)',
          assigneeRole: 'Solicitante / Autoridade PROCON',
          bpmnPossiblePaths: [
            { key: 'Sem recurso → Finalizado', value: 'step-nen-pos' },
            { key: 'Provido → Emissão', value: 'step-nen-certificado' },
            { key: 'Não provido → Finalizado', value: 'step-nen-pos' },
          ],
          linkedFormId: 'form-nen-analise-decisao',
          bpmnFormConfirmNavigateStepId: 'step-nen-certificado',
        },
        // —— FigJam §5 Emissão ——
        {
          id: 'step-nen-certificado',
          title: '5. Emissão — Certificado + QR + Selo (FigJam)',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Template Certificado + QR / Classe Estabelecimentos com Selo',
          bpmnDescription:
            'FigJam §5: Template Certificado + QR → Validador MT; Classe Estabelecimentos com Selo; Notifica servidor; Notifica resultado ao solicitante; status VIGENTE. (FigJam: 12 meses | decreto/PDF: 24 meses — usar 24 até confirmação.)',
          assigneeRole: 'Sistema / PROCON',
          bpmnOutputs: 'Selo VIGENTE + certificado com QR Validador MT + notificações',
          bpmnRuleList: [
            'Registrar na classe Estabelecimentos com Selo',
            'QR aponta ao Validador MT',
            'Notificar servidor PROCON e solicitante do resultado',
            'Incluir na lista pública (MVP: exportação)',
          ],
          bpmnPossiblePaths: [{ key: 'VIGENTE → Pós-concessão', value: 'step-nen-pos' }],
          linkedFormId: 'form-nen-estabelecimento-selo',
          bpmnFormConfirmNavigateStepId: 'step-nen-pos',
        },
        // —— FigJam §6 Pós ——
        {
          id: 'step-nen-pos',
          title: '6. Pós-concessão (FigJam)',
          type: 'html',
          htmlPresentationShowHeader: true,
          htmlPresentationHeaderTitle: 'Pós-concessão',
          htmlContent: `<div style="padding:28px 48px;max-width:900px;margin:0 auto;font-family:Segoe UI,system-ui,sans-serif;line-height:1.55;color:#0f172a;">
  <h1 style="color:#9d174d;font-size:1.5rem;">FigJam §6 — Pós-concessão</h1>
  <p><strong>Notificação próximo ao vencimento</strong> → diamante Ação:</p>
  <ul>
    <li><strong>Renovar</strong> → Formulário de Renovação → volta a <em>PROTOCOLADO</em> (mesmo ciclo de análise).</li>
    <li><strong>Cancelar</strong> → status CANCELADO → <em>Sai da lista pública</em>.</li>
    <li><strong>Revogar / somente backoffice</strong> → status REVOGADO → <em>Sai da lista pública</em> (sem módulo de denúncia no sistema).</li>
  </ul>
</div>`,
        },
        {
          id: 'step-nen-renovacao',
          title: '6a. Renovar → Formulário de Renovação',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Formulario de Renovacao',
          bpmnDescription:
            'FigJam §6: Renovar → Formulário de Renovação → reconecta a PROTOCOLADO (ciclo de análise novamente).',
          assigneeRole: 'Solicitante (estabelecimento)',
          bpmnPossiblePaths: [{ key: 'Protocolado → Análise', value: 'step-nen-analise' }],
          linkedFormId: 'form-nen-renovacao',
          bpmnFormConfirmNavigateStepId: 'step-nen-analise',
        },
        {
          id: 'step-nen-cancelamento',
          title: '6b. Cancelar → CANCELADO → sai lista',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Metodo Cancelamento',
          bpmnDescription:
            'FigJam §6: Método Cancelamento → CANCELADO → Sai da lista pública.',
          assigneeRole: 'Solicitante (estabelecimento)',
          bpmnPossiblePaths: [{ key: 'Sai da lista pública', value: 'step-nen-lista' }],
          linkedFormId: 'form-nen-cancelamento',
          bpmnFormConfirmNavigateStepId: 'step-nen-lista',
        },
        {
          id: 'step-nen-revogacao',
          title: '6c. Revogar (só backoffice) → REVOGADO',
          type: 'bpmnActivity',
          bpmnTaskType: 'entryForm',
          bpmnActivityKey: 'Metodo Revogacao / somente backoffice',
          bpmnDescription:
            'FigJam §6: Revogar/somente backoffice → REVOGADO → Sai da lista pública. Apuração fora do sistema (ata 10/09).',
          assigneeRole: 'PROCON (backoffice)',
          bpmnPossiblePaths: [{ key: 'Sai da lista pública', value: 'step-nen-lista' }],
          linkedFormId: 'form-nen-revogacao',
          bpmnFormConfirmNavigateStepId: 'step-nen-lista',
        },
        {
          id: 'step-nen-lista',
          title: 'Lista pública / exportação de selos',
          type: 'class',
          linkedFormId: 'form-nen-estabelecimento-selo',
          classPresentationTitle: 'Estabelecimentos com Selo',
          classPresentationDescription:
            'FigJam: Classe Estabelecimentos com Selo + sai da lista pública em cancelamento/revogação. MVP: filtrar/exportar. API futura.',
        },
        {
          id: 'step-nen-ws',
          title: 'Workspace PROCON',
          type: 'workspace',
          linkedWorkspaceId: 'ws-nen-procon',
        },
      ],
    },
  ]
}

function patchForms(forms) {
  const ad = forms.find((f) => f.id === 'form-nen-analise-decisao')
  if (ad) {
    ad.metadata =
      'FigJam §3–4: Formulário de Análise → Conclusão (Não conforme→Ajustes 5 dias | Pronto→Decisão). ' +
      'Overlay do board: primeira análise → (ajustar | tudo certo | necessidade de ajuste) → análise final → aprovador/reprovar → recurso?. ' +
      'Status via métodos. Deferimento bloqueado se «Não conforme». Denúncia fora (10/09).'
    const alerta = ad.fields.find((f) => f.id === 'nen-ad-alerta-fluxo')
    if (alerta) {
      alerta.demoValue =
        'FigJam: Conclusão = «Não conforme» (diligência/ajustes + notifica + 5 dias) ou «Pronto» (decisão da autoridade/aprovador). Após indeferir: Recurso? Não→Finalizado; Sim→julgar (Provido→certificado | Não→Finalizado).'
      alerta.alertVariant = 'info'
    }
    // Explicit notify field on diligência
    if (!ad.fields.some((f) => f.id === 'nen-ad-notif-diligencia')) {
      ad.fields.push({
        id: 'nen-ad-notif-diligencia',
        label: 'Notificação ao solicitante (diligência)',
        type: 'alert',
        alertVariant: 'warning',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'normal',
        hidden: true,
        sectionId: 'sec-nen-ad-diligencia',
        spec: 'FigJam §3: após Formulário de Ajustes → Notifica solicitante → Complementa em 5 dias.',
        demoValue:
          'Solicitante notificado pela plataforma para complementar em até 5 dias (Lei 7.692/2002).',
      })
    }
    // Ensure visibility includes notif on diligencia statuses
    const dilRuleIds = [
      'rule-nen-ad-diligencia',
      'rule-nen-ad-dil-resp',
      'rule-nen-ad-dil-nao',
    ]
    for (const r of ad.fieldVisibilityRules || []) {
      if (dilRuleIds.includes(r.id) && !r.targetFieldIds.includes('nen-ad-notif-diligencia')) {
        r.targetFieldIds.push('nen-ad-notif-diligencia')
      }
    }
  }

  const selo = forms.find((f) => f.id === 'form-nen-estabelecimento-selo')
  if (selo) {
    selo.name = 'Estabelecimentos com Selo'
    selo.metadata =
      'FigJam §5: Classe Estabelecimentos com Selo + Validador MT + notificações (servidor e solicitante) + VIGENTE. ' +
      'Validade: FigJam 12 meses vs decreto/PDF 24 meses — protótipo usa 24 até confirmação. ' +
      '§6: cancelar/revogar → sai da lista pública.'
    const val = selo.fields.find((f) => f.id === 'nen-est-validade')
    if (val) {
      val.spec =
        'Concessão + 24 meses (minuta/PDF/ata). FigJam exibe 12 meses — divergência a confirmar no decreto. Parâmetro deve ser configurável.'
    }
    if (!selo.fields.some((f) => f.id === 'nen-est-notif-emissao')) {
      selo.fields.push({
        id: 'nen-est-notif-emissao',
        label: 'Notificações na emissão (FigJam §5)',
        type: 'alert',
        alertVariant: 'info',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'normal',
        sectionId: selo.sections?.[0]?.id,
        spec: 'FigJam: Notifica servidor + Notifica resultado ao solicitante.',
        demoValue:
          'Ao emitir: notificar servidor PROCON e o solicitante do resultado (deferido / certificado disponível).',
      })
    }
    if (!selo.fields.some((f) => f.id === 'nen-est-lista-publica')) {
      selo.fields.push({
        id: 'nen-est-lista-publica',
        label: 'Lista pública',
        type: 'alert',
        alertVariant: 'warning',
        size: 'medium',
        readOnly: true,
        required: false,
        multiple: false,
        relevance: 'normal',
        spec: 'FigJam §6: CANCELADO/REVOGADO → Sai da lista pública. MVP via exportação.',
        demoValue:
          'VIGENTE entra na lista «Local Seguro para Mulheres» (exportação MVP). CANCELADO A PEDIDO / REVOGADO → sai da lista.',
      })
    }
    for (const m of selo.methods || []) {
      if (m.id === 'nen-est-cancelar') {
        m.spec =
          'FigJam: Método Cancelamento → CANCELADO → Sai da lista pública. Só VIGENTE.'
      }
      if (m.id === 'nen-est-revogar') {
        m.spec =
          'FigJam: Revogar/somente backoffice → REVOGADO → Sai da lista pública. Sem notificar de novo (ata 10/09).'
      }
      if (m.id === 'nen-est-renovar') {
        m.spec =
          'FigJam: Renovar → Formulário de Renovação → retorna ao ciclo PROTOCOLADO/análise. Notificação prévia ao vencimento.'
      }
    }
  }

  // Rename workspace class if needed happens in workspaces
  const ren = forms.find((f) => f.id === 'form-nen-renovacao')
  if (ren) {
    ren.metadata =
      'FigJam §6: Formulário de Renovação → reconecta a PROTOCOLADO e segue o mesmo fluxo de análise. Notificação próximo ao vencimento.'
  }

  const can = forms.find((f) => f.id === 'form-nen-cancelamento')
  if (can) {
    can.metadata =
      'FigJam §6: Método Cancelamento → CANCELADO → Sai da lista pública.'
    const alerta = can.fields?.find((f) => /alerta/i.test(f.id))
    if (alerta) {
      alerta.demoValue =
        'Após confirmação: status CANCELADO A PEDIDO e remoção da lista pública «Local Seguro para Mulheres».'
    }
  }

  const rev = forms.find((f) => f.id === 'form-nen-revogacao')
  if (rev) {
    rev.metadata =
      'FigJam §6: Método Revogação / somente backoffice → REVOGADO → Sai da lista pública.'
  }

  const sol = forms.find((f) => f.id === 'form-nen-solicitacao')
  if (sol) {
    sol.metadata =
      (sol.metadata || '') +
      ' FigJam §2: Formulário → Revisa respostas e anexos → Protocolar → PROTOCOLADO.'
  }

  return forms
}

function patchWorkspaces(ws) {
  for (const w of ws) {
    for (const pkg of w.packages || []) {
      for (const cls of pkg.classes || []) {
        if (cls.linkedFormId === 'form-nen-estabelecimento-selo') {
          cls.name = 'Estabelecimentos com Selo'
        }
      }
    }
  }
  return ws
}

function writeContext(prev) {
  const md = `# Projeto Não é Não - Seplag v1

## Fontes
1. **FigJam Fluxo Completo LR** — ${FIGJAM}
2. Reunião 03/09/2026 (fluxo macro, Validador MT, JUCEMAT, 24 meses na minuta)
3. Reunião 10/09/2026 (1 serviço; sem denúncia; revogação operacional)
4. PDF fluxo 04/09/2026 (detalhe de campos; §§16–19 fora por 10/09)

## FigJam — mapa das 6 seções

| # | Seção FigJam | Protótipo |
|---|--------------|-----------|
| 1 | Acesso e empresa: Início → MT Login → JUCEMAT → Seleciona | \`form-nen-acesso\` |
| 2 | Solicitação: Form → Revisa → Protocolar → PROTOCOLADO | \`form-nen-solicitacao\` |
| 3 | Pré-análise: Análise → Conclusão (Não conforme→Ajustes+Notifica+5 dias / Pronto→Decisão) | \`form-nen-analise-decisao\` |
| 4 | Decisão: Deferir? → Certificado+QR **ou** INDEFERIDO → Recurso? → Provido?/Finalizado | mesma classe + emissão |
| 5 | Emissão: Validador MT · Classe Estabelecimentos · Notifica servidor · Notifica solicitante · VIGENTE | \`form-nen-estabelecimento-selo\` |
| 6 | Pós: aviso vencimento → Renovar / Cancelar / Revogar(backoffice) → sai lista pública | renovação/cancelamento/revogação |

Overlay do board (análise refinada): primeira análise → ajustar | tudo certo | necessidade de ajuste → análise final → aprovador/reprovar → «solicitante entrou com recurso?».

## Divergência tratada
- **Validade:** FigJam = 12 meses; minuta/PDF/ata = **24 meses**. Protótipo permanece em **24 meses** até o decreto fechar (campo/spec documentam a divergência).
- **CANCELADO** (FigJam) = **CANCELADO A PEDIDO** no modelo (mais preciso, PDF).

## Escopo 10/09 (mantido)
Sem denúncia/fiscalização/apuração no sistema. Revogar só backoffice + documento + REVOGADO + sai lista pública.

${prev.includes('## Regenerar') ? '' : ''}
## Regenerar
\`\`\`bash
node scripts/align-nnseplag-figjam.mjs
node scripts/align-nnseplag-fontes.mjs
\`\`\`
`
  fs.writeFileSync(path.join(epicDir, 'context.md'), md, 'utf8')
}

function main() {
  writeJson(path.join(epicDir, 'flows.json'), buildFlow())

  const formsPath = path.join(epicDir, 'forms.json')
  writeJson(formsPath, patchForms(readJson(formsPath)))

  const wsPath = path.join(epicDir, 'workspaces.json')
  writeJson(wsPath, patchWorkspaces(readJson(wsPath)))

  writeContext(fs.readFileSync(path.join(epicDir, 'context.md'), 'utf8'))
  syncMirrors()

  const flow = readJson(path.join(epicDir, 'flows.json'))[0]
  console.log('steps', flow.steps.length)
  console.log(flow.steps.map((s) => s.title).join('\\n'))
  console.log('DONE')
}

main()
