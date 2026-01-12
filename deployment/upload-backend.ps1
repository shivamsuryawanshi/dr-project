# AI assisted development
# PowerShell script to upload backend files to VPS

Write-Host "Uploading Backend Files to VPS..." -ForegroundColor Green

# Navigate to project directory
cd "D:\chrome download\MedExJobUpdated"

# Upload pom.xml
Write-Host "Uploading pom.xml..." -ForegroundColor Yellow
scp backend/pom.xml root@72.62.196.181:/opt/medexjob/backend/

# Upload src folder
Write-Host "Uploading src folder..." -ForegroundColor Yellow
scp -r backend/src root@72.62.196.181:/opt/medexjob/backend/

# Upload README if exists
if (Test-Path "backend/README.md") {
    Write-Host "Uploading README.md..." -ForegroundColor Yellow
    scp backend/README.md root@72.62.196.181:/opt/medexjob/backend/
}

Write-Host "Upload Complete!" -ForegroundColor Green
Write-Host "Now verify on VPS with: ls -la /opt/medexjob/backend/" -ForegroundColor Cyan

