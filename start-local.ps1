# AI assisted development

# MedExJob Local Development Startup Script
# यह script backend और frontend दोनों start करेगा

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MedExJob Local Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
$mysqlCheck = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if (-not $mysqlCheck.TcpTestSucceeded) {
    Write-Host "⚠️  WARNING: MySQL server might not be running on port 3306" -ForegroundColor Red
    Write-Host "   Please start MySQL server before continuing" -ForegroundColor Yellow
    Write-Host ""
}

# Check Java
Write-Host "Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found! Please install Java 17 or higher" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18 or higher" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Backend and Frontend..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "🚀 Starting Backend (Port 8081)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend...' -ForegroundColor Green; mvn spring-boot:run"

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "🚀 Starting Frontend (Port 5173)..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Installing dependencies (if needed)...' -ForegroundColor Green; if (-not (Test-Path 'node_modules')) { npm install }; Write-Host 'Starting Frontend...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Both servers starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8081" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

