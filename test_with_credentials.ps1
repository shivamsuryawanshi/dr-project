# Test with actual admin credentials
$API = "http://127.0.0.1:8081/api"
$EMAIL = "shivam21@gmail.com"
$PASSWORD = "shivam21@gmail.com"

Write-Host "=== Testing with Admin Credentials ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$login = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -Body $login -ContentType "application/json"
    $token = $result.token
    if ($token) {
        Write-Host "✓ Login successful" -ForegroundColor Green
        $script:TOKEN = $token
    } else {
        Write-Host "✗ Login failed: No token" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response: $body" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 2: Get employers list
Write-Host "Step 2: Fetching employers..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

try {
    $employers = Invoke-RestMethod -Uri "$API/employers" -Method GET -Headers $headers
    if ($employers.employers -and $employers.employers.Count -gt 0) {
        $emp = $employers.employers[0]
        $script:EMPLOYER_ID = $emp.id
        Write-Host "✓ Found employer: $($emp.companyName) (ID: $EMPLOYER_ID)" -ForegroundColor Green
    } else {
        Write-Host "⚠ No employers found" -ForegroundColor Yellow
        $script:EMPLOYER_ID = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"
        Write-Host "Using default ID: $EMPLOYER_ID" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not fetch employers: $($_.Exception.Message)" -ForegroundColor Yellow
    $script:EMPLOYER_ID = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"
    Write-Host "Using default ID: $EMPLOYER_ID" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Test verification update
Write-Host "Step 3: Testing verification update..." -ForegroundColor Yellow
Write-Host "Employer ID: $EMPLOYER_ID" -ForegroundColor Gray

$status = "approved"
$notes = "Test via API"
$url = "$API/employers/$EMPLOYER_ID/verification"
$url = $url + "?status=" + [System.Web.HttpUtility]::UrlEncode($status)
$url = $url + "&notes=" + [System.Web.HttpUtility]::UrlEncode($notes)

Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method PUT -Headers $headers
    Write-Host "✓ SUCCESS! Verification updated" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    Write-Host "=== TEST PASSED ===" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status: $code" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            Write-Host "Response Body:" -ForegroundColor Red
            Write-Host $body -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "TEST FAILED" -ForegroundColor Red
    exit 1
}

