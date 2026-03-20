$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Mode = if ($args.Count -gt 0) { $args[0] } else { "full" }
$ResetDb = $args -contains "--reset-db"

Set-Location $ProjectDir

# Check .env file
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env file..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit .env and set JWT_SECRET and DB_PASSWORD"
        Write-Host ""
    } else {
        Write-Host "Error: .env.example not found" -ForegroundColor Red
        exit 1
    }
}

# Load .env
Get-Content ".env" -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# Check required env vars
if (-not $env:JWT_SECRET -or $env:JWT_SECRET -eq "your-jwt-secret-at-least-32-characters-long") {
    Write-Host "WARNING: JWT_SECRET not set or using default" -ForegroundColor Yellow
    Write-Host ""
}

if (-not $env:DB_PASSWORD -or $env:DB_PASSWORD -eq "your-database-password") {
    Write-Host "WARNING: DB_PASSWORD not set or using default" -ForegroundColor Yellow
    Write-Host ""
}

if ($ResetDb) {
    Write-Host "Resetting database..." -ForegroundColor Yellow
    docker compose --profile micro-frontend down -v --remove-orphans
    docker compose down -v --remove-orphans
}

if ($Mode -ne "core") {
    $ports = @(3050, 4130, 3032, 4120)
    foreach ($port in $ports) {
        $pids = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($pids) {
            foreach ($processId in $pids) {
                try {
                    Stop-Process -Id $processId -Force -ErrorAction Stop
                } catch {}
            }
        }
    }
}

Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

switch ($Mode) {
    "core" {
        Write-Host "Starting core services (MySQL, Redis, Backend, Permission Frontend)..."
        docker compose up -d --build mysql redis backend frontend
    }
    "micro-frontend" {
        Write-Host "Starting micro-frontend mode..."
        docker compose --profile micro-frontend up -d --build
    }
    default {
        Write-Host "Starting all services..."
        docker compose up -d --build mysql redis backend frontend
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
docker compose ps

if (docker ps -a --format "{{.Names}}" | Select-String -SimpleMatch "permission-backend") {
    Write-Host ""
    Write-Host "Waiting for backend..." -ForegroundColor Yellow
    $healthy = $false
    for ($i = 1; $i -le 30; $i++) {
        $backendHealth = docker inspect -f "{{.State.Health.Status}}" permission-backend 2>$null
        if ($backendHealth -eq "healthy") {
            Write-Host "[OK] Backend is ready" -ForegroundColor Green
            $healthy = $true
            break
        }
        Start-Sleep -Seconds 2
    }
    if (-not $healthy) {
        Write-Host "[WARN] Backend may not be ready. Run with --reset-db if needed." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Permission Frontend: http://localhost:3000"
Write-Host "Backend API:        http://localhost:8080/api"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Login Accounts:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
if ($env:AUTH_ADMIN_PASS) {
    Write-Host "Admin: admin / [password set]"
} else {
    Write-Host "Admin: admin / [NOT SET, set AUTH_ADMIN_PASS in .env]"
}

if ($env:AUTH_USER1_PASS) {
    Write-Host "User:  user1 / [password set]"
} else {
    Write-Host "User:  user1 / [NOT SET, set AUTH_USER1_PASS in .env]"
}
Write-Host ""
Write-Host "Note: User Center frontend needs to be started separately:" -ForegroundColor Yellow
Write-Host "  cd user-management-center-master/user-management-center-master/fe" -ForegroundColor Gray
Write-Host "  pnpm dev" -ForegroundColor Gray
Write-Host ""
