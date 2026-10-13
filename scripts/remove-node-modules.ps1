param(
  [Parameter(Mandatory = $true)]
  [string]$RepoRoot
)

$ErrorActionPreference = 'Stop'
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$nodeModules = Join-Path $RepoRoot 'node_modules'

Get-ChildItem -LiteralPath $RepoRoot -Directory -Filter 'node_modules.old.*' -ErrorAction SilentlyContinue |
  ForEach-Object {
    try {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
  }

if (-not (Test-Path -LiteralPath $nodeModules)) {
  exit 0
}

for ($attempt = 1; $attempt -le 6; $attempt++) {
  try {
    Remove-Item -LiteralPath $nodeModules -Recurse -Force -ErrorAction Stop
    exit 0
  } catch {
    if ($attempt -lt 6) {
      Start-Sleep -Milliseconds 700
    }
  }
}

$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$backup = Join-Path $RepoRoot "node_modules.old.$stamp"

try {
  Move-Item -LiteralPath $nodeModules -Destination $backup -Force -ErrorAction Stop
  Write-Output "RENAMED:$backup"
  exit 0
} catch {
  Write-Error "Could not delete or rename node_modules. Close Cursor terminals, stop Node, then run dev.bat again."
  exit 1
}
