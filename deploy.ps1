$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Mode = if ($args.Count -gt 0) { $args[0] } else { "full" }

Set-Location $ProjectDir

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env"
}

if ($Mode -eq "core") {
  docker compose build mysql redis backend frontend
}
else {
  docker compose --profile integration build
}

Write-Host "build complete: $Mode"
Write-Host "run: .\start-all.ps1 $Mode"
