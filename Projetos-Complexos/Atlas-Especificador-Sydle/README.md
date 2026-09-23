# atlas — pacote único do Projeto Atlas

**Entrada canônica (use sempre esta pasta):**

```
C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\atlas
```

É um **junction** para o app real em `Projetos-Complexos\Atlas-Especificador-Sydle` (mesmos arquivos — zero duplicação). Assim caminhos antigos e o Cursor na raiz continuam válidos.

---

## O que está aqui

| Pasta / item | Conteúdo |
|--------------|----------|
| `src/`, `data/`, `public/`, `scripts/` | App Especificador (classes, workflows/flows, apresentações, portais) |
| `data/subprojects/atlas-*` | Épicos Atlas (protótipo, v4, fases) |
| `data/subprojects/nao-e-nao-seplag` | **Junction** → `nao-e-nao-procon\data` (projeto Nen separado) |
| `fontes-discovery/` | Discoveries Fase 3 Demanda (9/14/15 set — DOCX + áudio) |
| `docs/conhecimento-atlas-demanda/` | Conhecimento Demanda F3 (P01–P08, decisões, FigJam…) |
| `docs/conhecimento-atlas/` | Conhecimento Atlas geral |
| `fontes/` | Fontes grandes do especificador |
| `presentation.html`, `documentador.html`, … | Entradas HTML |

---

## Como rodar

```powershell
cd "...\Cursor\atlas"
npm install   # se necessário
npm run dev
```

Outros scripts: ver `package.json` (`dev:portal-cliente`, apresentações, etc.).

---

## Projetos de negócio (fora deste pacote)

| Projeto | Pasta |
|---------|--------|
| Não é Não PROCON | `Cursor\nao-e-nao-procon\` |
| Participação Social | `Cursor\participacao-social\` |

Não misturar — o Atlas **consome** o épico Nen via junction.

---

## Paths legados (ainda funcionam)

| Path antigo | Status |
|-------------|--------|
| `Projetos-Complexos\Atlas-Especificador-Sydle` | Mesmo conteúdo (pasta física) |
| `Cursor\atlas` | Junction → pasta física |
| `espec-sydle-run` | **Deprecado** — fechar Cursor/terminais e rodar `scripts\finalizar-centralizacao-espec.ps1` |

Ver `PACOTE.md`.
