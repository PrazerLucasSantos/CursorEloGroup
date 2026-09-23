import fs from 'fs'

const path = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

const REGISTRO_FORM_ID = 'form-patlasv4-proto-demc-registro-texto'

const REGISTRO_FORM = {
  id: REGISTRO_FORM_ID,
  name: 'Registro de texto (Demanda)',
  icon: 'notes',
  iconColor: '#475569',
  metadata:
    'Linha de registro textual com autor, data/hora e conteúdo. Usado em listas (+ / excluir) do Atendimento MTI.',
  fields: [
    {
      id: 'patlasv4proto-demc-reg-autor',
      label: 'Autor',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'identity',
      spec: 'Quem registrou a linha. Compõe o título do acordeão (Autor / data).',
    },
    {
      id: 'patlasv4proto-demc-reg-em',
      label: 'Registrado em',
      type: 'text',
      size: 'small',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'identity',
      spec: 'Data/hora do registro. Compõe o título do acordeão (Autor / data).',
    },
    {
      id: 'patlasv4proto-demc-reg-conteudo',
      label: 'Conteúdo',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      textLong: true,
      spec: 'Texto livre do registro. Placeholder vazio até preenchimento.',
    },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-demc-reg-vazio',
      name: 'Registro vazio',
      iconColor: '#94a3b8',
      fieldValues: {
        'patlasv4proto-demc-reg-autor': 'Lucas Santos',
        'patlasv4proto-demc-reg-em': '22/09/2026 23:03',
        'patlasv4proto-demc-reg-conteudo': '',
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-demc-reg-vazio',
}

if (!forms.some((f) => f.id === REGISTRO_FORM_ID)) {
  const demcCtr = forms.findIndex((f) => f.id === 'form-patlasv4-proto-demc-contrato')
  if (demcCtr >= 0) forms.splice(demcCtr, 0, REGISTRO_FORM)
  else forms.push(REGISTRO_FORM)
  console.log('created', REGISTRO_FORM_ID)
} else {
  console.log('exists', REGISTRO_FORM_ID)
}

const BLOCOS = [
  ['caso-negocio', 'Caso de negócio'],
  ['risco-desempenho', 'Risco de desempenho'],
  ['risco-nao-desempenho', 'Risco de não desempenho'],
  ['habilitadores', 'Habilitadores'],
  ['barreiras', 'Barreiras'],
  ['em-escopo', 'Em escopo'],
  ['fora-escopo', 'Fora de escopo'],
  ['consideracoes', 'Considerações'],
  ['anotacoes', 'Anotações'],
]

function makeEmbedField(pfx, sectionId, suf, label) {
  return {
    id: `patlasv4proto-${pfx}-${suf}`,
    label,
    type: 'embeddedReference',
    size: 'large',
    readOnly: false,
    required: false,
    multiple: true,
    relevance: 'common',
    sectionId,
    linkedFormId: REGISTRO_FORM_ID,
    embeddedDisplay: 'form',
    spec: `Função: Lista de registros de «${label}» (padrão Observações Sydle).\nRegra: Clique em + para adicionar linha (Autor / data + Conteúdo). Ícone de exclusão remove o registro. Vários registros por campo.`,
  }
}

function ensureFields(formId, pfx, sectionId) {
  const f = forms.find((x) => x.id === formId)
  if (!f) {
    console.log('skip missing', formId)
    return
  }
  const existing = new Set((f.fields || []).map((x) => x.id))
  const news = BLOCOS.map(([suf, label]) => makeEmbedField(pfx, sectionId, suf, label)).filter(
    (x) => !existing.has(x.id),
  )
  if (!news.length) {
    console.log(pfx, 'already has all')
    return
  }
  // append at end of atendimento section fields (keep relative order among new ones)
  const lastAttIdx = (() => {
    let last = -1
    for (let i = 0; i < f.fields.length; i++) {
      if (f.fields[i].sectionId === sectionId) last = i
    }
    return last
  })()
  if (lastAttIdx >= 0) f.fields.splice(lastAttIdx + 1, 0, ...news)
  else f.fields.push(...news)
  console.log(pfx, 'added', news.map((x) => x.label).join(', '))
}

ensureFields('form-patlasv4-proto-demanda-completa', 'demc', 'sec-demc-atendimento-mti')
ensureFields('form-patlasv4-proto-demanda-portal-cliente', 'demcli', 'sec-demcli-atendimento')
ensureFields('form-patlasv4-proto-demanda-portal-parceiro', 'dempar', 'sec-dempar-atendimento')

fs.writeFileSync(path, JSON.stringify(forms, null, 2) + '\n')
JSON.parse(fs.readFileSync(path, 'utf8'))
console.log('Wrote ok')
