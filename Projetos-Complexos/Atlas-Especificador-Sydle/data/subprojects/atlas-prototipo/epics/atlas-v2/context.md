# Atlas V2

Cópia do épico **Atlas Protótipo** (`prototipo`) em 2026-08-31.
Baseline F2 validado 31/08/2026 — evolução independente a partir daqui.

## Classes F2 — finalizadas

Parceria · Solução · Catálogo · Produto · Dados de Parceria por Produto  
+ mestres: Grupo · Métrica · Tipo de Cobrança · Modelo de Venda · Vertical · Complexidade do catálogo

**Fontes soberanas:** de-para 31/08 · requisitos F2 25–26/08 · decisões do chat (fiscal fora; Universal/Individualizado; % visível ao parceiro nos próprios produtos).

Reaplicar consolidação:

```bash
python scripts/_finalize_atlas_v2_f2_completo.py
```

## Escopo F2 (lembrança)

- Dados comerciais nascem no Atlas; ERP = somente códigos (RN-IMP-01)
- Fiscal/contábil/retenções = fora do Atlas F2
- Eixo Catálogo: Universal × Individualizado; Licença/Serviço = por item (Produto)
- DPP: custo (parceiro) + markup (MTI) → % e valor unitário
- Vertical na Parceria (RO no Catálogo/Produto)

## Regenerar (legado)

```bash
npm run atlas-v4:build-prototipo
```

**Fonte classes base:** `source/Atlas_Classes_CORRIGIDO_v2.md`
