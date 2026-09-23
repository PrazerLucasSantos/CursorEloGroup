# Camada 1 — Fundação Visual

**Fonte:** Template Preenchido - Design System - Fundação e Materiais de Negócio.docx
**Data de preenchimento:** 2026-03-25
**Status:** Preenchido (campos completos)
**Última atualização:** 2026-03-25

---

## 1.1 Paleta de Cores

### Cores Primárias

| Token | Hex | Descrição |
|-------|-----|-----------|
| `primary-1` | #272727 | Cinza escuro |
| `primary-2` | #A5A7B0 | Cinza claro |
| `primary-3` | #0C1BA8 | Azul escuro |
| `primary-4` | #F9F9F9 | Branco |

### Cores Secundárias / Apoio

| Token | Hex | Descrição |
|-------|-----|-----------|
| `secondary-1` | #0C1BA8 | Azul |
| `secondary-2` | #536FA7 | Azul cinza |
| `secondary-3` | #C9DCF2 | Azul claro |

### Cores Neutras

| Token | Hex | Uso |
|-------|-----|-----|
| `bg-primary` | #F9F9F9 | Fundo principal |
| `bg-secondary` | #0C1BA8 | Fundo secundário |
| `text-primary` | #272727 | Texto principal |
| `text-secondary` | #0C1BA8 | Texto secundário |
| `border` | #A5A7B0 | Bordas / divisores |

### Cores Semânticas

| Token | Hex | Uso |
|-------|-----|-----|
| `success` | #C8F4C3 | Sucesso / positivo |
| `warning` | #FFDEBD | Alerta / atenção |
| `error` | #FFC3BB | Erro / negativo |
| `info` | #C9DCF2 | Informativo |

> **Nota:** Paleta de dados para gráficos ainda não definida (a definir).

---

## 1.2 Tipografia

### Famílias

| Uso | Fonte |
|-----|-------|
| Títulos | PP Telegraph |
| Corpo | Outfit |
| Monoespaçada | Roboto Mono |

### Escala Tipográfica

| Nível | Tamanho | Peso | Cor |
|-------|---------|------|-----|
| Título principal (H1) | 20pt | Medium | #272727 |
| Subtítulo (H2) | 16pt | Medium | #0C1BA8 |
| Corpo de texto | 14pt | Regular | #272727 |
| Legenda / nota de rodapé | 8pt | Regular | #A5A7B0 |
| Destaque / callout | 14pt | Semibold | #0C1BA8 |

---

## 1.3 Iconografia e Imagens

| Aspecto | Definição |
|---------|-----------|
| Estilo de ícones | Linha 3pt, sem preenchimento, estilo Material Design |
| Estilo fotográfico | Corporativa, priorizando tons frios azulados e acinzentados |

---

## 1.4 Princípios Gerais de Estilo

| Aspecto | Definição |
|---------|-----------|
| Tom visual geral | Profissional, moderno, minimalista |
| Densidade de conteúdo | Preferência por slides/páginas mais arejados |
| Uso de bordas/sombras | Cards sem sombra, bordas sutis, atenção ao padding |
| Cantos | Levemente arredondados: 6px |
| Headers / barras superiores | Preferir tons sóbrios — usar `primary-1` (#272727) como fundo principal de headers, com `primary-3` (#0C1BA8) apenas como acento sutil. Evitar grandes áreas de azul aberto. |

---

## 1.5 Logo e Marca EloGroup

### Arquivos disponíveis

Pasta: `logos/`

| Arquivo | Descrição | Fundo |
|---------|-----------|-------|
| `01 Logotipo.svg` | Logotipo completo (símbolo + texto) | Retângulo #272727 |
| `02 Logotipo sem fundo_preto.svg` | Logotipo completo | Transparente (elementos em #272727) |
| `03 Logotipo sem fundo_branco.svg` | Logotipo completo | Transparente (elementos em #F9F9FA) |
| `04 Simbolo.svg` | Apenas o símbolo | Retângulo #272727 |
| `05 Simbolo sem fundo_preto.svg` | Apenas o símbolo | Transparente (elementos em #272727) |
| `06 Simbolo sem fundo_branco.svg` | Apenas o símbolo | Transparente (elementos em #F9F9FA) |

### Regras de uso

| Contexto | Logo permitido | Observação |
|----------|---------------|------------|
| Materiais de negócio (slides, docs, entregas) | Sim | Usar logotipo completo ou símbolo conforme espaço |
| Aplicações / UX-UI de produtos digitais | **Não** | Não inserir logo EloGroup em interfaces de produto |

### Orientações

- Em fundos escuros (#272727): usar versão branca (03 ou 06)
- Em fundos claros (#F9F9F9): usar versão preta (02 ou 05)
- Manter área de respiro ao redor do logo (mínimo ~50% da largura do símbolo)

---

## 1.6 Tipografia — Notas de implementação

- **PP Telegraf** é uma fonte comercial (Pangram Pangram), não disponível via Google Fonts
- Para uso em HTML/web, os arquivos .otf precisam ser embarcados via `@font-face` (base64 inline ou arquivo servido)
- **Status:** arquivos disponíveis na base (pasta `fontes/`)

### Pesos disponíveis

| Arquivo | Peso |
|---------|------|
| `PPTelegraf-UltraLight.otf` | 200 (UltraLight) |
| `PPTelegraf-Light.otf` | 300 (Light) |
| `PPTelegraf-Regular.otf` | 400 (Regular) |
| `PPTelegraf-Medium.otf` | 500 (Medium) |
| `PPTelegraf-SemiBold.otf` | 600 (SemiBold) |
| `PPTelegraf-Bold.otf` | 700 (Bold) |
| `PPTelegraf-UltraBold.otf` | 800 (UltraBold) |
| `PPTelegraf-Black.otf` | 900 (Black) |

### Uso no Design System

- **Títulos (H1, H2):** PP Telegraf Medium (500)
- **Corpo de texto:** Outfit (Google Fonts)
- **Monoespaçada (valores, código):** Roboto Mono (Google Fonts)
- **Fallback:** quando PP Telegraf não puder ser embarcada, usar Outfit Medium para títulos
