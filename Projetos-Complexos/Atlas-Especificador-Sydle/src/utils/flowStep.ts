import type { FlowActivityType, FlowStep } from '../types'

export function stepNeedsTypeChoice(step: FlowStep): boolean {
  return step.type == null || step.type === ''
}

/** Para qual painel de configuração direcionar (mapeia `activity` legado → BPMN). */
export function resolvedActivityType(step: FlowStep): FlowActivityType | null {
  if (stepNeedsTypeChoice(step)) return null
  const t = step.type!
  if (t === 'activity' || t === 'bpmnActivity') return 'bpmnActivity'
  if (t === 'method') return 'method'
  if (t === 'html') return 'html'
  if (t === 'servicePortal') return 'servicePortal'
  if (t === 'workspace') return 'workspace'
  if (t === 'class') return 'class'
  return null
}

/** Rótulo curto para listagem de etapas. */
export function flowStepTypeDisplayLabel(step: FlowStep): string {
  if (stepNeedsTypeChoice(step)) return 'Sem tipo'
  const r = resolvedActivityType(step)
  if (r === 'html') return 'HTML livre'
  if (r === 'bpmnActivity') return 'Atividade BPMN'
  if (r === 'method') return 'Método'
  if (r === 'servicePortal') return 'Portal de serviços'
  if (r === 'workspace') return 'Workspace'
  if (r === 'class') return 'Classe'
  return step.type ?? '—'
}

/** Nome exibido no preview da atividade BPMN. */
export function flowStepActivityDisplayName(step: FlowStep): string {
  const n = step.bpmnActivityKey?.trim()
  if (n) return n
  return step.title?.trim() || 'Atividade'
}

/** Texto da descrição do papel (`assigneeRoleDetail` ou legado `candidateGroups`). */
export function assigneeRoleDetailText(step: FlowStep): string {
  const raw = step.assigneeRoleDetail
  if (raw != null && raw.trim() !== '') return raw
  const g = step.candidateGroups?.filter((x) => x.trim()) ?? []
  return g.join('\n')
}

/** Lista de regras de negócio: `bpmnRuleList` ou legado `bpmnRules` repartido por linhas. */
export function bpmnRulesListResolved(step: FlowStep): string[] {
  const list = step.bpmnRuleList
  if (list != null && list.length > 0) return [...list]
  const legacy = step.bpmnRules
  if (legacy == null || legacy.trim() === '') return []
  return legacy.split('\n').map((line) => line.trimEnd())
}

/** Chave única para `FlowStep.workspaceMethodNavigateStepIds` (classe + método no Explorer). */
export function workspaceMethodNavKey(packageId: string, classId: string, methodId: string): string {
  return `${packageId}::${classId}::${methodId}`
}
