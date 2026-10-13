param(
  [Parameter(Mandatory = $true)]
  [string]$RepoRoot,
  [switch]$Aggressive
)

$ErrorActionPreference = 'SilentlyContinue'
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$port = if ($env:ASTRO_DEV_PORT) { [int]$env:ASTRO_DEV_PORT } else { 4321 }

$patterns = @(
  'astro(\.cmd)?\s+dev',
  'astro-dev\.mjs',
  '\bvite\b',
  'npm(\.cmd)?.*run\s+(dev|predev)',
  'run-rm-assets\.mjs',
  'compiler-binding',
  'satteri'
)

$stopped = @{}
$exclude = @($PID)
if ($env:DEV_BAT_EXCLUDE_PIDS) {
  $exclude += @(
    $env:DEV_BAT_EXCLUDE_PIDS.Split(',') |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -match '^\d+$' } |
      ForEach-Object { [int]$_ }
  )
}

function Stop-IfNew([int]$processId) {
  if ($exclude -contains $processId) { return }
  if ($stopped.ContainsKey($processId)) { return }
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  $stopped[$processId] = $true
  Write-Output "STOPPED:$processId"
}

$processNames = @('node.exe', 'esbuild.exe')

foreach ($name in $processNames) {
  Get-CimInstance Win32_Process -Filter "Name = '$name'" | ForEach-Object {
    $cmd = $_.CommandLine
    $exe = $_.ExecutablePath
    $inRepo =
      ($cmd -and $cmd -like "*$RepoRoot*") -or
      ($exe -and $exe -like "$RepoRoot*")

    if (-not $inRepo) { return }

    if ($Aggressive) {
      Stop-IfNew $_.ProcessId
      return
    }

    if (-not $cmd) { return }

    foreach ($pattern in $patterns) {
      if ($cmd -match $pattern) {
        Stop-IfNew $_.ProcessId
        return
      }
    }
  }
}

Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
  $processId = $_.OwningProcess
  $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if (-not $proc) { return }
  if ($proc.Name -ne 'node' -and $proc.Name -ne 'esbuild') { return }
  Stop-IfNew $processId
}
