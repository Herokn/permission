$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

docker compose --profile integration down --remove-orphans
docker compose down --remove-orphans
