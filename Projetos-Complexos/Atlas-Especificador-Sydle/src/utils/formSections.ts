import type { FormDef, FormField, FormSection, FormSectionLayout } from '../types'

function newSectionId() {
  return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function isSectionedForm(form: FormDef): boolean {
  return form.sectionLayout === 'accordion' || form.sectionLayout === 'tabs'
}

/** Seções de topo (aba / painel de acordeão), na ordem em que aparecem em `sections`. */
export function getTopLevelSectionsInOrder(sections: FormSection[]): FormSection[] {
  return sections.filter((s) => !s.parentSectionId)
}

export function getChildSectionsForParent(sections: FormSection[], parentId: string): FormSection[] {
  return sections.filter((s) => s.parentSectionId === parentId)
}

/** Blocos [aba, ...subs dessa aba] na ordem do array. Ignora órfãos no início. */
export function parseSectionSegments(sections: FormSection[]): { tab: FormSection; children: FormSection[] }[] {
  const out: { tab: FormSection; children: FormSection[] }[] = []
  let i = 0
  while (i < sections.length) {
    const s = sections[i]
    if (s.parentSectionId) {
      i++
      continue
    }
    const children: FormSection[] = []
    let j = i + 1
    while (j < sections.length && sections[j].parentSectionId === s.id) {
      children.push(sections[j])
      j++
    }
    out.push({ tab: s, children })
    i = j
  }
  return out
}

function flattenSegments(segments: { tab: FormSection; children: FormSection[] }[]): FormSection[] {
  const flat: FormSection[] = []
  for (const { tab, children } of segments) {
    flat.push(tab, ...children)
  }
  return flat
}

/** Remove sub-seções e repõe `sectionId` dos campos para a aba pai (modo acordeão). */
export function stripSubSectionsForAccordionLayout(form: FormDef): FormDef {
  const allSections = form.sections
  if (!allSections?.length) return form
  const childById = new Map<string, FormSection>()
  for (const s of allSections) {
    if (s.parentSectionId) childById.set(s.id, s)
  }
  const tops = allSections.filter((s) => !s.parentSectionId)
  const fallback = tops[0]?.id
  const newFields = form.fields.map((f) => {
    const sid = f.sectionId
    if (!sid || !fallback) return f
    const sub = childById.get(sid)
    if (sub?.parentSectionId) {
      return { ...f, sectionId: sub.parentSectionId }
    }
    if (!tops.some((t) => t.id === sid)) {
      return { ...f, sectionId: fallback }
    }
    return f
  })
  const newSections = tops.map(({ parentSectionId: _p, ...rest }) => rest)
  return { ...form, sections: newSections, fields: newFields }
}

/** Abas: ordena [aba, filhos…] e remove sub-seções órfãs; remapeia campos órfãos para a aba pai ou a primeira. */
export function sanitizeTabsSubSections(form: FormDef): FormDef {
  const sections = form.sections
  if (form.sectionLayout !== 'tabs' || !sections?.length) return form
  const tops = getTopLevelSectionsInOrder(sections)
  const topIds = new Set(tops.map((t) => t.id))
  const reordered: FormSection[] = []
  for (const t of tops) {
    reordered.push(t)
    for (const s of sections) {
      if (s.parentSectionId === t.id && topIds.has(t.id)) reordered.push(s)
    }
  }
  const validIds = new Set(reordered.map((s) => s.id))
  const fallback = tops[0]?.id
  const newFields =
    fallback == null
      ? form.fields
      : form.fields.map((f) => {
          const sid = f.sectionId
          if (!sid || validIds.has(sid)) return f
          const was = sections.find((x) => x.id === sid)
          if (was?.parentSectionId && topIds.has(was.parentSectionId)) {
            return { ...f, sectionId: was.parentSectionId }
          }
          return { ...f, sectionId: fallback }
        })
  return { ...form, sections: reordered, fields: newFields }
}

/** Primeira seção de topo (novo campo, fallback de normalização). */
export function getFirstTopLevelSectionId(form: FormDef): string | undefined {
  const sections = form.sections
  if (!sections?.length) return undefined
  const tops = getTopLevelSectionsInOrder(sections)
  return tops[0]?.id ?? sections[0]?.id
}

/** Garante `sectionId` válido; em abas saneia sub-seções; em acordeão remove sub-seções do modelo. */
export function normalizeSectionedForm(form: FormDef): FormDef {
  if (!isSectionedForm(form) || !form.sections?.length) return form
  let next = form
  if (next.sectionLayout === 'accordion') {
    next = stripSubSectionsForAccordionLayout(next)
  } else if (next.sectionLayout === 'tabs') {
    next = sanitizeTabsSubSections(next)
  }
  const normalizedSections = next.sections
  if (!normalizedSections?.length) return form
  const valid = new Set(normalizedSections.map((s) => s.id))
  const fallback = getFirstTopLevelSectionId(next) ?? normalizedSections[0]?.id
  if (!fallback) return form
  return {
    ...next,
    fields: next.fields.map((f) => ({
      ...f,
      sectionId: f.sectionId && valid.has(f.sectionId) ? f.sectionId : fallback,
    })),
  }
}

export function enableFormSections(
  form: FormDef,
  layout: Exclude<FormSectionLayout, 'none'>,
): FormDef {
  const sectionId = newSectionId()
  return normalizeSectionedForm({
    ...form,
    sectionLayout: layout,
    sections: [{ id: sectionId, title: 'Geral' }],
    fields: form.fields.map((f) => ({ ...f, sectionId: f.sectionId ?? sectionId })),
  })
}

export function disableFormSections(form: FormDef): FormDef {
  return {
    ...form,
    sectionLayout: undefined,
    sections: undefined,
    fields: form.fields.map(({ sectionId: _s, ...rest }) => rest),
  }
}

export function addFormSection(form: FormDef): FormDef {
  if (!isSectionedForm(form)) return form
  const id = newSectionId()
  return {
    ...form,
    sections: [...(form.sections ?? []), { id, title: 'Nova seção' }],
  }
}

/** Sub-seção dentro de uma aba (só com layout em abas). Insere após o último filho dessa aba. */
export function addFormSubSection(form: FormDef, parentTabSectionId: string): FormDef {
  if (form.sectionLayout !== 'tabs' || !form.sections?.length) return form
  const parent = form.sections.find((s) => s.id === parentTabSectionId && !s.parentSectionId)
  if (!parent) return form
  const id = newSectionId()
  const idxParent = form.sections.findIndex((s) => s.id === parentTabSectionId)
  if (idxParent < 0) return form
  let insertAt = idxParent + 1
  while (
    insertAt < form.sections.length &&
    form.sections[insertAt].parentSectionId === parentTabSectionId
  ) {
    insertAt++
  }
  const nextSection: FormSection = { id, title: 'Nova sub-seção', parentSectionId: parentTabSectionId }
  const sections = [...form.sections]
  sections.splice(insertAt, 0, nextSection)
  return { ...form, sections }
}

export function removeFormSection(form: FormDef, sectionId: string): FormDef {
  if (!form.sections?.length) return form
  const target = form.sections.find((s) => s.id === sectionId)
  if (!target) return form

  if (target.parentSectionId) {
    const parentId = target.parentSectionId
    const remaining = form.sections.filter((s) => s.id !== sectionId)
    const fields = form.fields.map((f) =>
      f.sectionId === sectionId ? { ...f, sectionId: parentId } : f,
    )
    return normalizeSectionedForm({ ...form, sections: remaining, fields })
  }

  const segments = parseSectionSegments(form.sections)
  const segIdx = segments.findIndex((s) => s.tab.id === sectionId)
  if (segIdx < 0) {
    const remaining = form.sections.filter((s) => s.id !== sectionId)
    if (remaining.length === 0) return disableFormSections(form)
    const fb = getFirstTopLevelSectionId({ ...form, sections: remaining }) ?? remaining[0].id
    return normalizeSectionedForm({
      ...form,
      sections: remaining,
      fields: form.fields.map((f) => (f.sectionId === sectionId ? { ...f, sectionId: fb } : f)),
    })
  }
  const removedIds = new Set<string>([sectionId])
  for (const c of segments[segIdx].children) removedIds.add(c.id)
  const remaining = form.sections.filter((s) => !removedIds.has(s.id))
  if (remaining.length === 0) return disableFormSections(form)
  const targetTop = getFirstTopLevelSectionId({ ...form, sections: remaining }) ?? remaining[0].id
  const fields = form.fields.map((f) => (removedIds.has(f.sectionId ?? '') ? { ...f, sectionId: targetTop } : f))
  return normalizeSectionedForm({ ...form, sections: remaining, fields })
}

export function renameFormSection(form: FormDef, sectionId: string, title: string): FormDef {
  if (!form.sections) return form
  return {
    ...form,
    sections: form.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
  }
}

/** Reordena apenas seções de topo (cada bloco arrasta a aba com os seus filhos). */
export function reorderFormSections(form: FormDef, fromIndex: number, toIndex: number): FormDef {
  if (!form.sections || form.sections.length < 2) return form
  const segments = parseSectionSegments(form.sections)
  if (fromIndex < 0 || fromIndex >= segments.length) return form
  if (toIndex < 0 || toIndex >= segments.length) return form
  if (fromIndex === toIndex) return form
  const nextSeg = [...segments]
  const [moved] = nextSeg.splice(fromIndex, 1)
  nextSeg.splice(toIndex, 0, moved)
  return { ...form, sections: flattenSegments(nextSeg) }
}

export function setFormSectionIcon(form: FormDef, sectionId: string, icon: string): FormDef {
  if (!form.sections) return form
  const trimmed = icon.trim()
  return {
    ...form,
    sections: form.sections.map((s) => {
      if (s.id !== sectionId) return s
      if (!trimmed) {
        const { icon: _removed, ...rest } = s
        return rest
      }
      return { ...s, icon: trimmed }
    }),
  }
}

/**
 * Agrupa campos por seção de topo (acordeão global ou dados legados sem subs).
 * Campos em sub-seções não entram aqui quando o layout é abas — usar `getTabPanelGroups`.
 */
export function getSectionFieldGroups(
  form: FormDef,
): { section: FormSection; fields: FormField[] }[] {
  const f = normalizeSectionedForm(form)
  if (!isSectionedForm(f) || !f.sections?.length) return []
  const tops = getTopLevelSectionsInOrder(f.sections)
  return tops.map((section) => ({
    section,
    fields: f.fields.filter((field) => field.sectionId === section.id),
  }))
}

export type TabPanelGroup = {
  tab: FormSection
  directFields: FormField[]
  subGroups: { sub: FormSection; fields: FormField[] }[]
}

export function getTabPanelGroups(form: FormDef): TabPanelGroup[] {
  const f = normalizeSectionedForm(form)
  if (f.sectionLayout !== 'tabs' || !f.sections?.length) return []
  const segments = parseSectionSegments(f.sections)
  return segments.map(({ tab, children }) => ({
    tab,
    directFields: f.fields.filter((field) => field.sectionId === tab.id),
    subGroups: children.map((sub) => ({
      sub,
      fields: f.fields.filter((field) => field.sectionId === sub.id),
    })),
  }))
}

/**
 * Agrupa campos raiz por seção (ordem das seções, depois ordem no array `fields`).
 * Com abas + sub-seções: aba → campos diretos → cada sub-seção.
 */
export function orderRootFieldsForEditor(
  fields: FormField[],
  sections: FormSection[],
  sectionLayout?: FormSectionLayout,
): FormField[] {
  const layout = sectionLayout ?? 'none'
  if (layout !== 'accordion' && layout !== 'tabs') {
    return [...fields]
  }
  const tops = getTopLevelSectionsInOrder(sections)
  if (!tops.length) return [...fields]

  if (layout === 'tabs') {
    const segments = parseSectionSegments(sections)
    const out: FormField[] = []
    const ids = new Set<string>()
    for (const { tab, children } of segments) {
      for (const f of fields) {
        if (f.sectionId === tab.id && !ids.has(f.id)) {
          out.push(f)
          ids.add(f.id)
        }
      }
      for (const sub of children) {
        for (const f of fields) {
          if (f.sectionId === sub.id && !ids.has(f.id)) {
            out.push(f)
            ids.add(f.id)
          }
        }
      }
    }
    for (const f of fields) {
      if (!ids.has(f.id)) out.push(f)
    }
    return out
  }

  const out: FormField[] = []
  const ids = new Set<string>()
  for (const s of tops) {
    for (const f of fields) {
      if (f.sectionId === s.id && !ids.has(f.id)) {
        out.push(f)
        ids.add(f.id)
      }
    }
  }
  for (const f of fields) {
    if (!ids.has(f.id)) out.push(f)
  }
  return out
}

export function orderRootFieldsForDisplay(form: FormDef): FormField[] {
  const norm = normalizeSectionedForm(form)
  if (isSectionedForm(norm) && norm.sections?.length) {
    return orderRootFieldsForEditor(norm.fields, norm.sections, norm.sectionLayout)
  }
  return norm.fields
}

/** Ao mudar o layout: acordeão elimina sub-seções do JSON. */
export function applySectionLayoutChange(form: FormDef, layout: FormSectionLayout): FormDef {
  if (layout === 'none') return disableFormSections(form)
  if (!isSectionedForm(form)) return enableFormSections(form, layout)
  if (layout === 'accordion' && form.sectionLayout === 'tabs') {
    return normalizeSectionedForm(stripSubSectionsForAccordionLayout({ ...form, sectionLayout: layout }))
  }
  return normalizeSectionedForm({ ...form, sectionLayout: layout })
}
