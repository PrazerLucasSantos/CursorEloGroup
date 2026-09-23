import fs from 'fs'

const path = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

const ORG_FORM = 'form-patlasv4-proto-unidade-organizacional'

/** Corrige presets MTI: tipo de organização = MTI. */
{
  const uo = forms.find((x) => x.id === ORG_FORM)
  if (!uo) throw new Error('UO form missing')
  let n = 0
  for (const p of uo.exampleValuePresets || []) {
    const id = String(p.id || '')
    const fv = p.fieldValues || {}
    const isMtiTree =
      id.includes('-uo-mti') ||
      id === 'patlasv4proto-p-unidade-organizacional-mti' ||
      (typeof fv['patlasv4proto-uo-caminho'] === 'string' &&
        String(fv['patlasv4proto-uo-caminho']).startsWith('MTI'))
    if (!isMtiTree) continue
    fv['patlasv4proto-uo-tipo-organizacao'] = 'MTI'
    p.fieldValues = fv
    n++
  }
  console.log('UO presets marcados tipo MTI:', n)
}

function insertFieldsAfter(form, afterId, newFields) {
  const idx = (form.fields || []).findIndex((f) => f.id === afterId)
  if (idx < 0) {
    form.fields.push(...newFields)
    return
  }
  form.fields.splice(idx + 1, 0, ...newFields)
}

function makeDemandaClassificacaoFields(pfx, sectionAndamento) {
  const id = (s) => `patlasv4proto-${pfx}-${s}`
  return [
    {
      id: id('nome'),
      label: 'Nome da demanda',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: sectionAndamento,
      spec:
        'Função: Título/nome descritivo da demanda (além do número).\nRegra: Informado na abertura ou pela MTI. Visível em listagens e no cabeçalho.',
    },
    {
      id: id('categoria'),
      label: 'Categoria',
      type: 'textOptions',
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: sectionAndamento,
      options: ['Estratégico', 'Operacional'],
      spec:
        'Função: Classificação da demanda como Estratégico ou Operacional.\nRegra: Definido na Demanda (Dados da demanda). Influencia priorização e visão gerencial.',
    },
    {
      id: id('prioridade'),
      label: 'Prioridade',
      type: 'textOptions',
      size: 'small',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'highlight',
      sectionId: sectionAndamento,
      options: ['Crítico', 'Alto', 'Moderado', 'Baixo', 'Planejado'],
      spec:
        'Função: Prioridade operacional da demanda.\nRegra: Crítico · Alto · Moderado · Baixo · Planejado. Definido na Demanda (Dados da demanda).',
    },
    {
      id: id('departamento'),
      label: 'Departamento',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: sectionAndamento,
      linkedFormId: ORG_FORM,
      filterByReference: {
        matchEquals: 'MTI',
        matchFieldIds: ['patlasv4proto-uo-tipo-organizacao'],
      },
      spec:
        'Função: Departamento responsável — referência à classe Organização (Nome).\nRegra: Somente organizações com Tipo de organização = MTI.',
    },
    {
      id: id('unidade-negocio'),
      label: 'Unidade de negócio',
      type: 'reference',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId: sectionAndamento,
      linkedFormId: ORG_FORM,
      filterByReference: {
        sourceFieldId: id('departamento'),
        matchFieldIds: ['patlasv4proto-uo-unidade-pai'],
      },
      spec:
        'Função: Unidade de negócio sob o departamento — referência à classe Organização (Nome).\nRegra: Lista apenas organizações cujo campo Organização pai = Departamento selecionado.',
    },
  ]
}

// DEMC
{
  const f = forms.find((x) => x.id === 'form-patlasv4-proto-demanda-completa')
  if (!f) throw new Error('demc missing')
  const existing = new Set((f.fields || []).map((x) => x.id))
  const news = makeDemandaClassificacaoFields('demc', 'sec-demc-andamento').filter(
    (x) => !existing.has(x.id),
  )
  insertFieldsAfter(f, 'patlasv4proto-demc-atualizado-em', news)
  console.log(
    'demc added',
    news.map((x) => x.label).join(', '),
  )
}

// DEMCLI / DEMPAR
for (const [formId, pfx, sec] of [
  ['form-patlasv4-proto-demanda-portal-cliente', 'demcli', 'sec-demcli-andamento'],
  ['form-patlasv4-proto-demanda-portal-parceiro', 'dempar', 'sec-dempar-andamento'],
]) {
  const f = forms.find((x) => x.id === formId)
  if (!f) throw new Error(formId + ' missing')
  const existing = new Set((f.fields || []).map((x) => x.id))
  const news = makeDemandaClassificacaoFields(pfx, sec).filter((x) => !existing.has(x.id))
  const after =
    (f.fields || []).find((x) => x.id === `patlasv4proto-${pfx}-tipo`)?.id ||
    (f.fields || []).find((x) => x.id === `patlasv4proto-${pfx}-status`)?.id
  insertFieldsAfter(f, after, news)
  console.log(pfx, 'added', news.map((x) => x.label).join(', '))
}

fs.writeFileSync(path, JSON.stringify(forms, null, 2) + '\n')
console.log('Wrote', path)
