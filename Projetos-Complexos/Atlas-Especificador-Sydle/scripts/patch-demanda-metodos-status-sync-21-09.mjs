#!/usr/bin/env node
/**
 * Completa métodos MTI faltantes na Demanda Completa e espelha subset
 * nos formulários portal (demcli/dempar) para o Atlas live.
 *
 * Uso: node scripts/patch-demanda-metodos-status-sync-21-09.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS = path.join(
  __dirname,
  '../data/subprojects/atlas-prototipo/epics/prototipo/forms.json',
)

const DEMC = 'form-patlasv4-proto-demanda-completa'
const DEMCLI = 'form-patlasv4-proto-demanda-portal-cliente'
const DEMPAR = 'form-patlasv4-proto-demanda-portal-parceiro'

function upsertMethod(form, method) {
  if (!form.methods) form.methods = []
  const i = form.methods.findIndex((m) => m.id === method.id)
  if (i >= 0) form.methods[i] = { ...form.methods[i], ...method }
  else form.methods.push(method)
}

const MTI_EXTRA = [
  {
    id: 'method-demc-enviar-proposta-orcamento',
    name: 'Enviar composição para assinaturas (orçamento)',
    icon: 'send',
    kind: 'destaque',
    spec: 'Em orçamento · elabora itens e envia à cadeia Vendas (+Parceiro) → cliente.',
  },
  {
    id: 'method-demc-assinar-orcamento',
    name: 'Assinar orçamento (Vendas / MTI)',
    icon: 'draw',
    kind: 'menu',
    spec: 'Assinatura interna Vendas no BO antes da proposta ao cliente.',
  },
  {
    id: 'method-demc-aceitar-dilacao',
    name: 'Aceitar dilação de prazo',
    icon: 'check_circle',
    kind: 'menu',
    spec: 'ACK MTI na dilatação tripartite.',
  },
  {
    id: 'method-demc-recusar-dilacao',
    name: 'Recusar dilação de prazo',
    icon: 'cancel',
    kind: 'menu',
    spec: 'Recusa MTI da dilatação · motivo obrigatório.',
  },
]

const CLIENTE_METHODS = [
  {
    id: 'method-demcli-ver-andamento',
    name: 'Ver status e próximo passo',
    icon: 'timeline',
    kind: 'menu',
    spec: 'Somente leitura · sync store F3.',
  },
  {
    id: 'method-demcli-aprovar-n2',
    name: 'N2 · Aprovar',
    icon: 'thumb_up',
    kind: 'destaque',
    spec: 'Gestor ou Fiscal · join restritivo.',
  },
  {
    id: 'method-demcli-devolver-n2',
    name: 'N2 · Devolver para correção',
    icon: 'undo',
    kind: 'menu',
    spec: 'Gestor ou Fiscal.',
  },
  {
    id: 'method-demcli-recusar-n2',
    name: 'N2 · Recusar',
    icon: 'thumb_down',
    kind: 'menu',
    spec: 'Gestor ou Fiscal · restituir possível.',
  },
  {
    id: 'method-demcli-assinar-atendimento',
    name: 'Assinar / devolver atendimento',
    icon: 'draw',
    kind: 'destaque',
    spec: 'Via contrato · gestor/fiscal/solicitante.',
  },
  {
    id: 'method-demcli-aceitar-orcamento',
    name: 'Aceitar orçamento',
    icon: 'check',
    kind: 'destaque',
    spec: 'Cliente aceita → OS gerente operação.',
  },
  {
    id: 'method-demcli-recusar-orcamento',
    name: 'Recusar orçamento',
    icon: 'cancel',
    kind: 'menu',
    spec: 'Encerra caminho orçamento.',
  },
  {
    id: 'method-demcli-assinar-homologacao',
    name: 'Assinar termo de homologação',
    icon: 'verified',
    kind: 'destaque',
    spec: 'L3 · gestor/fiscal/solicitante.',
  },
  {
    id: 'method-demcli-definir-pagamento',
    name: 'Definir pagamento (sem cobertura)',
    icon: 'payments',
    kind: 'menu',
    spec: 'Indenização | nova contratação | desistir.',
  },
  {
    id: 'method-demcli-ajustar-enviar',
    name: 'Corrigir e reenviar',
    icon: 'send',
    kind: 'destaque',
    spec: 'Pós-devolução.',
  },
  {
    id: 'method-demcli-restituir-n2',
    name: 'Restituir processo N2',
    icon: 'undo',
    kind: 'menu',
    spec: 'Quem recusou pode restituir.',
  },
  {
    id: 'method-demcli-reaproveitar',
    name: 'REAP · Nova demanda com estes dados',
    icon: 'content_copy',
    kind: 'menu',
    spec: 'Copia dados · novo número/SLA.',
  },
  {
    id: 'method-demcli-devolver-orcamento',
    name: 'Devolver orçamento para correção',
    icon: 'undo',
    kind: 'menu',
    spec: 'Cliente devolve composição.',
  },
  {
    id: 'method-demcli-ajuste-termo',
    name: 'Solicitar ajuste no termo',
    icon: 'edit',
    kind: 'menu',
    spec: 'L03 · regerar + reassinar.',
  },
  {
    id: 'method-demcli-recusar-termo',
    name: 'Recusar termo → concluída',
    icon: 'cancel',
    kind: 'menu',
    spec: 'L02 · termo recusado.',
  },
  {
    id: 'method-demcli-dilacao',
    name: 'Solicitar dilação de prazo',
    icon: 'schedule',
    kind: 'menu',
    spec: 'Tripartite · ACK das partes.',
  },
  {
    id: 'method-demcli-aceitar-dilacao',
    name: 'Aceitar dilação',
    icon: 'check_circle',
    kind: 'menu',
    spec: 'ACK cliente.',
  },
  {
    id: 'method-demcli-recusar-dilacao',
    name: 'Recusar dilação',
    icon: 'cancel',
    kind: 'menu',
    spec: 'Motivo obrigatório.',
  },
  {
    id: 'method-demcli-cadastrar-cargos',
    name: 'EXC-CARG · Registrar gestor/fiscal',
    icon: 'person_add',
    kind: 'menu',
    spec: 'Vínculo sem N2 cadastrado.',
  },
]

const PARCEIRO_METHODS = [
  {
    id: 'method-dempar-ver-andamento',
    name: 'Ver status e próximo passo',
    icon: 'timeline',
    kind: 'menu',
    spec: 'Somente leitura · sync store F3.',
  },
  {
    id: 'method-dempar-via-contrato',
    name: 'Propor: atendimento via contrato',
    icon: 'assignment',
    kind: 'destaque',
    spec: 'Propositivo · MTI delibera.',
  },
  {
    id: 'method-dempar-orcamento',
    name: 'Propor: enviar para orçamento',
    icon: 'request_quote',
    kind: 'menu',
    spec: 'Propositivo · MTI delibera.',
  },
  {
    id: 'method-dempar-devolver',
    name: 'Propor: devolver para correção',
    icon: 'undo',
    kind: 'menu',
    spec: 'Propositivo.',
  },
  {
    id: 'method-dempar-recusar',
    name: 'Propor: recusar',
    icon: 'cancel',
    kind: 'menu',
    spec: 'Propositivo · não definitivo.',
  },
  {
    id: 'method-dempar-parceiro-iniciar',
    name: 'Iniciar / efetivar atendimento',
    icon: 'play_circle',
    kind: 'destaque',
    spec: 'Após SN autorizado · Consumo.',
  },
  {
    id: 'method-dempar-parceiro-declarar',
    name: 'Declarar atendida',
    icon: 'task_alt',
    kind: 'destaque',
    spec: 'Envia à validação MTI.',
  },
  {
    id: 'method-dempar-enviar-proposta-orcamento',
    name: 'Enviar composição orçamento',
    icon: 'send',
    kind: 'menu',
    spec: 'Em orçamento.',
  },
  {
    id: 'method-dempar-assinar-orcamento',
    name: 'Assinar orçamento (Parceiro)',
    icon: 'draw',
    kind: 'menu',
    spec: 'Cadeia interna.',
  },
  {
    id: 'method-dempar-devolver-orcamento',
    name: 'Solicitar ajuste na composição',
    icon: 'undo',
    kind: 'menu',
    spec: 'Devolve orçamento em elaboração.',
  },
  {
    id: 'method-dempar-dilacao',
    name: 'Solicitar dilação de prazo',
    icon: 'schedule',
    kind: 'menu',
    spec: 'Durante execução autorizada.',
  },
  {
    id: 'method-dempar-aceitar-dilacao',
    name: 'Aceitar dilação',
    icon: 'check_circle',
    kind: 'menu',
    spec: 'ACK parceiro.',
  },
  {
    id: 'method-dempar-recusar-dilacao',
    name: 'Recusar dilação',
    icon: 'cancel',
    kind: 'menu',
    spec: 'Motivo obrigatório.',
  },
]

function main() {
  const forms = JSON.parse(fs.readFileSync(FORMS, 'utf8'))
  const demc = forms.find((x) => x.id === DEMC)
  const demcli = forms.find((x) => x.id === DEMCLI)
  const dempar = forms.find((x) => x.id === DEMPAR)
  if (!demc || !demcli || !dempar) throw new Error('Forms Demanda não encontrados')

  for (const m of MTI_EXTRA) upsertMethod(demc, m)

  // Portal classes: métodos filtrados por status no Atlas live (HTML portals usam DemandasPage)
  demcli.methods = []
  for (const m of CLIENTE_METHODS) upsertMethod(demcli, m)
  demcli.metadata =
    (demcli.metadata || '') +
    ' · Métodos sync store F3 (21/09) · filtrados por status × perfil Cliente.'

  dempar.methods = []
  for (const m of PARCEIRO_METHODS) upsertMethod(dempar, m)
  dempar.metadata =
    (dempar.metadata || '') +
    ' · Métodos sync store F3 (21/09) · filtrados por status × perfil Parceiro.'

  demc.metadata =
    (demc.metadata || '') +
    ' · Métodos orçamento/dilação completos (21/09) · filtro status × MTI.'

  fs.writeFileSync(FORMS, JSON.stringify(forms, null, 2) + '\n')
  console.log('OK · métodos MTI extra + demcli + dempar sincronizados')
}

main()
