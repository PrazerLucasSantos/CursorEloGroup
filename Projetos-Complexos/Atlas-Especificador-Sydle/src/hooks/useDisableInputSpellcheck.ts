import { useEffect } from 'react'

function patchSpellcheckSubtree(root: Element) {
  if (root instanceof HTMLInputElement || root instanceof HTMLTextAreaElement) {
    root.spellcheck = false
  }
  root.querySelectorAll('input, textarea').forEach((el) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.spellcheck = false
    }
  })
}

/** Desativa correção ortográfica do browser em todos os inputs/textareas da app (raiz React). */
export function useDisableInputSpellcheck() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    patchSpellcheckSubtree(root)

    const obs = new MutationObserver((records) => {
      for (const rec of records) {
        rec.addedNodes.forEach((node) => {
          if (node instanceof Element) patchSpellcheckSubtree(node)
        })
      }
    })
    obs.observe(root, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])
}
