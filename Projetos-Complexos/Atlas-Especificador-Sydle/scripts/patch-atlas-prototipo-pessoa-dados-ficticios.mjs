#!/usr/bin/env node
/**
 * Pessoas — substitui dados reais dos presets e referências por dados fictícios.
 * Uso: node scripts/patch-atlas-prototipo-pessoa-dados-ficticios.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM_PESSOA = 'form-patlasv4-proto-pessoa'

/** Ordem: strings mais longas primeiro para não substituir parcialmente. */
const TEXT_REPLACEMENTS = [
  ['Lucas dos Santos / lucas.santos@pclogroup.com.br', 'Felipe Oliveira Costa / felipe.costa@exemplo.gov.br'],
  ['Lucas dos Santos', 'Felipe Oliveira Costa'],
  ['Bernardo Alves Bicalho Vorges', 'Ricardo Almeida Ferreira'],
  ['Lucas Santos', 'Felipe Oliveira Costa'],
  ['João Analista MTI', 'Carlos Eduardo Souza'],
  ['Maria Consultora Parceira', 'Helena Ribeiro Lima'],
  ['lucas.santos@pclogroup.com.br', 'felipe.costa@exemplo.gov.br'],
  ['lucas.santos@mti.mt.gov.br', 'felipe.costa@exemplo.gov.br'],
  ['lucas.santos', 'felipe.costa'],
  ['159.740.746-10', '529.981.047-25'],
  ['20062855', '45871239'],
  ['Quedas do Iguaçu / Paraná / Brasil', 'Campo Verde / Mato Grosso / Brasil'],
  ['Quedas do Iguaçu', 'Campo Verde'],
  ['EXT-LUCAS', 'EXT-FELIPE'],
  ['Servidor Lucas', 'Servidor Felipe'],
  ['Servidor João', 'Servidor Carlos'],
  ['João da Silva', 'Marcos da Silva'],
]

function replaceInValue(value) {
  if (typeof value === 'string') {
    let out = value
    for (const [from, to] of TEXT_REPLACEMENTS) {
      out = out.split(from).join(to)
    }
    return out
  }
  if (Array.isArray(value)) return value.map(replaceInValue)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = replaceInValue(v)
    }
    return out
  }
  return value
}

function patchPessoaPresets(pessoa) {
  const presets = [
    {
      id: 'patlasv4proto-p-pessoa-bernardo',
      name: 'Ricardo Almeida Ferreira',
      iconColor: '#334155',
      fieldValues: {
        'patlasv4proto-pes-nome': 'Ricardo Almeida Ferreira',
        'patlasv4proto-pes-nasc': '15/03/1988',
        'patlasv4proto-pes-falecido': false,
        'patlasv4proto-pes-sexo': 'Masculino',
        'patlasv4proto-pes-pais-nasc': 'Brasil',
        'patlasv4proto-pes-nacionalidade': 'Brasil',
        'patlasv4proto-pes-carteira': 'Parceiro',
        'patlasv4proto-pes-ativo-acesso': false,
        'patlasv4proto-pes-fornecedor': 'Sim',
        'patlasv4proto-pes-sigadoc-pendente': true,
        'patlasv4proto-pes-aceite-email': true,
        'patlasv4proto-pes-aceite-sms': false,
        'patlasv4proto-pes-aceite-whatsapp': true,
        'patlasv4proto-pes-ativo-demandas': 'Sim',
        'patlasv4proto-pes-procon-digital': 'Não',
        'patlasv4proto-pes-tipo-companhia': 'Matriz',
        'patlasv4proto-pes-email-principal': 'ricardo.ferreira@empresa-parceira.exemplo',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-pes-documentos': [
          { 'patlasv4proto-pdoc-tipo': 'CPF', 'patlasv4proto-pdoc-numero': '529.981.047-25' },
          { 'patlasv4proto-pdoc-tipo': 'RG', 'patlasv4proto-pdoc-numero': '45871239' },
        ],
        'patlasv4proto-pes-emails': [
          { 'patlasv4proto-peml-tipo': 'Comercial', 'patlasv4proto-peml-email': 'ricardo.ferreira@empresa-parceira.exemplo' },
        ],
        'patlasv4proto-pes-telefones': [
          {
            'patlasv4proto-ptel-tipo': 'Celular',
            'patlasv4proto-ptel-pais': 'Brasil',
            'patlasv4proto-ptel-ddi': '+55',
            'patlasv4proto-ptel-numero': '(65) 99876-5432',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-pessoa-lucas',
      name: 'Felipe Oliveira Costa',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv4proto-pes-nome': 'Felipe Oliveira Costa',
        'patlasv4proto-pes-nasc': '22/07/1990',
        'patlasv4proto-pes-falecido': false,
        'patlasv4proto-pes-sexo': 'Masculino',
        'patlasv4proto-pes-pais-nasc': 'Brasil',
        'patlasv4proto-pes-nacionalidade': 'Brasil',
        'patlasv4proto-pes-carteira': 'Servidor',
        'patlasv4proto-pes-ativo-acesso': true,
        'patlasv4proto-pes-codigo-ext': 'EXT-FELIPE',
        'patlasv4proto-pes-fornecedor': 'Não',
        'patlasv4proto-pes-login': 'felipe.costa',
        'patlasv4proto-pes-senha': 'criptografado',
        'patlasv4proto-pes-matricula': 'MTI-004821',
        'patlasv4proto-pes-mtid': 'MTID-98214',
        'patlasv4proto-pes-email-principal': 'felipe.costa@exemplo.gov.br',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-pes-documentos': [
          { 'patlasv4proto-pdoc-tipo': 'CPF', 'patlasv4proto-pdoc-numero': '741.852.963-00' },
        ],
        'patlasv4proto-pes-enderecos': [
          {
            'patlasv4proto-pend-cep': '78840-000',
            'patlasv4proto-pend-logradouro': 'Rua das Acácias',
            'patlasv4proto-pend-numero': '120',
            'patlasv4proto-pend-bairro': 'Centro',
            'patlasv4proto-pend-cidade': 'Campo Verde / Mato Grosso / Brasil',
            'patlasv4proto-pend-estado': 'Mato Grosso / Brasil',
            'patlasv4proto-pend-pais': 'Brasil',
          },
        ],
        'patlasv4proto-pes-emails': [
          { 'patlasv4proto-peml-tipo': 'Institucional', 'patlasv4proto-peml-email': 'felipe.costa@exemplo.gov.br' },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-pessoa-mti',
      name: 'Carlos Eduardo Souza',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv4proto-pes-nome': 'Carlos Eduardo Souza',
        'patlasv4proto-pes-nasc': '03/11/1985',
        'patlasv4proto-pes-falecido': false,
        'patlasv4proto-pes-sexo': 'Masculino',
        'patlasv4proto-pes-carteira': 'Servidor',
        'patlasv4proto-pes-ativo-acesso': true,
        'patlasv4proto-pes-fornecedor': 'Não',
        'patlasv4proto-pes-login': 'carlos.souza',
        'patlasv4proto-pes-senha': 'criptografado',
        'patlasv4proto-pes-matricula': 'MTI-002156',
        'patlasv4proto-pes-email-principal': 'carlos.souza@exemplo.gov.br',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-pes-documentos': [
          { 'patlasv4proto-pdoc-tipo': 'CPF', 'patlasv4proto-pdoc-numero': '321.654.987-00' },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-pessoa-parceiro',
      name: 'Helena Ribeiro Lima',
      iconColor: '#0d9488',
      fieldValues: {
        'patlasv4proto-pes-nome': 'Helena Ribeiro Lima',
        'patlasv4proto-pes-nasc': '18/09/1992',
        'patlasv4proto-pes-falecido': false,
        'patlasv4proto-pes-sexo': 'Feminino',
        'patlasv4proto-pes-carteira': 'Parceiro',
        'patlasv4proto-pes-fornecedor': 'Não',
        'patlasv4proto-pes-ativo-acesso': true,
        'patlasv4proto-pes-login': 'helena.lima',
        'patlasv4proto-pes-senha': 'criptografado',
        'patlasv4proto-pes-email-principal': 'helena.lima@consultoria.exemplo',
      },
      embeddedRowsByFieldId: {
        'patlasv4proto-pes-documentos': [
          { 'patlasv4proto-pdoc-tipo': 'CPF', 'patlasv4proto-pdoc-numero': '987.654.321-00' },
        ],
        'patlasv4proto-pes-emails': [
          { 'patlasv4proto-peml-tipo': 'Comercial', 'patlasv4proto-peml-email': 'helena.lima@consultoria.exemplo' },
        ],
      },
    },
  ]

  return {
    ...pessoa,
    exampleValuePresets: presets,
    activeExamplePresetId: pessoa.activeExamplePresetId ?? 'patlasv4proto-p-pessoa-bernardo',
  }
}

function main() {
  let forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))

  const pIdx = forms.findIndex((x) => x.id === FORM_PESSOA)
  if (pIdx < 0) throw new Error('Formulário Pessoa não encontrado')
  forms[pIdx] = patchPessoaPresets(forms[pIdx])

  forms = replaceInValue(forms)

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
  console.log('✓ Pessoas — 4 presets com dados fictícios')
  console.log('✓ Referências a nomes reais atualizadas em todo o épico')
}

main()
