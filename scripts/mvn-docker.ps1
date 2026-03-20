# 可选：仅跑 Maven 命令（测试等），不启整套服务。
# 打后端镜像 / 本地一键栈请用：docker compose build backend  或  docker compose up --build
# 用法: .\scripts\mvn-docker.ps1 clean test -B

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ($args.Count -eq 0) {
    Write-Host "用法: .\scripts\mvn-docker.ps1 <maven 参数...>" -ForegroundColor Yellow
    Write-Host "打包镜像请用: docker compose build backend" -ForegroundColor Cyan
    exit 1
}

docker run --rm -v "${repo}:/app" -w /app maven:3.9-eclipse-temurin-17 mvn @args
