# Decisões fechadas — Consulta Pública / Participação Social MT

Atualizado: 2026-09-21  
Fontes: reunião 01/09 · Granola 14/09 · Granola 15/09 (alinhamento interno)

---

## Nome e posicionamento

| # | Decisão | Fonte |
|---|---------|--------|
| D01 | Descartar o nome **“missões”** (conotação política/militar) | 01/09 · 14/09 |
| D02 | Usar **Consulta Pública** ou **Consulta Popular** | 01/09 · 14/09 |
| D03 | Portal **próprio em UI**, desacoplado do Simplifica e do MT Cidadão | 15/09 |
| D04 | Multi-órgão (Executivo; Assembleia possível no horizonte) | 01/09 |

---

## MVP — fluxos

| # | Decisão | Fonte |
|---|---------|--------|
| D10 | **Fluxo órgão:** servidor cria consulta → secretário aprova/rejeita → publicação | 01/09 · 14/09 · 15/09 |
| D11 | **Fluxo cidadão:** catalogar → filtrar → participar → comprovante | 14/09 · 15/09 |
| D12 | Formulário dinâmico (tipos de campo configuráveis pelo órgão) | 15/09 |
| D13 | Prazo configurável; **encerramento automático** | 14/09 · 15/09 |
| D14 | Análise interna das participações (aprovada / rejeitada / sem sentido) **sem retorno individual** ao cidadão nesta fase | 15/09 |
| D15 | “Minha Participação” = histórico do cidadão | 15/09 |

---

## Autenticação e participação

| # | Decisão | Fonte |
|---|---------|--------|
| D20 | Login obrigatório via **MT Login** | 14/09 · 15/09 |
| D21 | Anonimizar nome/CPF na exibição = **opção configurável** por consulta | 14/09 |
| D22 | **Múltiplas respostas** por pessoa permitidas (vínculo ao login mitiga inflação) | 14/09 |
| D23 | PF e PJ podem participar | 14/09 |

---

## Cadastros e permissões

| # | Decisão | Fonte |
|---|---------|--------|
| D30 | Temas, subtemas, macro-regiões, municípios, órgãos = **cadastros editáveis** | 14/09 · 15/09 |
| D31 | Órgãos do portal **separados** do cadastro da “carta” | 15/09 |
| D32 | Nível **CEPLAG:** carga inicial de órgãos + CPF do secretário | 15/09 |
| D33 | Nível **Secretário:** cadastra servidores; vê tudo do órgão | 15/09 |
| D34 | Nível **Servidor:** cadastra consultas | 15/09 |

---

## Relatórios e integrações (MVP)

| # | Decisão | Fonte |
|---|---------|--------|
| D40 | Analytics 2.0 + exportação **CSV/PDF** | 15/09 |
| D41 | **Sem** integrações externas no MVP (classes internas do portal) | 15/09 |
| D42 | API externa de consulta/participação = **a confirmar** (não bloqueia MVP) | 15/09 |

---

## Explicitamente fora do MVP

| # | Item | Fonte |
|---|------|--------|
| F01 | Devolutiva formal ao cidadão | 14/09 · 15/09 |
| F02 | Aba / módulo de Resultados (mesmo pacote da devolutiva) | 15/09 |
| F03 | Upload de arquivo, foto, áudio, vídeo | 14/09 |
| F04 | Transcrição automática | 14/09 |
| F05 | Gamificação / incentivos | 01/09 |

---

## Estimativa e equipe (alinhamento 15/09)

| # | Ponto | Valor |
|---|-------|--------|
| E01 | Estimativa interna | ~8 semanas |
| E02 | UI / portal completo | ~2 semanas (complexo) |
| E03 | Lógica (classes/fluxos) | ~1 semana |
| E04 | Buffer testes | ~1 semana |
| E05 | Dev principal UI | Luiz (após Sejus) |
| E06 | Apoio (~30%) | Lucas (back-office, fluxos, cadastros) |
| E07 | Início | Condicionado a orçamento + OS (Fabiano) |
