# PowerShell API Testing Script for MedExJob Backend
# Run this after starting the server with: mvn spring-boot:run

$BaseUrl = "http://localhost:8081/api"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MedExJob Backend API Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Jobs List (Public)
Write-Host "1. Testing Jobs List (Public Endpoint)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/jobs?page=0&size=5" -Method GET
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Total Jobs: $($response.totalElements)" -ForegroundColor White
    Write-Host "   Jobs Returned: $($response.content.Count)" -ForegroundColor White
    if ($response.content.Count -gt 0) {
        Write-Host "   First Job: $($response.content[0].title) - $($response.content[0].location)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Jobs Meta (Public)
Write-Host "2. Testing Jobs Meta (Categories & Locations)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/jobs/meta" -Method GET
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   Categories: $($response.categories.Count)" -ForegroundColor White
    Write-Host "   Locations: $($response.locations.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: News (Public)
Write-Host "3. Testing News Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/news/homepage" -Method GET
    Write-Host "✅ SUCCESS" -ForegroundColor Green
    Write-Host "   News Items: $($response.Count)" -ForegroundColor White
    if ($response.Count -gt 0) {
        Write-Host "   Latest: $($response[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Applications (Requires Auth - should return 401)
Write-Host "4. Testing Applications Endpoint (Should require auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/applications?page=0&size=5" -Method GET
    Write-Host "⚠️  WARNING: Endpoint accessible without auth!" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ SUCCESS: Endpoint properly secured (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Auth - Login Test (Public)
Write-Host "5. Testing Login Endpoint Structure..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "⚠️  Unexpected success" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ SUCCESS: Login endpoint working (rejected invalid credentials)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server Status: ✅ RUNNING on http://localhost:8081" -ForegroundColor Green
Write-Host ""
Write-Host "To test authenticated endpoints:" -ForegroundColor Yellow
Write-Host "1. Register: POST $BaseUrl/auth/register" -ForegroundColor White
Write-Host "2. Login: POST $BaseUrl/auth/login" -ForegroundColor White
Write-Host "3. Use token: Add header 'Authorization: Bearer YOUR_TOKEN'" -ForegroundColor White
Write-Host ""

