# Finalizar centralização do espec-sydle-run

Rode **com o Cursor fechado** (e sem `npm run dev` nessa pasta).

```powershell
$cursor = "C:\Users\LucasSantos\OneDrive - EloGroup\Área de Trabalho\Cursor"
$app = Join-Path $cursor "Projetos-Complexos\Atlas-Especificador-Sydle"
$espec = Join-Path $cursor "espec-sydle-run"
$backup = Join-Path $cursor "espec-sydle-run.__backup_pre_centralizacao"

if (-not (Test-Path $app)) { throw "atlas app missing: $app" }

$item = Get-Item $espec -Force -ErrorAction SilentlyContinue
if ($item -and $item.LinkType -eq "Junction") {
  Write-Host "Já é junction -> $($item.Target)"
  exit 0
}

if (Test-Path $espec) {
  if (Test-Path $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
  Rename-Item -LiteralPath $espec -NewName "espec-sydle-run.__backup_pre_centralizacao"
}

cmd /c "mklink /J `"$espec`" `"$app`""
Write-Host "OK: espec-sydle-run -> $app"
Write-Host "Backup em: $backup (pode apagar depois de validar npm run dev em atlas)"
