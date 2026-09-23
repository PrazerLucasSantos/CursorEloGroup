import { useCallback, useEffect, useState } from 'react'
import type { DataTree } from './types'

const EMPTY_TREE: DataTree = { projectName: '', subprojects: [] }

export function useDataTree() {
  const [tree, setTree] = useState<DataTree>(EMPTY_TREE)
  const [loading, setLoading] = useState(true)

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch('/api/data')
      const data: DataTree = await res.json()
      setTree(data)
    } catch (err) {
      console.error('Failed to load data tree', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.on('data-update', () => {
        fetchTree()
      })
    }
  }, [fetchTree])

  return { tree, loading, refetch: fetchTree }
}

export async function exportHtml(filename: string, html: string) {
  const res = await fetch('/api/export-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, html }),
  })
  return res.json()
}

/** Grava na pasta `exports/presentations/` do projeto (só com `npm run dev`; falha noutros ambientes). */
export async function savePresentationExportJson(filename: string, json: string): Promise<{
  ok: boolean
  relativePath?: string
  error?: string
}> {
  try {
    const res = await fetch('/api/save-presentation-export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, json }),
    })
    const data = (await res.json()) as { ok?: boolean; relativePath?: string; error?: string }
    if (!res.ok) {
      return { ok: false, error: data.error ?? res.statusText }
    }
    return { ok: Boolean(data.ok), relativePath: data.relativePath }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function saveForms(subprojectId: string, epicId: string, forms: unknown) {
  await fetch('/api/save-forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subprojectId, epicId, forms }),
  })
}

export async function saveClassGroups(
  subprojectId: string,
  epicId: string,
  payload: { groups: unknown; assignments: Record<string, string>; memberOrderByGroup?: Record<string, string[]> },
) {
  await fetch('/api/save-class-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subprojectId, epicId, ...payload }),
  })
}

export async function saveFlows(subprojectId: string, epicId: string, flows: unknown) {
  await fetch('/api/save-flows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subprojectId, epicId, flows }),
  })
}

export async function savePortals(subprojectId: string, epicId: string, portals: unknown) {
  await fetch('/api/save-portals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subprojectId, epicId, portals }),
  })
}

export async function saveWorkspaces(subprojectId: string, epicId: string, workspaces: unknown) {
  await fetch('/api/save-workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subprojectId, epicId, workspaces }),
  })
}

export type DataMutationResult = { ok: true; id?: string } | { ok: false; error: string }

async function postJson(url: string, body: unknown): Promise<DataMutationResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; id?: string }
    if (!res.ok) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : res.statusText }
    }
    if (data.ok === false && typeof data.error === 'string') {
      return { ok: false, error: data.error }
    }
    return { ok: true, id: typeof data.id === 'string' ? data.id : undefined }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export function createSubproject(name: string): Promise<DataMutationResult> {
  return postJson('/api/create-subproject', { name })
}

export function deleteSubproject(subprojectId: string): Promise<DataMutationResult> {
  return postJson('/api/delete-subproject', { subprojectId })
}

export function createEpic(subprojectId: string, name: string): Promise<DataMutationResult> {
  return postJson('/api/create-epic', { subprojectId, name })
}

export function deleteEpic(subprojectId: string, epicId: string): Promise<DataMutationResult> {
  return postJson('/api/delete-epic', { subprojectId, epicId })
}

export function renameSubproject(subprojectId: string, name: string): Promise<DataMutationResult> {
  return postJson('/api/rename-subproject', { subprojectId, name })
}

export function renameEpic(subprojectId: string, epicId: string, name: string): Promise<DataMutationResult> {
  return postJson('/api/rename-epic', { subprojectId, epicId, name })
}
