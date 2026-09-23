/**
 * Ajusta Servidor ao layout da tela Sydle (identificação, perfis, permissões em tabela, dados adicionais, acesso).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const v5FormsPath = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v5-cadastral/forms.json')
const protoFormsPath = path.join(__dirname, '../data/subprojects/atlas-v4/epics/atlas-v4-prototipo/forms.json')

const SEC_DADOS = 'sec-patlasv5-srv-dados'
const SEC_PERM = 'sec-patlasv5-srv-permissoes'
const SEC_ADIC = 'sec-patlasv5-srv-dados-adic'
const SEC_SIG = 'sec-patlasv5-srv-sigadoc'
const SEC_ACESSO = 'sec-patlasv5-srv-acesso'

function fld(id, label, type, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    spec: opts.spec ?? '',
    ...(opts.sectionId ? { sectionId: opts.sectionId } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

const permissaoEmbed = {
  id: 'form-patlasv5-servidor-permissao',
  name: 'Servidor — Permissão',
  sectionLayout: 'none',
  fields: [
    fld('patlasv5-sperm-uo', 'Unidade Organizacional', 'reference', {
      size: 'medium',
      required: true,
      linkedFormId: 'form-patlasv5-unidade-organizacional',
    }),
    fld('patlasv5-sperm-atribuicoes', 'Atribuições', 'reference', {
      size: 'large',
      required: true,
      multiple: true,
      linkedFormId: 'form-patlasv5-atribuicao',
    }),
    fld('patlasv5-sperm-dados-adic', 'Dados Adicionais', 'text', {
      size: 'medium',
      spec: 'Abrir edição dos dados adicionais da permissão.',
    }),
  ],
}

const servidorForm = {
  id: 'form-patlasv5-servidor',
  name: 'Servidor',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'read',
  metadata: 'Vínculo funcional da Pessoa. Layout conforme tela Sydle: identificação, perfis, permissões, dados adicionais e acesso.',
  sections: [
    { id: SEC_DADOS, title: 'Identificação', icon: 'badge' },
    { id: SEC_PERM, title: 'Permissões', icon: 'admin_panel_settings' },
    { id: SEC_ADIC, title: 'Dados adicionais', icon: 'tune' },
    { id: SEC_SIG, title: 'Sigadoc', icon: 'description', parentSectionId: SEC_ADIC },
    { id: SEC_ACESSO, title: 'Acesso', icon: 'vpn_key' },
  ],
  fields: [
    fld('patlasv5-srv-pessoa', 'Pessoa', 'reference', {
      sectionId: SEC_DADOS,
      size: 'large',
      required: true,
      relevance: 'identity',
      linkedFormId: 'form-patlasv5-pessoa',
    }),
    fld('patlasv5-srv-matricula', 'Matrícula', 'text', { sectionId: SEC_DADOS, size: 'large' }),
    fld('patlasv5-srv-login', 'Login', 'text', {
      sectionId: SEC_DADOS,
      size: 'large',
      required: true,
      spec: 'Único quando informado.',
    }),
    fld('patlasv5-srv-email', 'E-mail', 'text', { sectionId: SEC_DADOS, size: 'large' }),
    fld('patlasv5-srv-desligado', 'Desligado', 'boolean', {
      sectionId: SEC_DADOS,
      required: true,
      relevance: 'highlight',
    }),
    fld('patlasv5-srv-perfis', 'Perfis', 'textOptions', {
      sectionId: SEC_DADOS,
      size: 'large',
      multiple: true,
      options: ['Servidor Público', 'SGCP - Sistema de Gestão de Convocação Pública'],
    }),
    fld('patlasv5-srv-permissoes', 'Permissões', 'embeddedReference', {
      sectionId: SEC_PERM,
      size: 'large',
      multiple: true,
      linkedFormId: 'form-patlasv5-servidor-permissao',
      embeddedDisplay: 'table',
      spec: 'Tabela: Unidade Organizacional, Atribuições e Dados Adicionais.',
    }),
    fld('patlasv5-srv-cargo', 'Cargo', 'text', { sectionId: SEC_ADIC, size: 'medium' }),
    fld('patlasv5-srv-carga', 'Carga horária semanal', 'text', { sectionId: SEC_ADIC, size: 'medium' }),
    fld('patlasv5-srv-mat-sigadoc', 'Matrícula do Sigadoc', 'text', { sectionId: SEC_SIG, size: 'medium' }),
    fld('patlasv5-srv-lotacao', 'Lotação', 'textOptions', {
      sectionId: SEC_SIG,
      size: 'medium',
      options: ['Selecione'],
    }),
    fld('patlasv5-srv-ativo-acesso', 'Ativo para acesso', 'boolean', {
      sectionId: SEC_ACESSO,
      required: true,
      relevance: 'highlight',
      spec: 'Deve ser false se desligado.',
    }),
    fld('patlasv5-srv-grupos', 'Grupos de usuário de acesso', 'text', { sectionId: SEC_ACESSO, hidden: true }),
    fld('patlasv5-srv-senha', 'Senha', 'text', { sectionId: SEC_ACESSO, hidden: true, readOnly: true }),
  ],
  methods: [
    { id: 'patlasv5-srv-meth-editar', name: 'Editar', icon: 'edit', kind: 'destaque' },
    { id: 'patlasv5-srv-meth-permissoes', name: 'Editar Permissões', icon: 'admin_panel_settings', kind: 'destaque' },
    { id: 'patlasv5-srv-meth-ausencias', name: 'Ausências', icon: 'event_busy', kind: 'menu' },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv5-srv-p-teste',
      name: 'NOME TESTE',
      iconColor: '#0c4a6e',
      fieldValues: {
        'patlasv5-srv-pessoa': 'NOME TESTE',
        'patlasv5-srv-login': '42518775005',
        'patlasv5-srv-desligado': false,
        'patlasv5-srv-perfis': ['Servidor Público', 'SGCP - Sistema de Gestão de Convocação Pública'],
        'patlasv5-srv-ativo-acesso': true,
      },
      embeddedRowsByFieldId: {
        'patlasv5-srv-permissoes': [
          {
            'patlasv5-sperm-uo': 'MTI',
            'patlasv5-sperm-atribuicoes': 'Chamamento Público 028/2026 - Membro de Comissão',
          },
        ],
      },
    },
    {
      id: 'patlasv5-srv-p-joao',
      name: 'João Analista MTI — UGVEN',
      iconColor: '#7c3aed',
      fieldValues: {
        'patlasv5-srv-matricula': 'pendente de confirmação',
        'patlasv5-srv-login': 'joao.analista@mti.mt.gov.br',
        'patlasv5-srv-email': 'joao.analista@mti.mt.gov.br',
        'patlasv5-srv-desligado': false,
        'patlasv5-srv-ativo-acesso': true,
        'patlasv5-srv-perfis': ['Servidor Público'],
      },
    },
  ],
  activeExamplePresetId: 'patlasv5-srv-p-teste',
}

const protoPermissaoEmbed = {
  id: 'form-patlasv4-proto-servidor-permissao',
  name: 'Servidor — Permissão',
  sectionLayout: 'none',
  fields: [
    fld('patlasv4proto-sperm-uo', 'Unidade Organizacional', 'reference', {
      required: true,
      linkedFormId: 'form-patlasv4-proto-unidade-organizacional',
    }),
    fld('patlasv4proto-sperm-atribuicoes', 'Atribuições', 'reference', {
      required: true,
      multiple: true,
      linkedFormId: 'form-patlasv4-proto-cargo',
    }),
    fld('patlasv4proto-sperm-dados-adic', 'Dados Adicionais', 'text'),
  ],
}

const P_SEC_D = 'sec-patlasv4proto-srv-dados'
const P_SEC_P = 'sec-patlasv4proto-srv-permissoes'
const P_SEC_A = 'sec-patlasv4proto-srv-dados-adic'
const P_SEC_S = 'sec-patlasv4proto-srv-sigadoc'
const P_SEC_AC = 'sec-patlasv4proto-srv-acesso'
const pp = (s) => `patlasv4proto-srv-${s}`

const protoServidorForm = {
  id: 'form-patlasv4-proto-servidor',
  name: 'Servidor',
  sectionLayout: 'accordion',
  defaultCanvasMode: 'read',
  metadata: 'Protótipo Atlas — Servidor. Layout conforme tela Sydle.',
  sections: [
    { id: P_SEC_D, title: 'Identificação', icon: 'badge' },
    { id: P_SEC_P, title: 'Permissões', icon: 'admin_panel_settings' },
    { id: P_SEC_A, title: 'Dados adicionais', icon: 'tune' },
    { id: P_SEC_S, title: 'Sigadoc', icon: 'description', parentSectionId: P_SEC_A },
    { id: P_SEC_AC, title: 'Acesso', icon: 'vpn_key' },
  ],
  fields: [
    fld(pp('pessoa'), 'Pessoa', 'reference', {
      sectionId: P_SEC_D,
      size: 'large',
      required: true,
      relevance: 'identity',
      linkedFormId: 'form-patlasv4-proto-pessoa',
      spec: 'Deve referenciar Pessoa cadastrada.',
    }),
    fld(pp('matricula'), 'Matrícula', 'text', { sectionId: P_SEC_D, size: 'large' }),
    fld(pp('login'), 'Login', 'text', { sectionId: P_SEC_D, size: 'large', required: true }),
    fld(pp('email'), 'E-mail', 'text', { sectionId: P_SEC_D, size: 'large' }),
    fld(pp('desligado'), 'Desligado', 'boolean', { sectionId: P_SEC_D, required: true, relevance: 'highlight' }),
    fld(pp('perfis'), 'Perfis', 'textOptions', {
      sectionId: P_SEC_D,
      size: 'large',
      multiple: true,
      options: ['Servidor Público', 'SGCP - Sistema de Gestão de Convocação Pública'],
    }),
    fld(pp('permissoes'), 'Permissões', 'embeddedReference', {
      sectionId: P_SEC_P,
      size: 'large',
      multiple: true,
      linkedFormId: 'form-patlasv4-proto-servidor-permissao',
      embeddedDisplay: 'table',
    }),
    fld(pp('cargo'), 'Cargo', 'text', { sectionId: P_SEC_A, size: 'medium' }),
    fld(pp('carga'), 'Carga horária semanal', 'text', { sectionId: P_SEC_A, size: 'medium' }),
    fld(pp('mat-sigadoc'), 'Matrícula do Sigadoc', 'text', { sectionId: P_SEC_S, size: 'medium' }),
    fld(pp('lotacao'), 'Lotação', 'textOptions', { sectionId: P_SEC_S, size: 'medium', options: ['Selecione'] }),
    fld(pp('ativo-acesso'), 'Ativo para acesso', 'boolean', {
      sectionId: P_SEC_AC,
      required: true,
      relevance: 'highlight',
      spec: 'Servidor inativo não acessa backoffice nem atua em novos workflows.',
    }),
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-servidor-teste',
      name: 'NOME TESTE',
      iconColor: '#0c4a6e',
      fieldValues: {
        [pp('pessoa')]: 'NOME TESTE',
        [pp('login')]: '42518775005',
        [pp('desligado')]: false,
        [pp('perfis')]: ['Servidor Público', 'SGCP - Sistema de Gestão de Convocação Pública'],
        [pp('ativo-acesso')]: true,
      },
      embeddedRowsByFieldId: {
        [pp('permissoes')]: [
          {
            'patlasv4proto-sperm-uo': 'MTI',
            'patlasv4proto-sperm-atribuicoes': 'Chamamento Público 028/2026 - Membro de Comissão',
          },
        ],
      },
    },
    {
      id: 'patlasv4proto-p-servidor-mti',
      name: 'Exemplo MTI',
      iconColor: '#7c3aed',
      fieldValues: {
        [pp('pessoa')]: 'Lucas Santos',
        [pp('matricula')]: 'MTI-123456',
        [pp('login')]: 'lucas.santos',
        [pp('desligado')]: false,
        [pp('ativo-acesso')]: true,
        [pp('perfis')]: ['Servidor Público'],
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-servidor-teste',
}

function upsertForm(forms, def) {
  const idx = forms.findIndex((f) => f.id === def.id)
  if (idx >= 0) forms[idx] = def
  else forms.push(def)
}

function patchFile(filePath, embedDefs, servidorDef) {
  const forms = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  for (const def of embedDefs) upsertForm(forms, def)
  upsertForm(forms, servidorDef)
  fs.writeFileSync(filePath, JSON.stringify(forms, null, 2) + '\n', 'utf8')
}

patchFile(v5FormsPath, [permissaoEmbed], servidorForm)
patchFile(protoFormsPath, [protoPermissaoEmbed], protoServidorForm)
console.log('Servidor — layout Sydle aplicado (V5 + Protótipo).')
