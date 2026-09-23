# Religa Atlas ao projeto nao-e-nao-procon (protótipos solicitante + analista)
$ErrorActionPreference = 'Stop'
$proj = Split-Path -Parent $PSScriptRoot
# proj = .../Projetos/nao-e-nao-procon → Cursor root is two levels up
$cursorRoot = Split-Path -Parent (Split-Path -Parent $proj)
$atlas = Join-Path $cursorRoot 'Projetos-Complexos\Atlas-Especificador-Sydle'
if (!(Test-Path -LiteralPath $atlas)) { throw "Atlas não encontrado: $atlas" }

$projData = Join-Path $proj 'data'
$atlasNen = Join-Path $atlas 'data\subprojects\nao-e-nao-seplag'

# 1) Junction do épico
if (Test-Path -LiteralPath $atlasNen) {
  $attr = (Get-Item -LiteralPath $atlasNen -Force).Attributes.ToString()
  if ($attr -match 'ReparsePoint') {
    cmd /c "rmdir `"$atlasNen`""
  } else {
    $bak = "$atlasNen.__bak_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Rename-Item -LiteralPath $atlasNen -NewName (Split-Path $bak -Leaf)
    Write-Host "Backup: $bak"
  }
}
New-Item -ItemType Directory -Force -Path (Split-Path $atlasNen) | Out-Null
cmd /c "mklink /J `"$atlasNen`" `"$projData`""
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar junction do épico" }
Write-Host "OK junction épico -> data/"

# 2) Hardlink portal (solicitante)
$portalSrc = Join-Path $proj 'public\portal-selo-nao-e-nao.html'
$portalDst = Join-Path $atlas 'public\portal-selo-nao-e-nao.html'
if (!(Test-Path -LiteralPath $portalSrc)) { throw "Portal ausente: $portalSrc" }
if (Test-Path -LiteralPath $portalDst) { Remove-Item -LiteralPath $portalDst -Force }
cmd /c "mklink /H `"$portalDst`" `"$portalSrc`""
if ($LASTEXITCODE -ne 0) { throw "Falha hardlink portal" }
Write-Host "OK hardlink portal solicitante"

# 3) Hardlink utils (analista)
$utils = @(
  'nenAnaliseDecisaoMethods.ts',
  'formMethodVisibility.ts',
  'formHighlightTags.ts'
)
foreach ($u in $utils) {
  $src = Join-Path $proj "src\utils\$u"
  $dst = Join-Path $atlas "src\utils\$u"
  if (!(Test-Path -LiteralPath $src)) { Write-Warning "Skip missing $u"; continue }
  if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Force }
  cmd /c "mklink /H `"$dst`" `"$src`""
  if ($LASTEXITCODE -ne 0) { throw "Falha hardlink $u" }
  Write-Host "OK hardlink $u"
}

# 4) Hardlink scripts Nen
Get-ChildItem (Join-Path $proj 'scripts') -File | ForEach-Object {
  $dst = Join-Path $atlas "scripts\$($_.Name)"
  if (Test-Path -LiteralPath $dst) { Remove-Item -LiteralPath $dst -Force -ErrorAction SilentlyContinue }
  cmd /c "mklink /H `"$dst`" `"$($_.FullName)`"" | Out-Null
}
Write-Host "OK hardlink scripts"

# Sanity
$forms = Join-Path $atlasNen 'epics\projeto-nao-e-nao-seplag-v1\forms.json'
if (!(Test-Path -LiteralPath $forms)) { throw "Épico não visível no Atlas após junction" }
Write-Host ""
Write-Host "Pronto. Solicitante: Atlas/public/portal-selo-nao-e-nao.html"
Write-Host "Analista: Atlas -> subprojeto Não é Não -> Análise e Decisão -> Atender"
