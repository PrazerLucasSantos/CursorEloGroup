# Selo Não é Não — PROCON

**Única pasta do projeto.** Código, épico, protótipos, fontes e docs.

```
Cursor\Projetos\nao-e-nao-procon\
├── public/          → protótipo SOLICITANTE (portal HTML)
├── data/epics/      → épico Atlas (forms/flows) — SOLICITANTE + ANALISTA
├── src/utils/       → runtime do método Atender (ANALISTA)
├── scripts/         → build, patch, sync/links Atlas
└── conhecimento/    → fontes, atas, docs, requisitos, BPMN, modelagem
```

## Abrir os protótipos (sem quebrar)

| Protótipo | Como abrir |
|-----------|------------|
| **Solicitante** | Abra `public\portal-selo-nao-e-nao.html` (ou pelo Atlas em `/portal-selo-nao-e-nao.html` — mesmo arquivo via hardlink) |
| **Analista** | No **Atlas**, subprojeto Não é Não → classe **Análise e Decisão** → método **Atender** (épico via junction em `data/`) |

O Atlas **não guarda cópia separada** do Nen: lê esta pasta (junction + hardlinks).  
Se clonar o Atlas em outra máquina, rode:

```powershell
.\scripts\setup-atlas-links.ps1
```

## Git (subir só isto)

```powershell
cd ...\nao-e-nao-procon
git add -A
git commit -m "..."
git push
```

https://github.com/PrazerLucasSantos/nao-e-nao-seplag

## Índice

- [00-INDICE.md](./00-INDICE.md)
- [conhecimento/CONHECIMENTO.md](./conhecimento/CONHECIMENTO.md)
