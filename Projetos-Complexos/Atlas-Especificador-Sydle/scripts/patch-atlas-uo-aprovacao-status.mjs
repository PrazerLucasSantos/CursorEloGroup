#!/usr/bin/env node
/**
 * Liga os métodos Aprovar cadastro / Solicitar ajuste ao Status da habilitação
 * documental. Aprovar → "Aprovada pela MTI" (libera comercial); Solicitar ajuste
 * → "Em apresentação" (volta para correção).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json')
const CG_PATH = path.join(__dirname, '../data/subprojects/atlas-prototipo/epics/prototipo/class-groups.json')

const FORM_UO = 'form-patlasv4-proto-unidade-organizacional'
const FORM_AJUSTE = 'form-patlasv4-proto-metodo-solicitar-ajuste-org'
const FORM_APROVAR = 'form-patlasv4-proto-metodo-aprovar-cadastro-org'

const forms = JSON.parse(fs.readFileSync(FORMS_PATH, 'utf8'))
const uo = forms.find((f) => f.id === FORM_UO)

// 1) Status da habilitação — descreve as transições pelas ações
const status = uo.fields.find((f) => f.id === 'patlasv4proto-uo-habilitacao-status')
if (status) {
  status.spec = 'Etapa geral da habilitação do parceiro. Controlado pelas ações: "Aprovar cadastro" → "Aprovada pela MTI" (libera o acesso comercial); "Solicitar ajuste" → "Em apresentação" (volta para correção do responsável).'
}

// 2) Formulário do método "Aprovar cadastro"
const aprovarForm = {
  id: FORM_APROVAR,
  name: '(1.M6) Aprovar cadastro',
  sectionLayout: 'none',
  defaultCanvasMode: 'edit',
  metadata: 'Confirmação da aprovação do cadastro. Ao confirmar, o Status da habilitação documental muda para "Aprovada pela MTI" e o acesso comercial é liberado.',
  fields: [
    {
      id: 'patlasv4proto-aprovar-org-alerta',
      label: 'Aprovação do cadastro',
      type: 'alert',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      alertVariant: 'success',
      alertTitle: 'Confirmar aprovação',
      alertMessage: 'Ao confirmar, o Status da habilitação documental muda para "Aprovada pela MTI" e o Acesso comercial bloqueado passa a Não.',
    },
    {
      id: 'patlasv4proto-aprovar-org-novo-status',
      label: 'Novo status',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      spec: 'Resultado da ação (somente leitura).',
    },
    {
      id: 'patlasv4proto-aprovar-org-observacao',
      label: 'Observação (opcional)',
      type: 'text',
      size: 'large',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      textLong: true,
    },
  ],
  exampleValuePresets: [
    {
      id: 'patlasv4proto-p-aprovar-org-exemplo',
      name: 'Exemplo — aprovação',
      fieldValues: {
        'patlasv4proto-aprovar-org-novo-status': 'Aprovada pela MTI',
        'patlasv4proto-aprovar-org-observacao': 'Documentação MIPP completa e validada.',
      },
    },
  ],
  activeExamplePresetId: 'patlasv4proto-p-aprovar-org-exemplo',
}
if (!forms.some((f) => f.id === FORM_APROVAR)) {
  const idx = forms.findIndex((f) => f.id === FORM_UO)
  forms.splice(idx + 1, 0, aprovarForm)
}

// 3) Solicitar ajuste — adiciona aviso de transição + status resultante
const ajuste = forms.find((f) => f.id === FORM_AJUSTE)
if (ajuste) {
  ajuste.metadata = 'Parâmetro do método Solicitar ajuste: informe o motivo. Ao solicitar, o Status da habilitação documental volta para "Em apresentação" e o responsável é notificado para corrigir.'
  if (!ajuste.fields.some((f) => f.id === 'patlasv4proto-ajuste-org-alerta')) {
    ajuste.fields.unshift({
      id: 'patlasv4proto-ajuste-org-alerta',
      label: 'Solicitação de ajuste',
      type: 'alert',
      size: 'medium',
      readOnly: false,
      required: false,
      multiple: false,
      relevance: 'common',
      alertVariant: 'warning',
      alertTitle: 'O cadastro volta para correção',
      alertMessage: 'Ao solicitar, o Status da habilitação documental volta para "Em apresentação" e o responsável pelo cadastro é notificado com o motivo abaixo.',
    })
  }
  if (!ajuste.fields.some((f) => f.id === 'patlasv4proto-ajuste-org-novo-status')) {
    ajuste.fields.push({
      id: 'patlasv4proto-ajuste-org-novo-status',
      label: 'Novo status',
      type: 'text',
      size: 'medium',
      readOnly: true,
      required: false,
      multiple: false,
      relevance: 'highlight',
      spec: 'Resultado da ação (somente leitura).',
    })
  }
  for (const p of ajuste.exampleValuePresets ?? []) {
    p.fieldValues = p.fieldValues ?? {}
    p.fieldValues['patlasv4proto-ajuste-org-novo-status'] = 'Em apresentação'
  }
}

// 4) liga o inputFormId do método Aprovar cadastro
const mAprovar = uo.methods.find((m) => m.id === 'patlasv4proto-uo-meth-aprovar-cadastro')
if (mAprovar) mAprovar.inputFormId = FORM_APROVAR

fs.writeFileSync(FORMS_PATH, `${JSON.stringify(forms, null, 2)}\n`, 'utf8')

// 5) class-groups
const cg = JSON.parse(fs.readFileSync(CG_PATH, 'utf8'))
if (cg.assignments) cg.assignments[FORM_APROVAR] = 'grp-01-organizacao-met'
const met = cg.memberOrderByGroup?.['grp-01-organizacao-met']
if (met && !met.includes(FORM_APROVAR)) met.push(FORM_APROVAR)
fs.writeFileSync(CG_PATH, `${JSON.stringify(cg, null, 2)}\n`, 'utf8')

console.log('Ligações criadas:')
console.log('  Aprovar cadastro  → Status: Aprovada pela MTI (libera acesso comercial)')
console.log('  Solicitar ajuste  → Status: Em apresentação (volta para correção) + motivo')
