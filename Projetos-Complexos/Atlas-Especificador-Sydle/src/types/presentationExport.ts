/** Resultado de `exportPresentationViewer` para exibir no diálogo após exportar. */
export type PresentationExportOutcome =
  | { kind: 'saved-in-project'; relativePath: string }
  | { kind: 'downloaded'; filename: string; reason?: string }
