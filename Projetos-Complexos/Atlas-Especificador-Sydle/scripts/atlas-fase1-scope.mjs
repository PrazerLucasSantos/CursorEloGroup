/**
 * Escopo Fase 1 — Atlas épico (proposta → contrato cadastrado).
 * Classes/grupos fora deste conjunto recebem prefixo "# " no build.
 */

/** Formulários usados no fluxo Fase 1, catálogo de referência, portal e cadastros mínimos. */
export const FASE1_FORM_IDS = new Set([
  // Organização e assinantes
  'form-atlas-organizacao',
  'form-atlas-pessoa',
  'form-atlas-usuario',
  'form-atlas-pessoa-documento',
  'form-atlas-pessoa-email',
  'form-atlas-pessoa-telefone',
  'form-atlas-pessoa-endereco',
  // Proposta e itens
  'form-atlas-proposta',
  'form-atlas-proposta-item',
  'form-atlas-proposta-versao',
  'form-atlas-proposta-documento',
  'form-atlas-proposta-workflow-etapa',
  // Workflow e documentos Fase 1
  'form-atlas-workflow-modelo',
  'form-atlas-workflow-versao',
  'form-atlas-workflow-etapa',
  'form-atlas-workflow-instancia',
  'form-atlas-workflow-evento',
  'form-atlas-documento-template',
  'form-atlas-documento-parametro',
  'form-atlas-documento-gerado',
  'form-atlas-fase1-governanca',
  'form-atlas-visao-fase1-operacional',
  // Contratação Fase 1
  'form-atlas-tramite-assinatura',
  'form-atlas-processo-contratual',
  'form-atlas-contrato-gestao',
  'form-atlas-contrato-item-catalogo',
  'form-atlas-checklist-contratual',
  'form-atlas-integracao-evento',
  'form-atlas-notificacao-processo',
  // Catálogo (seleção de itens — somente referência)
  'form-atlas-cadastro-maestros',
  'form-atlas-maestro-solucao',
  'form-atlas-maestro-metrica',
  'form-atlas-maestro-cobranca',
  'form-atlas-maestro-focal-vendas',
  'form-atlas-maestro-fc',
  'form-atlas-maestro-unidade-dtic',
  'form-atlas-maestro-parceiro',
  'form-atlas-maestro-grupo',
  'form-atlas-maestro-modelo-venda',
  'form-atlas-maestro-vigencia',
  'form-atlas-maestro-complexidade',
  'form-atlas-maestro-recorrencia',
  'form-atlas-catalogo-config',
  'form-atlas-produto-cadastro',
  'form-atlas-cadastro-produtos',
  'form-atlas-catalogo-vigentes',
  'form-atlas-licenca-linha',
  'form-atlas-catalogo-licencas',
  'form-atlas-servico-linha',
  'form-atlas-catalogo-servicos',
  // Portal de cotação
  'form-atlas-portal-login',
  'form-atlas-portal-cotacao',
  'form-atlas-portal-cotacao-item',
])

/** Grupos de classes alinhados à Fase 1. */
export const FASE1_GROUP_IDS = new Set([
  'grp-atlas-fase1-workflow',
  'grp-atlas-fase1-operacao',
  'grp-atlas-fase1-suporte',
  'grp-atlas-organizacoes',
  'grp-atlas-proposta',
  'grp-atlas-proposta-suporte',
  'grp-atlas-contrato-gestao',
  'grp-atlas-suporte-contrato',
  'grp-atlas-maestros',
  'grp-atlas-catalogo',
  'grp-atlas-cadastro',
  'grp-atlas-licencas',
  'grp-atlas-servicos',
  'grp-atlas-portal-cotacao',
])

const HASH_PREFIX = '# '

export function stripFase1HashPrefix(name) {
  return typeof name === 'string' ? name.replace(/^#\s+/, '') : name
}

/** Nome exibido: com "# " se fora da Fase 1; sem prefixo se dentro. */
export function displayNameForFase1(name, inFase1) {
  const base = stripFase1HashPrefix(name)
  if (inFase1) return base
  return base.startsWith('#') ? base : `${HASH_PREFIX}${base}`
}

export function applyFase1DisplayPrefixes(forms, classGroups, workspaces) {
  for (const form of forms) {
    if (form?.id && form.name) {
      form.name = displayNameForFase1(form.name, FASE1_FORM_IDS.has(form.id))
    }
  }

  const seenGroupIds = new Set()
  classGroups.groups = classGroups.groups.filter((g) => {
    if (!g?.id || seenGroupIds.has(g.id)) return false
    seenGroupIds.add(g.id)
    return true
  })
  for (const group of classGroups.groups) {
    if (group?.name) {
      group.name = displayNameForFase1(group.name, FASE1_GROUP_IDS.has(group.id))
    }
  }

  for (const ws of workspaces) {
    for (const pkg of ws.packages ?? []) {
      for (const cls of pkg.classes ?? []) {
        if (cls?.name && cls.linkedFormId) {
          cls.name = displayNameForFase1(cls.name, FASE1_FORM_IDS.has(cls.linkedFormId))
        }
      }
    }
  }

  return { forms, classGroups, workspaces }
}
