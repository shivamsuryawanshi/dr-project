# AI assisted development
# Simple Notification Test Script for Windows PowerShell

$baseUrl = "http://localhost:8081/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NOTIFICATION SYSTEM TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 1: Register Test Users (if not exists)
# ============================================
Write-Host "STEP 1: Registering Test Users" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

# Register Candidate
$candidateRegister = @{
    name = "Test Candidate"
    email = "candidate@test.com"
    password = "password123"
    phone = "1234567890"
    role = "CANDIDATE"
} | ConvertTo-Json

Write-Host "Registering Candidate..."
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $candidateRegister -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "✅ Candidate registered" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Candidate may already exist" -ForegroundColor Yellow
}

# Register Employer
$employerRegister = @{
    name = "Test Employer"
    email = "employer@test.com"
    password = "password123"
    phone = "1234567890"
    role = "EMPLOYER"
} | ConvertTo-Json

Write-Host "Registering Employer..."
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $employerRegister -ContentType "application/json" -ErrorAction SilentlyContinue
    Write-Host "✅ Employer registered" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Employer may already exist" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 2: Login as Candidate
# ============================================
Write-Host "STEP 2: Login as Candidate" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$candidateLogin = @{
    email = "candidate@test.com"
    password = "password123"
} | ConvertTo-Json

$candidateResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $candidateLogin -ContentType "application/json"
$candidateToken = $candidateResponse.token
$candidateUserId = $candidateResponse.user.id

Write-Host "✅ Candidate Token: $($candidateToken.Substring(0, 30))..." -ForegroundColor Green
Write-Host "✅ Candidate User ID: $candidateUserId" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 3: Login as Employer
# ============================================
Write-Host "STEP 3: Login as Employer" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$employerLogin = @{
    email = "employer@test.com"
    password = "password123"
} | ConvertTo-Json

$employerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $employerLogin -ContentType "application/json"
$employerToken = $employerResponse.token
$employerUserId = $employerResponse.user.id

Write-Host "✅ Employer Token: $($employerToken.Substring(0, 30))..." -ForegroundColor Green
Write-Host "✅ Employer User ID: $employerUserId" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 4: Check Initial Notification Counts
# ============================================
Write-Host "STEP 4: Check Initial Notification Counts" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$candidateHeaders = @{
    "Authorization" = "Bearer $candidateToken"
    "Content-Type" = "application/json"
}

$employerHeaders = @{
    "Authorization" = "Bearer $employerToken"
    "Content-Type" = "application/json"
}

$candidateUnreadBefore = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $candidateHeaders).unreadCount
$employerUnreadBefore = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $employerHeaders).unreadCount

Write-Host "Candidate Unread: $candidateUnreadBefore" -ForegroundColor Yellow
Write-Host "Employer Unread: $employerUnreadBefore" -ForegroundColor Yellow
Write-Host ""

# ============================================
# STEP 5: Get a Job ID
# ============================================
Write-Host "STEP 5: Get a Job ID" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$jobsResponse = Invoke-RestMethod -Uri "$baseUrl/jobs?page=0&size=1" -Method GET

if ($jobsResponse.content.Count -eq 0) {
    Write-Host "❌ No jobs found. Please create a job first." -ForegroundColor Red
    Write-Host ""
    Write-Host "To create a job, login as employer and use:"
    Write-Host "curl -X POST $baseUrl/jobs -H 'Authorization: Bearer $employerToken' -H 'Content-Type: application/json' -d '{...}'"
    exit
}

$testJobId = $jobsResponse.content[0].id
$testJobTitle = $jobsResponse.content[0].title

Write-Host "✅ Using Job: $testJobTitle (ID: $testJobId)" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 6: Candidate Applies for Job
# ============================================
Write-Host "STEP 6: Candidate Applies for Job" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "Expected: 2 notifications created"
Write-Host "  1. Candidate: 'Application submitted successfully'"
Write-Host "  2. Employer: 'New application received'"
Write-Host ""

$applyBody = @{
    jobId = $testJobId
    candidateName = "Test Candidate"
    candidateEmail = "candidate@test.com"
    candidatePhone = "1234567890"
    notes = "Test application for notification testing"
} | ConvertTo-Json

Write-Host "Request: POST $baseUrl/applications"
Write-Host ""

try {
    $applyResponse = Invoke-RestMethod -Uri "$baseUrl/applications" -Method POST -Headers $candidateHeaders -Body $applyBody
    $applicationId = $applyResponse.id
    
    Write-Host "✅ Application submitted successfully!" -ForegroundColor Green
    Write-Host "Application ID: $applicationId" -ForegroundColor Green
    Write-Host ""
    
    # Wait for notifications
    Start-Sleep -Seconds 3
    
    # Check notifications
    Write-Host "Checking notifications..." -ForegroundColor Yellow
    
    $candidateUnreadAfter = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $candidateHeaders).unreadCount
    $employerUnreadAfter = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $employerHeaders).unreadCount
    
    if ($candidateUnreadAfter -gt $candidateUnreadBefore) {
        Write-Host "✅ Candidate received new notification!" -ForegroundColor Green
        Write-Host "   Unread count: $candidateUnreadAfter (was $candidateUnreadBefore)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No new notification for candidate" -ForegroundColor Yellow
    }
    
    if ($employerUnreadAfter -gt $employerUnreadBefore) {
        Write-Host "✅ Employer received new notification!" -ForegroundColor Green
        Write-Host "   Unread count: $employerUnreadAfter (was $employerUnreadBefore)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No new notification for employer" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Show latest notifications
    Write-Host "Latest Candidate Notifications:" -ForegroundColor Cyan
    $candidateNotifs = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=3" -Method GET -Headers $candidateHeaders
    foreach ($notif in $candidateNotifs.content) {
        $readStatus = if ($notif.read) { "READ" } else { "UNREAD" }
        Write-Host "  [$readStatus] [$($notif.type)] $($notif.message)" -ForegroundColor $(if ($notif.read) { "Gray" } else { "White" })
    }
    
    Write-Host ""
    Write-Host "Latest Employer Notifications:" -ForegroundColor Cyan
    $employerNotifs = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=3" -Method GET -Headers $employerHeaders
    foreach ($notif in $employerNotifs.content) {
        $readStatus = if ($notif.read) { "READ" } else { "UNREAD" }
        Write-Host "  [$readStatus] [$($notif.type)] $($notif.message)" -ForegroundColor $(if ($notif.read) { "Gray" } else { "White" })
    }
    
} catch {
    Write-Host "❌ Application submission failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Manual CURL Commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Get Candidate Notifications:" -ForegroundColor White
Write-Host "   curl -X GET `"$baseUrl/notifications?page=0&size=10`" -H `"Authorization: Bearer $candidateToken`" -H `"Content-Type: application/json`""
Write-Host ""
Write-Host "2. Get Employer Notifications:" -ForegroundColor White
Write-Host "   curl -X GET `"$baseUrl/notifications?page=0&size=10`" -H `"Authorization: Bearer $employerToken`" -H `"Content-Type: application/json`""
Write-Host ""
Write-Host "3. Get Unread Count:" -ForegroundColor White
Write-Host "   curl -X GET `"$baseUrl/notifications/unread-count`" -H `"Authorization: Bearer $candidateToken`" -H `"Content-Type: application/json`""
Write-Host ""

