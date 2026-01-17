# AI assisted development
# Complete Deployment Script for MedExJob - Frontend + Backend
# Run this script to deploy all changes

param(
    [string]$VPS_IP = "72.62.196.181",
    [string]$VPS_USER = "root",
    [string]$VPS_BACKEND_PATH = "/opt/medexjob/backend",
    [string]$VPS_FRONTEND_PATH = "/var/www/medexjob"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MedExJob Complete Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

# ============================================
# STEP 1: DEPLOY FRONTEND
# ============================================
Write-Host "[STEP 1/4] Deploying Frontend..." -ForegroundColor Yellow
Write-Host ""

$frontendPath = Join-Path $projectRoot "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-Host "ERROR: Frontend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Build frontend
Write-Host "  Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Frontend build completed" -ForegroundColor Green

# Upload frontend
$distPath = Join-Path $frontendPath "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "ERROR: dist folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "  Uploading frontend files to VPS..." -ForegroundColor Cyan
$vpsConnection = $VPS_USER + "@" + $VPS_IP
$scpDestination = $vpsConnection + ":" + $VPS_FRONTEND_PATH + "/"

scp -r "$distPath\*" $scpDestination

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend upload failed!" -ForegroundColor Red
    Write-Host "  Please check SSH connection and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✓ Frontend uploaded successfully" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: UPLOAD BACKEND FILES
# ============================================
Write-Host "[STEP 2/4] Uploading Backend Files..." -ForegroundColor Yellow
Write-Host ""

$backendPath = Join-Path $projectRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot

# Upload pom.xml
Write-Host "  Uploading pom.xml..." -ForegroundColor Cyan
$backendDest = "${vpsConnection}:${VPS_BACKEND_PATH}/"
scp "$backendPath\pom.xml" $backendDest

# Upload src folder
Write-Host "  Uploading src folder..." -ForegroundColor Cyan
scp -r "$backendPath\src" $backendDest

# Upload application-prod.yml if exists
if (Test-Path "$backendPath\application-prod.yml") {
    Write-Host "  Uploading application-prod.yml..." -ForegroundColor Cyan
    $resourcesDest = "${vpsConnection}:${VPS_BACKEND_PATH}/src/main/resources/"
    scp "$backendPath\application-prod.yml" $resourcesDest
}

Write-Host "  ✓ Backend files uploaded successfully" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 3: BUILD AND RESTART BACKEND ON VPS
# ============================================
Write-Host "[STEP 3/4] Building Backend on VPS..." -ForegroundColor Yellow
Write-Host ""

$buildCommand = "cd $VPS_BACKEND_PATH && mvn clean package -DskipTests"
Write-Host "  Running: $buildCommand" -ForegroundColor Cyan
ssh $vpsConnection $buildCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Backend build may have issues. Check logs on VPS." -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Backend built successfully" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 4: RESTART SERVICES AND SET PERMISSIONS
# ============================================
Write-Host "[STEP 4/4] Restarting Services..." -ForegroundColor Yellow
Write-Host ""

$serviceCommands = @(
    "systemctl restart medexjob-backend",
    "cd $VPS_FRONTEND_PATH && chown -R www-data:www-data .",
    "cd $VPS_FRONTEND_PATH && chmod -R 755 .",
    "nginx -t",
    "systemctl reload nginx"
)

$fullCommand = $serviceCommands -join " && "
Write-Host "  Restarting services and setting permissions..." -ForegroundColor Cyan
ssh $vpsConnection $fullCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Services restarted successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: Some service commands may have failed. Check manually on VPS." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test website: https://medexjob.com" -ForegroundColor Cyan
$logCommand = "ssh ${vpsConnection} 'journalctl -u medexjob-backend -n 50'"
Write-Host "  2. Check backend logs: $logCommand" -ForegroundColor Cyan
$statusCommand = "ssh ${vpsConnection} 'systemctl status medexjob-backend nginx'"
Write-Host "  3. Verify services: $statusCommand" -ForegroundColor Cyan
Write-Host ""

