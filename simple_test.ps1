# Simple test for verification API
$API = "http://localhost:8081/api"
$EMPLOYER_ID = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"

Write-Host "Testing API on port 8081..." -ForegroundColor Cyan

# Login
$login = @{email="admin@medexjob.com"; password="admin123"} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -Body $login -ContentType "application/json"
    $token = $result.token
    Write-Host "Login OK" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit
}

# Test verification
$headers = @{"Authorization"="Bearer $token"}
$url = "$API/employers/$EMPLOYER_ID/verification"
$url = $url + "?status=approved"
$url = $url + "&notes=test"

Write-Host "Testing: $url" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $url -Method PUT -Headers $headers
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json | Write-Host
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Code: $code" -ForegroundColor Red
    }
}

