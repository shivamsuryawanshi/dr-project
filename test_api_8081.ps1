# Test Employer Verification API on port 8081
$API_BASE = "http://localhost:8081/api"
$EMPLOYER_ID = "eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"

Write-Host "=== Testing Employer Verification API on Port 8081 ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if backend is running
Write-Host "Step 1: Checking backend health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is running on port 8081" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend not responding on port 8081" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Login as admin
Write-Host "Step 2: Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@medexjob.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $loginResponse.token
    if (-not $token) {
        Write-Host "✗ Login failed: No token received" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Login successful" -ForegroundColor Green
    $tokenLength = [Math]::Min(20, $token.Length)
    Write-Host "Token: $($token.Substring(0, $tokenLength))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Note: You may need to use a different admin email/password." -ForegroundColor Yellow
    Write-Host "Please provide the correct admin credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Get list of employers to find a valid ID
Write-Host "Step 3: Fetching employers list..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $employersResponse = Invoke-RestMethod -Uri "$API_BASE/employers" -Method GET -Headers $headers -ErrorAction Stop
    if ($employersResponse.employers -and $employersResponse.employers.Count -gt 0) {
        $firstEmployer = $employersResponse.employers[0]
        $EMPLOYER_ID = $firstEmployer.id
        Write-Host "✓ Found employer: $($firstEmployer.companyName) (ID: $EMPLOYER_ID)" -ForegroundColor Green
    }
    if (-not ($employersResponse.employers -and $employersResponse.employers.Count -gt 0)) {
        Write-Host "⚠ No employers found, using provided ID: $EMPLOYER_ID" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not fetch employers list: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Using provided employer ID: $EMPLOYER_ID" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Test verification update
Write-Host "Step 4: Testing verification update..." -ForegroundColor Yellow
Write-Host "Employer ID: $EMPLOYER_ID" -ForegroundColor Gray
Write-Host "Status: approved" -ForegroundColor Gray
Write-Host "Notes: Test verification via API" -ForegroundColor Gray
Write-Host ""

$status = "approved"
$notes = "Test verification via API"

# Build URL with proper encoding - use string concatenation to avoid & parsing issues
$verificationUrl = "$API_BASE/employers/$EMPLOYER_ID/verification"
$encodedStatus = [System.Web.HttpUtility]::UrlEncode($status)
$encodedNotes = [System.Web.HttpUtility]::UrlEncode($notes)
$ampersand = '&'
$queryString = "status=$encodedStatus" + $ampersand + "notes=$encodedNotes"
$fullUrl = "$verificationUrl" + "?" + $queryString
Write-Host "URL: $fullUrl" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $fullUrl -Method PUT -Headers $headers -ErrorAction Stop
    
    Write-Host "✓ Verification update successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    Write-Host ""
    Write-Host "=== Test PASSED ===" -ForegroundColor Green
} catch {
    Write-Host "✗ Verification update failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "=== Test FAILED ===" -ForegroundColor Red
    exit 1
}
