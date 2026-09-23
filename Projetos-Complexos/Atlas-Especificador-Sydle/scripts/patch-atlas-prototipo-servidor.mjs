#!/usr/bin/env node
/**
 * Servidor — campos, regras de acesso, método Criar servidor e formulários de parâmetro.
 * Uso: node scripts/patch-atlas-prototipo-servidor.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(
  __dirname,
  '../data/subprojects/atlas-v4/epics/atlas-prototipo/forms.json',
)

const FORM = 'form-patlasv4-proto-servidor'
const FORM_PERM = 'form-patlasv4-proto-servidor-permissao'
const FORM_METODO = 'form-patlasv4-proto-metodo-criar-servidor'
const FORM_METODO_PERM = 'form-patlasv4-proto-metodo-criar-servidor-permissao'
const FORM_PESSOA = 'form-patlasv4-proto-pessoa'
const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_CARGO = 'form-patlasv4-proto-cargo'

const SEC_DADOS = 'sec-patlasv4proto-srv-dados'
const SEC_PERM = 'sec-patlasv4proto-srv-permissoes'
const SEC_ADIC = 'sec-patlasv4proto-srv-dados-adic'
const SEC_SIGADOC = 'sec-patlasv4proto-srv-sigadoc'
const SEC_ACESSO = 'sec-patlasv4proto-srv-acesso'
const SEC_AVANC = 'sec-patlasv4proto-srv-avancado'

const UO_OPTIONS = [
  'Empresa Mato-grossense de Tecnologia da Informação',
  'Gabinete da Diretoria de Relacionamento com o Cliente',
  'Unidade de Gestão de Projetos',
  'Unidade de Gestão de Aquisições e Contratos',
  'Gerência de Contratos',
  'EloGroup',
  'Secretaria de Estado de Planejamento e Gestão',
]

const CARGO_OPTIONS = [
  'Diretor',
  'Gerente de Projetos',
  'Analista de Sistemas',
  'Presidente de Comissão',
  'Membro de Comissão',
]

function f(id, label, type, sectionId, opts = {}) {
  return {
    id,
    label,
    type,
    size: opts.size ?? 'medium',
    readOnly: opts.readOnly ?? false,
    required: opts.required ?? false,
    multiple: opts.multiple ?? false,
    relevance: opts.relevance ?? 'common',
    sectionId,
    ...(opts.options ? { options: opts.options } : {}),
    ...(opts.linkedFormId ? { linkedFormId: opts.linkedFormId } : {}),
    ...(opts.embeddedDisplay ? { embeddedDisplay: opts.embeddedDisplay } : {}),
    ...(opts.spec ? { spec: opts.spec } : {}),
    ...(opts.hidden ? { hidden: true } : {}),
  }
}

function buildPermissaoForm() {
  return {
    id: FORM_PERM,
    name: 'Servidor — Permissão',
    sectionLayout: 'none',
    metadata: 'Linha embutida — permissão do servidor (UO, atribuições, dados adicionais).',
    fields: [
      f('patlasv4proto-sperm-uo', 'Unidade Organizacional', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
      }),
      f('patlasv4proto-sperm-atribuicoes', 'Atribuições', 'reference', null, {
        required: true,
        multiple: true,
        linkedFormId: FORM_CARGO,
        options: CARGO_OPTIONS,
        spec: 'Cargos vinculados à organização e unidade selecionadas.',
      }),
      f('patlasv4proto-sperm-dados-adic', 'Dados Adicionais', 'text', null, {
        spec: 'Complemento editável da permissão (modal Editar na tela de referência).',
      }),
    ],
  }
}

function buildMetodoPermissaoForm() {
  return {
    id: FORM_METODO_PERM,
    name: 'Parâmetro — Permissão (Criar servidor)',
    sectionLayout: 'none',
    metadata:
      'Linha do método Criar servidor. Organização raiz → Unidade organizacional → Cargos disponíveis.',
    fields: [
      f('patlasv4proto-scm-org', 'Organização', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: [
          'Empresa Mato-grossense de Tecnologia da Informação',
          'EloGroup',
          'Secretaria de Estado de Planejamento e Gestão',
        ],
        spec: 'Organização raiz (Representa Organização? = Sim).',
      }),
      f('patlasv4proto-scm-uo', 'Unidade Organizacional', 'reference', null, {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
        spec: 'Unidades cadastradas vinculadas à organização selecionada.',
      }),
      f('patlasv4proto-scm-atrib', 'Atribuições', 'reference', null, {
        required: true,
        linkedFormId: FORM_CARGO,
        options: CARGO_OPTIONS,
        spec: 'Cargos da organização e unidade — filtrados conforme cadastro de Cargo.',
      }),
      f('patlasv4proto-scm-dados-adic', 'Dados Adicionais', 'text', null, {
        spec: 'Complemento editável (botão Editar na tela de referência).',
      }),
    ],
  }
}

function buildMetodoCriarServidorForm() {
  return {
    id: FORM_METODO,
    name: 'Parâmetro de método: Criar servidor',
    sectionLayout: 'none',
    defaultCanvasMode: 'edit',
    metadata: 'Formulário de entrada do método Criar servidor na classe Servidor.',
    fields: [
      f('patlasv4proto-scm-cpf', 'CPF', 'reference', null, {
        required: true,
        size: 'large',
        relevance: 'identity',
        linkedFormId: FORM_PESSOA,
        options: [
          'Bernardo Alves Bicalho Vorges',
          'Lucas Santos',
          'João Analista MTI',
          'Maria Consultora Parceira',
        ],
        spec: 'Pessoa selecionada — exibe o CPF do cadastro.',
      }),
      f('patlasv4proto-scm-matricula', 'Matrícula', 'text', null, { size: 'large' }),
      f('patlasv4proto-scm-perfil', 'Perfil', 'textOptions', null, {
        required: true,
        size: 'large',
        options: ['cliente', 'parceiro', 'mti'],
        spec: 'Perfil de atuação do servidor (substitui Secretaria na tela de referência).',
      }),
      f('patlasv4proto-scm-permissoes', 'Permissões', 'embeddedReference', null, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_METODO_PERM,
        embeddedDisplay: 'table',
        spec: 'Organização, unidade organizacional e cargos (atribuições) por linha.',
      }),
      f('patlasv4proto-scm-desligado', 'Desligado', 'boolean', null, {
        relevance: 'highlight',
      }),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-metodo-criar-servidor',
        name: 'Novo servidor',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-scm-cpf': 'Bernardo Alves Bicalho Vorges',
          'patlasv4proto-scm-perfil': 'mti',
          'patlasv4proto-scm-desligado': false,
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-scm-permissoes': [
            {
              'patlasv4proto-scm-org': 'Empresa Mato-grossense de Tecnologia da Informação',
              'patlasv4proto-scm-uo': 'Unidade de Gestão de Projetos',
              'patlasv4proto-scm-atrib': 'Gerente de Projetos',
            },
          ],
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-metodo-criar-servidor',
  }
}

function buildServidorForm() {
  return {
    id: FORM,
    name: 'Servidor',
    sectionLayout: 'accordion',
    defaultCanvasMode: 'edit',
    metadata:
      'Protótipo Atlas — Servidor. Pessoa, permissões por UO, dados adicionais, acesso e configurações avançadas.',
    sections: [
      { id: SEC_DADOS, title: 'Identificação', icon: 'badge' },
      { id: SEC_PERM, title: 'Permissões', icon: 'admin_panel_settings' },
      { id: SEC_ADIC, title: 'Dados adicionais', icon: 'tune' },
      { id: SEC_SIGADOC, title: 'Sigadoc', icon: 'description', parentSectionId: SEC_ADIC },
      { id: SEC_ACESSO, title: 'Acesso', icon: 'vpn_key' },
      { id: SEC_AVANC, title: 'Avançado', icon: 'settings' },
    ],
    fields: [
      f('patlasv4proto-srv-pessoa', 'Pessoa', 'reference', SEC_DADOS, {
        required: true,
        size: 'large',
        relevance: 'identity',
        linkedFormId: FORM_PESSOA,
        options: [
          'Lucas dos Santos / lucas.santos@pclogroup.com.br',
          'Lucas Santos',
          'João Analista MTI',
          'Maria Consultora Parceira',
        ],
        spec: 'Referência à Pessoa cadastrada (nome e e-mail).',
      }),
      f('patlasv4proto-srv-matricula', 'Matrícula', 'text', SEC_DADOS, { size: 'large' }),
      f('patlasv4proto-srv-login', 'Login', 'text', SEC_DADOS, {
        required: true,
        size: 'large',
      }),
      f('patlasv4proto-srv-email', 'E-mail', 'text', SEC_DADOS, { size: 'large' }),
      f('patlasv4proto-srv-desligado', 'Desligado', 'boolean', SEC_DADOS, {
        required: true,
        relevance: 'highlight',
      }),
      f('patlasv4proto-srv-perfis', 'Perfis', 'textOptions', SEC_DADOS, {
        size: 'large',
        multiple: true,
        options: [
          'Servidor Público',
          'SGCP - Sistema de Gestão de Convocação Pública',
        ],
      }),
      f('patlasv4proto-srv-permissoes', 'Permissões', 'embeddedReference', SEC_PERM, {
        size: 'large',
        multiple: true,
        linkedFormId: FORM_PERM,
        embeddedDisplay: 'table',
        spec: 'Unidade organizacional, atribuições (cargos) e dados adicionais por linha.',
      }),
      f('patlasv4proto-srv-cargo', 'Cargo', 'text', SEC_ADIC, {
        required: true,
        spec: 'Cargo funcional do servidor.',
      }),
      f('patlasv4proto-srv-carga', 'Carga horária semanal', 'text', SEC_ADIC, {}),
      f('patlasv4proto-srv-mat-sigadoc', 'Matrícula do Sigadoc', 'text', SEC_SIGADOC, {
        required: true,
        spec: 'Matrícula de integração com o Sigadoc.',
      }),
      f('patlasv4proto-srv-lotacao', 'Lotação', 'textOptions', SEC_ADIC, {
        options: [
          'Nenhum(a)',
          'Gabinete da Diretoria de Relacionamento com o Cliente',
          'Unidade de Gestão de Projetos',
          'Unidade de Gestão de Aquisições e Contratos',
        ],
      }),
      f('patlasv4proto-srv-ativo-acesso', 'Ativo para acesso', 'boolean', SEC_ACESSO, {
        required: true,
        relevance: 'highlight',
        spec: 'Servidor inativo não acessa backoffice nem atua em novos workflows.',
      }),
      f('patlasv4proto-srv-grupos-acesso', 'Grupos de usuário de acesso', 'textOptions', SEC_ACESSO, {
        size: 'large',
        multiple: true,
        options: [
          'Administradores do Sistema',
          'Gestores MTI',
          'Operadores SGCP',
          'Consultores Externos',
        ],
        spec: 'Grupos de segurança vinculados ao servidor.',
      }),
      f('patlasv4proto-srv-senha', 'Senha', 'text', SEC_AVANC, {
        readOnly: true,
        spec: 'Armazenamento criptografado.',
      }),
      f('patlasv4proto-srv-preferencias', 'Preferências', 'reference', SEC_AVANC, {
        options: ['Preferências padrão do usuário'],
        spec: 'Configurações de interface e notificações do usuário.',
      }),
      f(
        'patlasv4proto-srv-preferencias-analytics',
        'Preferências de Analytics do Usuário',
        'text',
        SEC_AVANC,
        { spec: 'Configurações de analytics; vazio quando não definido.' },
      ),
    ],
    exampleValuePresets: [
      {
        id: 'patlasv4proto-p-servidor-lucas',
        name: 'Lucas dos Santos',
        iconColor: '#0c4a6e',
        fieldValues: {
          'patlasv4proto-srv-pessoa': 'Lucas dos Santos / lucas.santos@pclogroup.com.br',
          'patlasv4proto-srv-login': '11734943912',
          'patlasv4proto-srv-email': 'lucas.santos@pclogroup.com.br',
          'patlasv4proto-srv-desligado': false,
          'patlasv4proto-srv-perfis': [
            'Servidor Público',
            'SGCP - Sistema de Gestão de Convocação Pública',
          ],
          'patlasv4proto-srv-cargo': 'Analista de Sistemas',
          'patlasv4proto-srv-carga': '40 horas',
          'patlasv4proto-srv-mat-sigadoc': 'SIGA-117349',
          'patlasv4proto-srv-ativo-acesso': true,
          'patlasv4proto-srv-senha': 'criptografado',
          'patlasv4proto-srv-grupos-acesso': ['Gestores MTI', 'Operadores SGCP'],
        },
        embeddedRowsByFieldId: {
          'patlasv4proto-srv-permissoes': [
            {
              'patlasv4proto-sperm-uo': 'Empresa Mato-grossense de Tecnologia da Informação',
              'patlasv4proto-sperm-atribuicoes': ['Gerente de Projetos'],
            },
          ],
        },
      },
      {
        id: 'patlasv4proto-p-servidor-mti',
        name: 'Exemplo MTI',
        iconColor: '#7c3aed',
        fieldValues: {
          'patlasv4proto-srv-pessoa': 'Lucas Santos',
          'patlasv4proto-srv-matricula': 'MTI-123456',
          'patlasv4proto-srv-login': 'lucas.santos',
          'patlasv4proto-srv-desligado': false,
          'patlasv4proto-srv-ativo-acesso': true,
          'patlasv4proto-srv-perfis': ['Servidor Público'],
          'patlasv4proto-srv-cargo': 'Gerente de Projetos',
          'patlasv4proto-srv-mat-sigadoc': 'SIGA-MTI-001',
          'patlasv4proto-srv-senha': 'criptografado',
        },
      },
      {
        id: 'patlasv4proto-p-servidor-parceiro',
        name: 'Exemplo Parceiro',
        iconColor: '#0d9488',
        fieldValues: {
          'patlasv4proto-srv-pessoa': 'Maria Consultora Parceira',
          'patlasv4proto-srv-matricula': 'ELO-0001',
          'patlasv4proto-srv-login': 'maria.consultora',
          'patlasv4proto-srv-desligado': false,
          'patlasv4proto-srv-ativo-acesso': true,
          'patlasv4proto-srv-perfis': ['Servidor Público'],
          'patlasv4proto-srv-cargo': 'Consultora',
          'patlasv4proto-srv-senha': 'criptografado',
        },
      },
      {
        id: 'patlasv4proto-p-servidor-cliente',
        name: 'Exemplo Cliente',
        iconColor: '#0369a1',
        fieldValues: {
          'patlasv4proto-srv-pessoa': 'Carlos Gestor Cliente',
          'patlasv4proto-srv-matricula': 'CLI-0001',
          'patlasv4proto-srv-login': 'carlos.gestor',
          'patlasv4proto-srv-desligado': false,
          'patlasv4proto-srv-ativo-acesso': false,
          'patlasv4proto-srv-perfis': ['Servidor Público'],
        },
      },
    ],
    activeExamplePresetId: 'patlasv4proto-p-servidor-lucas',
  }
}

function patchCargoForm(cargo) {
  const fields = [...(cargo.fields ?? [])]
  const orgIdx = fields.findIndex((x) => x.id === 'patlasv4proto-cargo-dados-do-cargo-organizacao')
  if (!fields.some((x) => x.id === 'patlasv4proto-cargo-dados-do-cargo-unidade-organizacional')) {
    const uoField = f(
      'patlasv4proto-cargo-dados-do-cargo-unidade-organizacional',
      'Unidade organizacional',
      'reference',
      'sec-cargo-dados-do-cargo',
      {
        required: true,
        linkedFormId: FORM_UO,
        options: UO_OPTIONS,
        spec: 'Unidade de atuação do cargo dentro da organização raiz (RN-CARGO-04/05).',
      },
    )
    if (orgIdx >= 0) fields.splice(orgIdx + 1, 0, uoField)
    else fields.push(uoField)
  }
  const presets = (cargo.exampleValuePresets ?? []).map((preset) => {
    const fv = { ...(preset.fieldValues ?? {}) }
    if (
      fv['patlasv4proto-cargo-dados-do-cargo-organizacao'] &&
      !fv['patlasv4proto-cargo-dados-do-cargo-unidade-organizacional']
    ) {
      fv['patlasv4proto-cargo-dados-do-cargo-unidade-organizacional'] =
        'Unidade de Gestão de Projetos'
    }
    return { ...preset, fieldValues: fv }
  })
  return { ...cargo, fields, exampleValuePresets: presets }
}

function upsertForm(forms, formDef) {
  const idx = forms.findIndex((x) => x.id === formDef.id)
  if (idx >= 0) forms[idx] = formDef
  else forms.push(formDef)
}

function patchWorkspace(workspaces) {
  for (const ws of workspaces) {
    for (const pkg of ws.packages ?? []) {
      for (const cls of pkg.classes ?? []) {
        if (cls.id !== 'cls-patlasv4-proto-srv') continue
        const ids = new Set(cls.linkedFormExamplePresetIds ?? [])
        ids.add('patlasv4proto-p-servidor-lucas')
        cls.linkedFormExamplePresetIds = [
          'patlasv4proto-p-servidor-lucas',
          ...[...ids].filter((id) => id !== 'patlasv4proto-p-servidor-lucas'),
        ]
      }
    }
  }
  return workspaces
}

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
  upsertForm(forms, buildPermissaoForm())
  upsertForm(forms, buildMetodoPermissaoForm())
  upsertForm(forms, buildMetodoCriarServidorForm())
  upsertForm(forms, buildServidorForm())

  const cargoIdx = forms.findIndex((x) => x.id === FORM_CARGO)
  if (cargoIdx >= 0) forms[cargoIdx] = patchCargoForm(forms[cargoIdx])

  fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

  const wsPath = path.join(
    __dirname,
    '../data/subprojects/atlas-v4/epics/atlas-prototipo/workspaces.json',
  )
  const workspaces = JSON.parse(fs.readFileSync(wsPath, 'utf8'))
  fs.writeFileSync(wsPath, `${JSON.stringify(patchWorkspace(workspaces), null, 2)}\n`, 'utf8')

  console.log('✓ Servidor — regra login/senha quando ativo para acesso')
  console.log('✓ Servidor — método Criar servidor com formulário de parâmetros')
  console.log('✓ Cargo — campo Unidade organizacional')
}

main()
