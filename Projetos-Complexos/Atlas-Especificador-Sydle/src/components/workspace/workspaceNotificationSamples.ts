export type WorkspaceNotificationKind = 'notification' | 'alert'

export type WorkspaceNotificationItem = {
  id: string
  kind: WorkspaceNotificationKind
  message: string
  timestamp: string
  read: boolean
  severity: 'info' | 'warning' | 'error'
}

export const WORKSPACE_NOTIFICATION_SAMPLES: WorkspaceNotificationItem[] = [
  {
    id: 'n1',
    kind: 'notification',
    message: 'O documento {{documento.tipo}} da organização EloGroup vence em 7 dias. Atualize na aba Documentos.',
    timestamp: '23/06/2026, 14:32',
    read: false,
    severity: 'warning',
  },
  {
    id: 'n2',
    kind: 'notification',
    message: 'Assinatura pendente — Proposta P-2026-0042 aguarda sua ação no painel de assinaturas.',
    timestamp: '23/06/2026, 11:05',
    read: false,
    severity: 'info',
  },
  {
    id: 'n3',
    kind: 'notification',
    message: 'Solicitação de vínculo recebida — Carlos Gestor Cliente solicitou acesso à organização SEPLAG.',
    timestamp: '22/06/2026, 16:48',
    read: false,
    severity: 'info',
  },
  {
    id: 'n4',
    kind: 'notification',
    message: 'Habilitação documental da EloGroup: Qualificação técnica 12/15 — documentos pendentes.',
    timestamp: '22/06/2026, 09:15',
    read: true,
    severity: 'warning',
  },
  {
    id: 'a1',
    kind: 'alert',
    message: 'Assinatura recusada — envelope da Proposta P-2026-0038 cancelado. Motivo: ajuste de valores no bloco MTI Simplifica.',
    timestamp: '21/06/2026, 18:20',
    read: false,
    severity: 'error',
  },
  {
    id: 'a2',
    kind: 'alert',
    message: 'Prazo de assinatura estourado — Contrato C-2026-0011 aguarda assinatura há 6 dias úteis.',
    timestamp: '21/06/2026, 08:00',
    read: false,
    severity: 'error',
  },
  {
    id: 'a3',
    kind: 'alert',
    message: 'Certidão negativa vencida — parceiro FacilMova com habilitação incompleta. Acesso a propostas bloqueado.',
    timestamp: '20/06/2026, 23:40',
    read: false,
    severity: 'error',
  },
  {
    id: 'a4',
    kind: 'alert',
    message: 'Integração Protheus indisponível — código do parceiro não sincronizado. Verifique credenciais de API.',
    timestamp: '20/06/2026, 15:22',
    read: true,
    severity: 'warning',
  },
  {
    id: 'a5',
    kind: 'alert',
    message: 'Vigência do contrato C-2025-0089 vence em 30 dias. Renovação pendente de análise.',
    timestamp: '19/06/2026, 10:00',
    read: true,
    severity: 'warning',
  },
]
