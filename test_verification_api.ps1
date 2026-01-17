# Test script for Employer Verification API
# Usage: .\test_verification_api.ps1

$API_BASE = "http://localhost:8081/api"
$EMPLOYER_ID = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"  # Replace with actual employer ID

Write-Host "=== Testing Employer Verification API ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as admin to get token
Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@medexjob.com"  # Replace with actual admin email
    password = "admin123"  # Replace with actual admin password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Test verification update
Write-Host "Step 2: Testing verification update..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$status = "approved"
$notes = "Test verification via curl"

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/employers/$EMPLOYER_ID/verification?status=$status&notes=$notes" `
        -Method PUT `
        -Headers $headers
    
    Write-Host "✓ Verification update successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ Verification update failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

