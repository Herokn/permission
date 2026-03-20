# Local development start script (no Docker required)

Write-Host "Starting local development environment..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running for MySQL/Redis
$dockerRunning = $false
try {
    docker ps | Out-Null
    $dockerRunning = $true
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Docker is not running. Please start Docker Desktop for MySQL/Redis." -ForegroundColor Yellow
    Write-Host "Or use external MySQL/Redis instances." -ForegroundColor Yellow
    Write-Host ""
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    cd "C:\Users\yao\Desktop\简历\project\new\permission\permission-bootstrap"
    mvn spring-boot:run
}

# Start Permission Frontend
Write-Host "Starting Permission Frontend..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    cd "C:\Users\yao\Desktop\简历\project\new\permission\permission-web-frontend"
    npm run dev
}

# Start User Center Frontend
Write-Host "Starting User Center Frontend..." -ForegroundColor Cyan
$userCenterJob = Start-Job -ScriptBlock {
    cd "C:\Users\yao\Desktop\简历\project\new\permission\user-management-center-master\user-management-center-master\fe"
    pnpm dev
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "Services started in background!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Permission Frontend: http://localhost:3000"
Write-Host "  User Center:        http://localhost:5174"
Write-Host "  Backend API:        http://localhost:8080/api"
Write-Host ""
Write-Host "To stop services, run: ./stop-local.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check logs with: Receive-Job <JobId>" -ForegroundColor Gray
Write-Host "Backend Job: $($backendJob.Id)"
Write-Host "Frontend Job: $($frontendJob.Id)"
Write-Host "UserCenter Job: $($userCenterJob.Id)"
