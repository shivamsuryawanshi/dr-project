$API = "http://127.0.0.1:8081/api"
$EMAIL = "shivam21@gmail.com"
$PASSWORD = "shivam21@gmail.com"

Write-Host "Testing API..." -ForegroundColor Cyan

# Login
$login = @{email=$EMAIL; password=$PASSWORD} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -Body $login -ContentType "application/json"
    $token = $result.token
    Write-Host "Login OK" -ForegroundColor Green
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit
}

# Get employers
$headers = @{"Authorization"="Bearer $token"}
try {
    $emps = Invoke-RestMethod -Uri "$API/employers" -Method GET -Headers $headers
    if ($emps.employers -and $emps.employers.Count -gt 0) {
        $empId = $emps.employers[0].id
        Write-Host "Found employer: $empId" -ForegroundColor Green
    } else {
        $empId = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"
        Write-Host "Using default ID: $empId" -ForegroundColor Yellow
    }
} catch {
    $empId = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"
    Write-Host "Using default ID: $empId" -ForegroundColor Yellow
}

# Test verification
$url = "$API/employers/$empId/verification"
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
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            Write-Host "Response: $body" -ForegroundColor Red
        } catch {}
    }
}

