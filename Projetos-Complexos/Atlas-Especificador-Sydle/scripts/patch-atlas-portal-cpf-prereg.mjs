#!/usr/bin/env node
/**
 * Portal do Parceiro — fluxo PRIMÁRIO (implementar agora): a MTI pré-cadastra o
 * CPF; a pessoa entra via MT Login/Gov.br, o CPF bate e mostra a organização.
 * O fluxo por código de convite vai para BACKLOG.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_PORTAL = 'form-patlasv4-proto-portal-parceiro'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_PRE = 'form-patlasv4-proto-metodo-precadastro-acesso'
const FORM_CONVITE = 'form-patlasv4-proto-convite-cadastro'
const FORM_GERAR_CONVITE = 'form-patlasv4-proto-metodo-gerar-convite'
const SEC_LOGIN = 'sec-patlasv4proto-portal-login'
const SEC_DADOS = 'sec-patlasv4proto-portal-dados'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const ro = (id, label, type, o = {}) => ({
  id, label, type, size: o.size || 'medium', readOnly: o.readOnly !== false,
  hidden: false, required: o.required || false, multiple: false,
  relevance: o.relevance || 'common', ...(o.sectionId ? { sectionId: o.sectionId } : {}),
  ...(o.options ? { options: o.options } : {}), ...(o.spec ? { spec: o.spec } : {}),
})

// ---------- 1) Portal: fluxo primário (CPF pré-cadastrado + MT Login/Gov.br) ----------
const p = forms.find((f) => f.id === FORM_PORTAL)
p.metadata = 'Acesso do colaborador (fluxo primário F1): a MTI pré-cadastra o CPF vinculado à organização; a pessoa entra no Portal pelo MT Login ou Gov.br, o CPF é verificado contra o pré-cadastro e o sistema mostra a organização à qual está vinculada. Dados do provedor são somente leitura — sem senha no Atlas. O fluxo por código de convite/link é backlog.'
p.sections = [
  { id: SEC_LOGIN, title: 'Acesso (MT Login / Gov.br)', icon: 'login' },
  { id: SEC_DADOS, title: 'Seus dados (via MT Login / Gov.br)', icon: 'badge' },
]
p.fields = [
  {
    id: 'patlasv4proto-portal-login-alerta', label: 'Entre com MT Login ou Gov.br', type: 'alert',
    size: 'medium', readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common',
    sectionId: SEC_LOGIN, alertVariant: 'info', alertTitle: 'Acesso por identidade verificada',
    alertMessage: 'Entre com MT Login ou Gov.br. Seu CPF é verificado contra o pré-cadastro feito pela MTI; se encontrado, o sistema mostra a organização à qual você está vinculado. Nenhuma senha é criada no Atlas.',
  },
  ro('patlasv4proto-portal-cpf', 'CPF', 'text', { size: 'small', relevance: 'identity', sectionId: SEC_LOGIN, spec: 'Retornado pelo MT Login / Gov.br após o login.' }),
  ro('patlasv4proto-portal-situacao-cpf', 'Situação do CPF', 'textOptions', { size: 'small', relevance: 'highlight', sectionId: SEC_LOGIN, options: ['Encontrado no pré-cadastro', 'Não encontrado'], spec: 'Resultado da verificação contra o pré-cadastro da MTI.' }),
  ro('patlasv4proto-portal-organizacao', 'Organização vinculada', 'text', { sectionId: SEC_LOGIN, spec: 'Organização à qual o CPF foi pré-cadastrado pela MTI.' }),
  // dados do provedor (read-only)
  ro('patlasv4proto-portal-nome', 'Nome completo', 'text', { size: 'large', relevance: 'identity', sectionId: SEC_DADOS, spec: 'Retornado pelo MT Login / Gov.br.' }),
  ro('patlasv4proto-portal-nascimento', 'Data de nascimento', 'date', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-estado-civil', 'Estado civil', 'text', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-nome-social', 'Nome social', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-filiacao', 'Filiação', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-celular', 'Celular', 'text', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-email', 'E-mail', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-cep', 'CEP', 'text', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-logradouro', 'Logradouro', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-numero', 'Número', 'text', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-complemento', 'Complemento', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-bairro', 'Bairro', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-cidade', 'Cidade (Município)', 'text', { sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-uf', 'UF (Estado)', 'text', { size: 'small', sectionId: SEC_DADOS }),
  ro('patlasv4proto-portal-foto', 'Foto', 'file', { sectionId: SEC_DADOS, spec: 'Extraída do MT Login / Gov.br quando disponível.' }),
]
p.methods = [
  { id: 'patlasv4proto-portal-meth-mtlogin', name: 'Entrar com MT Login', icon: 'login', kind: 'destaque', spec: 'Autentica no MT Login; o CPF retornado é verificado contra o pré-cadastro da MTI.' },
  { id: 'patlasv4proto-portal-meth-govbr', name: 'Entrar com Gov.br', icon: 'login', kind: 'destaque', spec: 'Autentica no Gov.br; o CPF retornado é verificado contra o pré-cadastro da MTI.' },
  { id: 'patlasv4proto-portal-meth-concluir', name: 'Confirmar cadastro', icon: 'how_to_reg', kind: 'destaque', spec: 'Confirma o vínculo do CPF com a organização pré-cadastrada e cria a Pessoa. Gera Solicitação de vínculo (Pendente) quando exigir aprovação do gestor.' },
  { id: 'patlasv4proto-portal-meth-cancelar', name: 'Cancelar', icon: 'close', kind: 'menu', spec: 'Encerra o acesso sem concluir o cadastro.' },
]
p.exampleValuePresets = [
  {
    id: 'patlasv4proto-p-portal-elogroup', name: 'Acesso EloGroup (MT Login)', iconColor: '#7c3aed',
    fieldValues: {
      'patlasv4proto-portal-cpf': '123.456.789-00',
      'patlasv4proto-portal-situacao-cpf': 'Encontrado no pré-cadastro',
      'patlasv4proto-portal-organizacao': 'EloGroup',
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

// ---------- 2) Método na Organização: Pré-cadastrar acesso (CPF) ----------
if (!forms.some((f) => f.id === FORM_PRE)) {
  forms.push({
    id: FORM_PRE, name: '(1.M7) Pré-cadastrar acesso (CPF)', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'A MTI informa o CPF da pessoa e a organização de vínculo. A pessoa depois acessa o Portal pelo MT Login/Gov.br com esse CPF para concluir o cadastro.',
    fields: [
      {
        id: 'patlasv4proto-pre-alerta', label: 'Pré-cadastro de acesso', type: 'alert', size: 'medium',
        readOnly: false, hidden: false, required: false, multiple: false, relevance: 'common',
        alertVariant: 'info', alertTitle: 'Como funciona',
        alertMessage: 'Informe o CPF da pessoa. Ela acessará o Portal do Parceiro e fará login no MT Login/Gov.br com esse CPF — o sistema verifica o pré-cadastro e mostra esta organização.',
      },
      ro('patlasv4proto-pre-cpf', 'CPF', 'text', { size: 'small', readOnly: false, required: true, relevance: 'identity', spec: 'CPF da pessoa a ser pré-cadastrada para acesso.' }),
      ro('patlasv4proto-pre-nome', 'Nome (opcional)', 'text', { readOnly: false, spec: 'Nome de referência; os dados oficiais vêm do MT Login/Gov.br.' }),
      ro('patlasv4proto-pre-organizacao', 'Organização', 'text', { spec: 'Pré-preenchida com a organização atual.' }),
      ro('patlasv4proto-pre-cargo', 'Cargo (opcional)', 'reference', { readOnly: false, linkedFormId: 'form-patlasv4-proto-cargo', spec: 'Cargo sugerido para a pessoa após o cadastro.' }),
    ],
    exampleValuePresets: [
      { id: 'patlasv4proto-p-pre-exemplo', name: 'Exemplo — pré-cadastro', fieldValues: { 'patlasv4proto-pre-cpf': '123.456.789-00', 'patlasv4proto-pre-nome': 'Mariana Alves Pereira', 'patlasv4proto-pre-organizacao': 'EloGroup' } },
    ],
    activeExamplePresetId: 'patlasv4proto-p-pre-exemplo',
  })
}
const uo = forms.find((f) => f.id === FORM_UO)
if (!uo.methods.some((m) => m.id === 'patlasv4proto-uo-meth-precadastro')) {
  // insere após "Cadastrar cargo" (ou no fim)
  const novo = { id: 'patlasv4proto-uo-meth-precadastro', name: 'Pré-cadastrar acesso (CPF)', icon: 'badge', kind: 'destaque', inputFormId: FORM_PRE }
  uo.methods.push(novo)
}
// rótulo do gerar convite → backlog
const mGerar = uo.methods.find((m) => m.id === 'patlasv4proto-uo-meth-gerar-convite')
if (mGerar) mGerar.name = 'Gerar Código de Convite (backlog)'

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// ---------- 3) class-groups: convite por código → backlog ----------
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
cg.assignments = cg.assignments || {}
cg.assignments[FORM_PRE] = 'grp-01-organizacao-met'
const met = cg.memberOrderByGroup?.['grp-01-organizacao-met']
if (met && !met.includes(FORM_PRE)) met.push(FORM_PRE)

const BACKLOG = 'grp-07-backlog'
for (const id of [FORM_CONVITE, FORM_GERAR_CONVITE]) {
  // remove de qualquer ordem antiga
  for (const g of Object.keys(cg.memberOrderByGroup || {})) {
    cg.memberOrderByGroup[g] = cg.memberOrderByGroup[g].filter((x) => x !== id)
  }
  cg.assignments[id] = BACKLOG
  cg.memberOrderByGroup[BACKLOG] = cg.memberOrderByGroup[BACKLOG] || []
  if (!cg.memberOrderByGroup[BACKLOG].includes(id)) cg.memberOrderByGroup[BACKLOG].push(id)
}
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Portal atualizado para fluxo primário (CPF pré-cadastrado + MT Login/Gov.br).')
console.log('Método "Pré-cadastrar acesso (CPF)" adicionado à Organização.')
console.log('Convite por código (classe + gerar convite) movido para Backlog.')
