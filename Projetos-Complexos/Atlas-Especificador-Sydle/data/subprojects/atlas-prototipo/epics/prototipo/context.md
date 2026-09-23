# Atlas Protótipo Atual

Épico corrigido (v2) — cadastro base, versões de processo e workflow de assinatura.

**Fonte:** `source/Atlas_Classes_CORRIGIDO_v2.md`

## Regenerar

```bash
npm run atlas-v4:build-prototipo
```

## Escopo

- Correção RN-UO-02: Organização como qualificação da UO
- Prefixo: `patlasv4proto-` / `form-patlasv4-proto-*`
- Backup do protótipo anterior: épico `atlas-v4-prototipo-backup`

## Demanda (parceiro)

```bash
node scripts/patch-atlas-prototipo-demanda-parceiro.mjs
```

Classe `(10.0) Demanda` + apresentação `Demanda — Fluxo do Parceiro (back-office)`.


## Patch campos fontes (2026-08-31)

Parceria, Solução, Catálogo e Produto sincronizados com `docs/campos-atlas-dados.js`.
