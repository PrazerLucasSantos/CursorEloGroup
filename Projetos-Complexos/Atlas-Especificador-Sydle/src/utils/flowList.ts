import type { FlowListItem } from '../types'

/** Garante `steps` em cada fluxo (dados vindos da árvore / flows.json). */
export function normalizeFlowsFromEpic(flows: FlowListItem[] | undefined): FlowListItem[] {
  return (flows ?? []).map((f) => ({
    ...f,
    steps: (f.steps ?? []).map((s) => ({
      ...s,
      title:
        s.title ||
        (s.type === 'html'
          ? 'Bloco HTML'
          : s.type === 'class'
            ? 'Classe'
            : s.type === 'method'
              ? 'Método'
              : 'Etapa'),
    })),
  }))
}
