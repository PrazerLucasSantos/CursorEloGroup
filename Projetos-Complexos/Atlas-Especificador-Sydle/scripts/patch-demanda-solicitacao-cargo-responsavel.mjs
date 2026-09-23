import fs from 'fs'

const path = 'data/subprojects/atlas-prototipo/epics/prototipo/forms.json'
const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

const PESSOA = 'form-patlasv4-proto-pessoa'
const CARGO = 'form-patlasv4-proto-cargo'
const UO = 'form-patlasv4-proto-unidade-organizacional'

const PESSOA_OPTS = [
  'Lucas Costa',
  'Ana Paula Ribeiro',
  'Bernardo Almeida',
  'Ricardo Almeida Ferreira',
  'Felipe Oliveira Costa',
  'Carlos Eduardo Souza',
  'Helena Ribeiro Lima',
  'Carlos Gerente Parceria',
  'Ana Titular Atendimento',
  'Pedro Equipe',
]

/** Garante Responsável nas orgs Cliente. */
{
  const uo = forms.find((x) => x.id === UO)
  for (const p of uo?.exampleValuePresets || []) {
    const fv = p.fieldValues || {}
    if (fv['patlasv4proto-uo-tipo-organizacao'] !== 'Cliente') continue
    if (!fv['patlasv4proto-uo-responsavel']) {
      fv['patlasv4proto-uo-responsavel'] = 'Ricardo Almeida Ferreira'
      p.fieldValues = fv
      console.log('UO Cliente responsável →', fv['patlasv4proto-uo-nome'])
    }
  }
}

function insertAfter(form, afterId, fields) {
  const existing = new Set((form.fields || []).map((f) => f.id))
  const toAdd = fields.filter((f) => !existing.has(f.id))
  if (!toAdd.length) return []
  const idx = (form.fields || []).findIndex((f) => f.id === afterId)
  if (idx < 0) form.fields.push(...toAdd)
  else form.fields.splice(idx + 1, 0, ...toAdd)
  return toAdd
}

function makeFields(pfx, sectionId) {
  const id = (s) => `patlasv4proto-${pfx}-${s}`
  return [
    {
      id: id('contato-cargo'),
      label: 'Cargo',
      type: 'reference',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      linkedFormId: CARGO,
      options: [
        'Demandante',
        'Gestor',
        'Fiscal',
        'Diretor DIRC',
        'Analista DIRC',
        'Gerente de Projetos',
        'Fiscal de Contrato',
      ],
      spec:
        'Função: Cargo do responsável pela abertura da demanda — referência à classe Cargo (Nome).\nRegra: Derivado da Pessoa «Responsável pela abertura» (campo Cargo). Somente leitura.',
    },
    {
      id: id('responsavel'),
      label: 'Responsável',
      type: 'reference',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      linkedFormId: PESSOA,
      options: PESSOA_OPTS,
      spec:
        'Função: Responsável da organização cliente — referência à classe Pessoa (Nome).\nRegra: Valor do campo Responsável da Organização (Tipo = Cliente) correspondente ao Cliente solicitante. Somente leitura; telefone e e-mail no mesmo bloco.',
    },
    {
      id: id('responsavel-email'),
      label: 'E-mail (responsável)',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      spec: 'E-mail do Responsável da organização cliente. Somente leitura (mesmo padrão do contato de abertura).',
    },
    {
      id: id('responsavel-numero'),
      label: 'Contato (responsável)',
      type: 'text',
      size: 'small',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      spec: 'Telefone do Responsável da organização cliente. Somente leitura (mesmo padrão do contato de abertura).',
    },
    {
      id: id('contato-sec-email'),
      label: 'E-mail (contato secundário)',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      spec: 'E-mail do contato secundário. Mesmo padrão do responsável pela abertura (CPF/e-mail/telefone).',
    },
    {
      id: id('contato-sec-numero'),
      label: 'Contato (secundário)',
      type: 'text',
      size: 'small',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'common',
      sectionId,
      spec: 'Telefone do contato secundário. Mesmo padrão do responsável pela abertura.',
    },
  ]
}

// DEMC — cargo after contato; responsável after cliente; sec email/tel after contato-sec
{
  const f = forms.find((x) => x.id === 'form-patlasv4-proto-demanda-completa')
  const sec = 'sec-demc-solicitacao'
  const fields = makeFields('demc', sec)
  const byId = Object.fromEntries(fields.map((x) => [x.id, x]))

  let added = []
  added = added.concat(
    insertAfter(f, 'patlasv4proto-demc-contato', [byId['patlasv4proto-demc-contato-cargo']]),
  )
  added = added.concat(
    insertAfter(f, 'patlasv4proto-demc-cliente', [
      byId['patlasv4proto-demc-responsavel'],
      byId['patlasv4proto-demc-responsavel-email'],
      byId['patlasv4proto-demc-responsavel-numero'],
    ]),
  )
  added = added.concat(
    insertAfter(f, 'patlasv4proto-demc-contato-sec', [
      byId['patlasv4proto-demc-contato-sec-email'],
      byId['patlasv4proto-demc-contato-sec-numero'],
    ]),
  )
  console.log(
    'demc +',
    added.map((x) => x.label).join(', '),
  )
}

for (const [formId, pfx, sec] of [
  ['form-patlasv4-proto-demanda-portal-cliente', 'demcli', 'sec-demcli-solicitacao'],
  ['form-patlasv4-proto-demanda-portal-parceiro', 'dempar', 'sec-dempar-solicitacao'],
]) {
  const f = forms.find((x) => x.id === formId)
  const fields = makeFields(pfx, sec)
  const byId = Object.fromEntries(fields.map((x) => [x.id, x]))
  let added = []
  const contatoId = `patlasv4proto-${pfx}-contato`
  const clienteId = `patlasv4proto-${pfx}-cliente`
  const secId = `patlasv4proto-${pfx}-contato-sec`
  added = added.concat(insertAfter(f, contatoId, [byId[`patlasv4proto-${pfx}-contato-cargo`]]))
  added = added.concat(
    insertAfter(f, clienteId, [
      byId[`patlasv4proto-${pfx}-responsavel`],
      byId[`patlasv4proto-${pfx}-responsavel-email`],
      byId[`patlasv4proto-${pfx}-responsavel-numero`],
    ]),
  )
  added = added.concat(
    insertAfter(f, secId, [
      byId[`patlasv4proto-${pfx}-contato-sec-email`],
      byId[`patlasv4proto-${pfx}-contato-sec-numero`],
    ]),
  )
  console.log(pfx, '+', added.map((x) => x.label).join(', '))
}

fs.writeFileSync(path, JSON.stringify(forms, null, 2) + '\n')
console.log('Wrote', path)
