#!/usr/bin/env node
/**
 * Atualiza o Portal do Parceiro para autenticação via MT Login / Gov.br.
 * - A MTI cadastra o CPF no convite; o usuário acessa via MT Login/Gov.br com esse CPF.
 * - Dados pessoais vêm do provedor (somente leitura). Não há senha no Atlas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const FORM = 'form-patlasv4-proto-portal-parceiro'
const SEC_CONV = 'sec-patlasv4proto-portal-convite'
const SEC_DADOS = 'sec-patlasv4proto-portal-dados'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const p = forms.find((f) => f.id === FORM)
if (!p) throw new Error('Portal do Parceiro não encontrado')

p.metadata = 'Auto-cadastro por CONVITE com autenticação via MT Login / Gov.br. A MTI cadastra o CPF no convite; o colaborador acessa com esse CPF pelo MT Login ou Gov.br. Os dados pessoais são retornados pelo provedor (somente leitura) — nenhuma senha é criada no Atlas. Ao confirmar, gera Solicitação de vínculo e consome um uso.'

const ro = (id, label, type, o = {}) => ({
  id, label, type, size: o.size || 'medium', readOnly: o.readOnly !== false,
  hidden: false, required: o.required || false, multiple: false,
  relevance: o.relevance || 'common', sectionId: o.sectionId,
  ...(o.options ? { options: o.options } : {}),
  ...(o.spec ? { spec: o.spec } : {}),
})

p.sections = [
  { id: SEC_CONV, title: 'Convite', icon: 'vpn_key' },
  { id: SEC_DADOS, title: 'Seus dados (via MT Login / Gov.br)', icon: 'badge' },
]

p.fields = [
  // Aba Convite
  ro('patlasv4proto-portal-link', 'Link de convite', 'text', { size: 'large', relevance: 'highlight', sectionId: SEC_CONV, spec: 'Link enviado ao colaborador. Ex.: https://atlas.mt.gov.br/convite/EG7K-92AB. Pré-preenchido se acessado pelo link.' }),
  ro('patlasv4proto-portal-codigo', 'Código de convite', 'text', { size: 'small', readOnly: false, required: true, relevance: 'identity', sectionId: SEC_CONV, spec: 'Código informado para validar o acesso (caso não tenha chegado pelo link).' }),
  ro('patlasv4proto-portal-status', 'Status do convite', 'textOptions', { size: 'small', sectionId: SEC_CONV, options: ['Válido', 'Expirado', 'Já utilizado'], spec: 'Resultado da validação do código. Somente leitura.' }),
  ro('patlasv4proto-portal-organizacao', 'Organização do convite', 'text', { sectionId: SEC_CONV, spec: 'Organização à qual o colaborador será vinculado. Derivada do convite.' }),
  ro('patlasv4proto-portal-cpf-cadastrado', 'CPF cadastrado pela MTI', 'text', { size: 'small', relevance: 'highlight', sectionId: SEC_CONV, spec: 'CPF informado pela MTI ao gerar o convite. O acesso pelo MT Login/Gov.br é validado por este CPF.' }),
  // Aba Seus dados
  {
    id: 'patlasv4proto-portal-dados-alerta', label: 'Entre com MT Login ou Gov.br', type: 'alert',
    size: 'medium', readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common',
    sectionId: SEC_DADOS, alertVariant: 'info', alertTitle: 'Autenticação pelo MT Login / Gov.br',
    alertMessage: 'Use o MT Login ou o Gov.br com o CPF já cadastrado pela MTI. Seus dados são preenchidos automaticamente (somente leitura). Nenhuma senha é criada no Atlas.',
  },
  ro('patlasv4proto-portal-cpf', 'CPF', 'text', { size: 'small', relevance: 'identity', sectionId: SEC_DADOS, spec: 'Retornado pelo provedor; deve coincidir com o CPF cadastrado pela MTI.' }),
  ro('patlasv4proto-portal-nome', 'Nome completo', 'text', { size: 'large', relevance: 'identity', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login / Gov.br. Não editável.' }),
  ro('patlasv4proto-portal-nascimento', 'Data de nascimento', 'date', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornada pelo provedor.' }),
  ro('patlasv4proto-portal-estado-civil', 'Estado civil', 'text', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-nome-social', 'Nome social', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login quando informado.' }),
  ro('patlasv4proto-portal-filiacao', 'Filiação', 'text', { sectionId: SEC_DADOS, spec: 'Nome do familiar retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-celular', 'Celular', 'text', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornado pelo provedor.' }),
  ro('patlasv4proto-portal-email', 'E-mail', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo provedor.' }),
  ro('patlasv4proto-portal-cep', 'CEP', 'text', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-logradouro', 'Logradouro', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-numero', 'Número', 'text', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-complemento', 'Complemento', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-bairro', 'Bairro', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-cidade', 'Cidade (Município)', 'text', { sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-uf', 'UF (Estado)', 'text', { size: 'small', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login.' }),
  ro('patlasv4proto-portal-foto', 'Foto', 'file', { sectionId: SEC_DADOS, spec: 'Extraída do MT Login / Gov.br quando disponível.' }),
]

p.methods = [
  { id: 'patlasv4proto-portal-meth-validar', name: 'Validar convite', icon: 'check', kind: 'destaque', spec: 'Valida o código do convite e libera a etapa de autenticação.' },
  { id: 'patlasv4proto-portal-meth-mtlogin', name: 'Entrar com MT Login', icon: 'login', kind: 'destaque', spec: 'Autentica no MT Login com o CPF cadastrado pela MTI; os dados pessoais são preenchidos automaticamente.' },
  { id: 'patlasv4proto-portal-meth-govbr', name: 'Entrar com Gov.br', icon: 'login', kind: 'destaque', spec: 'Autentica no Gov.br com o CPF cadastrado pela MTI; os dados pessoais são preenchidos automaticamente.' },
  { id: 'patlasv4proto-portal-meth-concluir', name: 'Confirmar cadastro', icon: 'how_to_reg', kind: 'destaque', spec: 'Cria a Pessoa com os dados retornados pelo provedor, vinculada à organização do convite; gera Solicitação de vínculo (Pendente) e consome um uso.' },
  { id: 'patlasv4proto-portal-meth-cancelar', name: 'Cancelar', icon: 'close', kind: 'menu', spec: 'Cancela o autocadastro sem consumir o convite.' },
]

p.exampleValuePresets = [
  {
    id: 'patlasv4proto-p-portal-elogroup', name: 'Autocadastro EloGroup (MT Login)', iconColor: '#7c3aed',
    fieldValues: {
      'patlasv4proto-portal-link': 'https://atlas.mt.gov.br/convite/EG7K-92AB',
      'patlasv4proto-portal-codigo': 'EG7K-92AB',
      'patlasv4proto-portal-status': 'Válido',
      'patlasv4proto-portal-organizacao': 'EloGroup',
      'patlasv4proto-portal-cpf-cadastrado': '123.456.789-00',
      'patlasv4proto-portal-cpf': '123.456.789-00',
      'patlasv4proto-portal-nome': 'Mariana Alves Pereira',
      'patlasv4proto-portal-nascimento': '12/03/1990',
      'patlasv4proto-portal-estado-civil': 'Solteira',
      'patlasv4proto-portal-celular': '(65) 99999-1234',
      'patlasv4proto-portal-email': 'mariana.pereira@elogroup.com.br',
      'patlasv4proto-portal-cep': '78048-000',
      'patlasv4proto-portal-logradouro': 'Av. Historiador Rubens de Mendonça',
      'patlasv4proto-portal-numero': '1894',
      'patlasv4proto-portal-bairro': 'Bosque da Saúde',
      'patlasv4proto-portal-cidade': 'Cuiabá',
      'patlasv4proto-portal-uf': 'MT',
    },
  },
]
p.activeExamplePresetId = 'patlasv4proto-p-portal-elogroup'

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')
console.log('Portal do Parceiro atualizado para MT Login / Gov.br.')
console.log('Campos:', p.fields.length, '| Métodos:', p.methods.map((m) => m.name).join(' · '))
