# Conhecimento completo — Portal de Consulta Pública (Participação Social MT)

Atualizado: 2026-09-21  
Hierarquia de autoridade: decisões Granola 14–15/09 > falas 01/09 > protótipo AI Studio/Git

---

## 1. O que é

Portal estadual para o cidadão opinar em políticas públicas (PPA, orçamento, leis, serviços) e para órgãos publicarem consultas com formulário configurável, após autorização do secretário.

Origem: necessidade de planejamento/PPA (CEPLAG). Ampliação: secretário Sandro — uso transversal por órgãos.

**Não é** o selo PROCON “Não é Não”. Ver `06-separacao-projetos/`.

---

## 2. Atores

| Perfil | Papel |
|--------|--------|
| **Cidadão** (PF/PJ) | Explora consultas, participa, vê comprovante e histórico |
| **Servidor do órgão** | Cria/configura consulta |
| **Secretário** | Aprova/rejeita publicação; cadastra servidores |
| **CEPLAG** | Carga inicial de órgãos; indica CPF do secretário; visão ampla |
| **CGE** (Vilson, Alcimar/Osmar, Denilson, Néri) | Autenticidade, territorialização, glossário; conselho de usuários (complementar) |
| **SEFAZ/OFPLAN** | Pressão de integração futura (LDO/consulta popular) — fora do MVP interno |

Reunião 01/09: Carol (articulação), Marcello (demo), Fabiano (técnico/orçamento).

---

## 3. Fluxos do MVP

### 3.1 Órgão / servidor

```
Servidor cria consulta (form dinâmico)
    → Secretário analisa
        → Aprova → card público (prazo ativo)
        → Rejeita → retorno ao servidor (sem publicar)
    → Encerramento automático ao fim do prazo
    → Análise interna das participações (sem devolutiva ao cidadão nesta fase)
```

### 3.2 Cidadão

```
Acessa portal (MT Login)
    → Lista/cards (filtros: tema, subtema, macro-região, município, órgão, palavra-chave)
    → Participar → preenche formulário
    → Comprovante
    → “Minha Participação” (histórico)
```

---

## 4. Escopo MVP × fora

| Dentro | Fora |
|--------|------|
| Portal UI próprio | Embed Simplifica / MT Cidadão |
| Criação + aprovação + publicação | Devolutiva formal |
| Participação + comprovante | Aba Resultados |
| Cadastros editáveis + 3 níveis de acesso | Upload mídia / transcrição |
| Analytics 2.0 + CSV/PDF | Gamificação |
| MT Login | Integrações externas obrigatórias |

---

## 5. Arquitetura (visão 15/09)

- Classes internas: consultas (“missões” no jargão interno legado), usuários (via MT Login), macro-regiões, temas/subtemas, órgãos do portal  
- Sem integração externa no MVP  
- API externa de leitura = oportunidade futura  
- Permissionamento e relatórios = partes mais complexas  
- ~30–40 formulários estimados (cadastros × 3 + fluxos + permissões + relatório)

---

## 6. Processo atual (antes do portal) — Welliton 14/09

| Ciclo | Quem | Como |
|-------|------|------|
| PPA | SEPLAG | Google Forms, prazo definido |
| Orçamento anual | CFAES (+ SEPLAG parceira) | Período aberto → coleta → tratamento |

Divulgação: imprensa, WhatsApp, site, ofícios a conselhos.  
Formulário típico: perfil (sexo, idade, município, escolaridade, ocupação) + áreas/subáreas + campo aberto.

Visão futura (não MVP): escuta permanente segmentada por instrumento de planejamento.

---

## 7. Protótipo

Ver `04-prototipo/prototipo-e-git.md`.

- AI Studio / React Vite  
- Dados mockados  
- Git privado `PrazerLucasSantos/Participa-o-Social`  
- Telas: home, explorar, detalhe, questionário, resultados (protótipo), perfil, painel gestor, IA coletiva, mapa, mock MT Login  

O protótipo **antecipa** devolutiva/resultados/IA que **não** estão no MVP fechado em 14–15/09.

---

## 8. Linha do tempo

| Data | Evento |
|------|--------|
| 01/09/2026 | Apresentação protótipo + CGE (gravação ~42 min) |
| 02/09 | Análise Cursor; acesso ao Git |
| 14/09 | Levantamento CEPLAG + Welliton (Granola) |
| 15/09 | Alinhamento interno EloGroup — escopo MVP, estimativa 8 semanas |
| — | OS/orçamento (Fabiano); início condicionado |

---

## 9. Pressões e riscos

- SEFAZ/OFPLAN: urgência citada em 01/09 (~1,5–2 meses) vs. produto ainda embrionário  
- Orçamento/OS ainda não abertos como pré-condição de início  
- JUCEMAT / sociedades civis para CNPJ — pendência (Marcello)  
- Nome e glossário ainda podem oscilar entre “pública” e “popular”
