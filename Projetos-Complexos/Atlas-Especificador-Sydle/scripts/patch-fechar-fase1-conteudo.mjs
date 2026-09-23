#!/usr/bin/env node
/** Fecha itens da F1: extrato de publicação (Contrato), Template de signatários,
 *  nota do sino/badge (Notificação). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EPIC = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo')
const FORMS_PATH = path.join(EPIC, 'forms.json')
const CG_PATH = path.join(EPIC, 'class-groups.json')

const FORM_CONTRATO = 'form-patlasv4-proto-contrato'
const FORM_WF = 'mqebasqyphbwea'
const FORM_NOTIF = 'form-patlasv4-proto-notificacao'
const FORM_TS = 'form-patlasv4-proto-template-signatarios'
const FORM_TS_LINHA = 'form-patlasv4-proto-template-signatario-linha'
const SEC_CONTRATO = 'sec-patlasv4proto-contrato-sec-contrato'

const ORGS = ['Empresa Mato-grossense de Tecnologia da Informação', 'EloGroup', 'Secretaria de Estado de Planejamento e Gestão']
const CAMINHOS = ['MTI', 'MTI/GDP', 'MTI/DIRC', 'MTI/DTIC', 'MTI/DIRADM', 'MTI/UGP', 'EloGroup', 'SEPLAG/GECON']
const CARGOS = ['Diretor', 'Diretor DIRC', 'Gerente de Projetos', 'Fiscal de Contrato']

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const add = (form, field, afterId) => {
  if (form.fields.some((f) => f.id === field.id)) return
  const i = afterId ? form.fields.findIndex((f) => f.id === afterId) : -1
  form.fields.splice(i >= 0 ? i + 1 : form.fields.length, 0, field)
}

// ---------- 1) Extrato de publicação no Contrato ----------
const contrato = forms.find((f) => f.id === FORM_CONTRATO)
add(contrato, { id: 'patlasv4proto-contrato-extrato-publicacao', label: 'Extrato de publicação', type: 'file', size: 'large', readOnly: false, required: false, multiple: false, relevance: 'highlight', sectionId: SEC_CONTRATO, spec: 'Comprovante de publicação do extrato. Obrigatório para a validade jurídica do contrato (Modelagem 22/05).' }, 'patlasv4proto-contrato-numero')
add(contrato, { id: 'patlasv4proto-contrato-data-publicacao', label: 'Data da publicação', type: 'date', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: SEC_CONTRATO, spec: 'Data da publicação do extrato.' }, 'patlasv4proto-contrato-extrato-publicacao')
add(contrato, { id: 'patlasv4proto-contrato-veiculo-publicacao', label: 'Veículo / nº da publicação', type: 'text', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: SEC_CONTRATO, spec: 'Diário Oficial / nº do extrato publicado.' }, 'patlasv4proto-contrato-data-publicacao')

// ---------- 2) Template de signatários reutilizável ----------
if (!forms.some((f) => f.id === FORM_TS_LINHA)) {
  forms.push({
    id: FORM_TS_LINHA, name: 'Linha · signatário do template', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Linha embutida — papel de signatário no template reutilizável.',
    fields: [
      { id: 'patlasv4proto-tsig-organizacao', label: 'Organização', type: 'reference', size: 'medium', readOnly: false, required: true, multiple: false, relevance: 'identity', options: ORGS, linkedFormId: 'form-patlasv4-proto-unidade-organizacional' },
      { id: 'patlasv4proto-tsig-unidade', label: 'Unidade organizacional', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', options: CAMINHOS, linkedFormId: 'form-patlasv4-proto-unidade-organizacional' },
      { id: 'patlasv4proto-tsig-cargo', label: 'Cargo', type: 'reference', size: 'medium', readOnly: false, required: false, multiple: false, relevance: 'common', options: CARGOS, linkedFormId: 'form-patlasv4-proto-cargo', spec: 'Apenas cargos que podem assinar.' },
      { id: 'patlasv4proto-tsig-papel', label: 'Papel no envelope', type: 'textOptions', size: 'small', readOnly: false, required: false, multiple: false, relevance: 'common', options: ['Principal', 'Complementar', 'Observador'] },
    ],
    exampleValuePresets: [],
  })
}
if (!forms.some((f) => f.id === FORM_TS)) {
  forms.push({
    id: FORM_TS, name: 'Template de signatários', sectionLayout: 'none', defaultCanvasMode: 'edit',
    metadata: 'Grupo reutilizável de signatários (papéis por cargo/unidade) para reaproveitar em workflows e envelopes de assinatura.',
    fields: [
      { id: 'patlasv4proto-ts-nome', label: 'Nome', type: 'text', size: 'large', readOnly: false, required: true, multiple: false, relevance: 'identity', spec: 'Ex.: Diretoria MTI, Diretoria + Parceiro.' },
      { id: 'patlasv4proto-ts-ativo', label: 'Ativo', type: 'boolean', size: 'small', readOnly: false, required: true, multiple: false, relevance: 'common' },
      { id: 'patlasv4proto-ts-signatarios', label: 'Signatários', type: 'embeddedReference', size: 'large', readOnly: false, required: false, multiple: true, relevance: 'common', linkedFormId: FORM_TS_LINHA, embeddedDisplay: 'table', spec: 'Papéis por cargo/unidade reaproveitáveis.' },
    ],
    exampleValuePresets: [
      { id: 'patlasv4proto-p-ts-diretoria', name: 'Diretoria MTI', fieldValues: { 'patlasv4proto-ts-nome': 'Diretoria MTI', 'patlasv4proto-ts-ativo': true }, embeddedRowsByFieldId: { 'patlasv4proto-ts-signatarios': [
        { 'patlasv4proto-tsig-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação', 'patlasv4proto-tsig-unidade': 'MTI/DIRC', 'patlasv4proto-tsig-cargo': 'Diretor', 'patlasv4proto-tsig-papel': 'Principal' },
        { 'patlasv4proto-tsig-organizacao': 'Empresa Mato-grossense de Tecnologia da Informação', 'patlasv4proto-tsig-unidade': 'MTI/UGP', 'patlasv4proto-tsig-cargo': 'Gerente de Projetos', 'patlasv4proto-tsig-papel': 'Complementar' },
      ] } },
    ],
    activeExamplePresetId: 'patlasv4proto-p-ts-diretoria',
  })
}
// referência no Workflow de Assinatura
const wf = forms.find((f) => f.id === FORM_WF)
if (wf && !wf.fields.some((f) => f.id === 'patlasv4proto-wf-template-signatarios')) {
  const i = wf.fields.findIndex((f) => f.id === 'patlasv4proto-wf-ativo')
  wf.fields.splice(i >= 0 ? i + 1 : wf.fields.length, 0, {
    id: 'patlasv4proto-wf-template-signatarios', label: 'Template de signatários', type: 'reference', size: 'medium',
    readOnly: false, required: false, multiple: false, relevance: 'common', sectionId: wf.fields[0]?.sectionId,
    linkedFormId: FORM_TS, spec: 'Opcional — reaproveita um grupo de signatários pré-configurado em vez de montar etapa por etapa.',
  })
}

// ---------- 3) Sino / badge na Notificação ----------
const notif = forms.find((f) => f.id === FORM_NOTIF)
const envio = notif?.fields.find((f) => f.id === 'patlasv4proto-notif-tipo-envio')
if (envio) envio.spec = 'Canais simultâneos. Interna/Portal = central de notificações exibida no sino do cabeçalho (com badge de pendências); E-mail = envio externo.'

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// class-groups: registra template de signatários na Assinatura
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
cg.assignments[FORM_TS] = 'grp-11-assinatura'
cg.assignments[FORM_TS_LINHA] = 'grp-11-assinatura-emb'
if (!cg.memberOrderByGroup['grp-11-assinatura'].includes(FORM_TS)) cg.memberOrderByGroup['grp-11-assinatura'].push(FORM_TS)
cg.memberOrderByGroup['grp-11-assinatura-emb'] = cg.memberOrderByGroup['grp-11-assinatura-emb'] || []
if (!cg.memberOrderByGroup['grp-11-assinatura-emb'].includes(FORM_TS_LINHA)) cg.memberOrderByGroup['grp-11-assinatura-emb'].push(FORM_TS_LINHA)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Conteúdo F1 aplicado: extrato de publicação, Template de signatários, nota do sino/badge.')
