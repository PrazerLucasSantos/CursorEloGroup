#!/usr/bin/env node
/** Ajusta o método Criar pessoa: Organização, Unidade, Cargo, Condição, Região de atuação. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const FORM = 'form-patlasv4-proto-metodo-criar-pessoa'

const UFS = ['Todos', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
const CAMINHOS = ['MTI', 'MTI/GDP', 'MTI/DIRC', 'MTI/DTIC', 'MTI/DIRADM', 'MTI/UGP', 'EloGroup', 'SEPLAG/GECON']
const ORGS = ['Empresa Mato-grossense de Tecnologia da Informação', 'EloGroup', 'Secretaria de Estado de Planejamento e Gestão']
const CARGOS = ['Diretor DIRC', 'Analista DTIC', 'Gerente de Projetos', 'Fiscal de Contrato']

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const f = forms.find((x) => x.id === FORM)

const ref = (id, label, opts, linked, o = {}) => ({
  id, label, type: 'reference', size: o.size || 'medium', readOnly: false, required: o.required || false,
  multiple: o.multiple || false, relevance: o.relevance || 'common', options: opts,
  ...(linked ? { linkedFormId: linked } : {}), ...(o.spec ? { spec: o.spec } : {}),
})

f.fields = [
  { id: 'patlasv4proto-pcm-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', spec: 'Nome completo da pessoa.' },
  { id: 'patlasv4proto-pcm-cpf', label: 'CPF', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'common', spec: 'Documento principal — validação de unicidade no cadastro.' },
  ref('patlasv4proto-pcm-organizacao', 'Organização', ORGS, 'form-patlasv4-proto-unidade-organizacional', { required: true, relevance: 'highlight', spec: 'Organização raiz à qual a pessoa será vinculada.' }),
  ref('mqrdqtib7g9r0c', 'Unidade organizacional', CAMINHOS, 'form-patlasv4-proto-unidade-organizacional', { spec: 'Caminho da unidade. Ex.: MTI/DIRC.' }),
  ref('mqrdr8c3ik6rd3', 'Cargo', CARGOS, 'form-patlasv4-proto-cargo', { spec: 'Cargo ao qual a pessoa será atribuída.' }),
  { id: 'patlasv4proto-pcm-condicao', label: 'Condição', type: 'textOptions', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', options: ['Titular', 'Substituto', 'Suplente'], spec: 'Condição da ocupação no cargo.' },
  { id: 'patlasv4proto-pcm-regiao', label: 'Região de atuação', type: 'textOptions', size: 'medium', readOnly: false, required: false, multiple: true, relevance: 'common', options: UFS, spec: 'Padrão Todos; restringe roteamento por UF.' },
  { id: 'patlasv4proto-pcm-ativo-acesso', label: 'Ativo para acesso', type: 'boolean', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'common', spec: 'Define se a pessoa terá credenciais de acesso ao sistema.' },
]

f.exampleValuePresets = [
  {
    id: 'patlasv4proto-p-metodo-criar-pessoa', name: 'Nova pessoa', iconColor: '#0c4a6e',
    fieldValues: {
      'patlasv4proto-pcm-nome': 'Mariana Alves Pereira', 'patlasv4proto-pcm-cpf': '123.456.789-00',
      'patlasv4proto-pcm-organizacao': 'EloGroup', 'mqrdqtib7g9r0c': 'EloGroup',
      'mqrdr8c3ik6rd3': 'Gerente de Projetos', 'patlasv4proto-pcm-condicao': 'Titular',
      'patlasv4proto-pcm-regiao': ['Todos'], 'patlasv4proto-pcm-ativo-acesso': false,
    },
    embeddedRowsByFieldId: {},
  },
]
f.activeExamplePresetId = 'patlasv4proto-p-metodo-criar-pessoa'
f.metadata = 'Entrada do método Criar — abre o cadastro de Pessoa em edição. Parâmetros: dados mínimos (Nome, CPF) e vínculo (Organização, Unidade, Cargo, Condição, Região de atuação).'

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('Criar pessoa atualizado:', f.fields.map((x) => x.label).join(' · '))
