import { createContext, useContext, type ReactNode } from 'react'
import type { EmbeddedDemoRow, FormDef, FormField } from '../types'
import type { CanvasEmbAncestor } from '../utils/canvasRuntimeValueKey'

export type EmbeddedNestedPopupPayload = {
  field: FormField
  showSpecs?: boolean
  parentInheritedReadOnly: boolean
  canvasReadOnly: boolean
  /**
   * Estado efectivo de só leitura do campo embutido no canvas (ancestrais + canvas + modelo + regras).
   * Quando definido, o miolo do modal usa este valor em vez de recombinar só `parentInheritedReadOnly` e `field.readOnly`.
   */
  linkedFormReadOnly?: boolean
  presetForm: FormDef
  parentEmbeddedDemoCtx?: {
    hostForm: FormDef
    embedField: FormField
    instanceIndex: number
    hostPresetRow?: EmbeddedDemoRow
  }
  epicForms: FormDef[]
  embeddedAncestorFormIds: string[]
  canvasAncestors: CanvasEmbAncestor[]
  onUpdateFieldSpec?: (formId: string, fieldId: string, spec: string) => void
}

export type EmbeddedNestedPopupContextValue = {
  openNestedEmbeddedPopup: (payload: EmbeddedNestedPopupPayload) => void
  closeNestedEmbeddedPopup: () => void
}

const noopCtx: EmbeddedNestedPopupContextValue = {
  openNestedEmbeddedPopup: () => {},
  closeNestedEmbeddedPopup: () => {},
}

export const EmbeddedNestedPopupContext = createContext<EmbeddedNestedPopupContextValue>(noopCtx)

export function useEmbeddedNestedPopup() {
  return useContext(EmbeddedNestedPopupContext)
}

export function EmbeddedNestedPopupProvider({
  value,
  children,
}: {
  value: EmbeddedNestedPopupContextValue
  children: ReactNode
}) {
  return <EmbeddedNestedPopupContext.Provider value={value}>{children}</EmbeddedNestedPopupContext.Provider>
}
