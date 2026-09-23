# PACOTE ÚNICO — Atlas

## Use sempre

`C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor\atlas`

Inclui: ambiente (classes, workflows, apresentações, portais), dados dos épicos Atlas, fontes de discovery Demanda F3, conhecimento Fase 1/2/3 Demanda.

## Subir / versionar

- App Atlas: git **dentro** de `atlas\` (remote do Especificador).  
- Não é Não e Participação Social: pastas próprias (`nao-e-nao-procon`, `participacao-social`).

## Após fechar o Cursor (obrigatório uma vez)

A pasta `espec-sydle-run` estava aberta/travada e ainda não virou junction. Com o Cursor fechado:

```powershell
cd "...\Cursor\atlas"
powershell -ExecutionPolicy Bypass -File .\scripts\finalizar-centralizacao-espec.ps1
```

Isso remove/renomeia o clone antigo e cria junction `espec-sydle-run` → `atlas`, sem duplicar arquivos.
