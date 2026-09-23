# Setup / repair links Atlas ↔ este projeto

Garante que os protótipos do solicitante e do analista no Atlas leem esta pasta (sem cópia duplicada).

```powershell
cd "...\Cursor\nao-e-nao-procon"
.\scripts\setup-atlas-links.ps1
```

O script:
1. Cria junction `Atlas\data\subprojects\nao-e-nao-seplag` → `nao-e-nao-procon\data`
2. Hardlink do portal HTML
3. Hardlink dos utils do analista (`nenAnaliseDecisaoMethods` etc.)
