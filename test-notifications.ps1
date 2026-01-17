# AI assisted development
# Complete Notification System Test Script
# PowerShell script to test all notification endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NOTIFICATION SYSTEM TEST - CURL COMMANDS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8081/api"
$token = ""

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Yellow }

Write-Info "Make sure backend is running on http://localhost:8081"
Write-Host ""

# ============================================
# STEP 1: Login as Candidate
# ============================================
Write-Host "STEP 1: Login as Candidate" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$candidateLogin = @{
    email = "candidate@test.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Request: POST $baseUrl/auth/login"
Write-Host "Body: $candidateLogin"
Write-Host ""

$candidateResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $candidateLogin -ContentType "application/json" -ErrorAction SilentlyContinue

if ($candidateResponse) {
    $candidateToken = $candidateResponse.token
    $candidateUserId = $candidateResponse.user.id
    Write-Success "✅ Candidate logged in successfully"
    Write-Host "Token: $($candidateToken.Substring(0, 20))..."
    Write-Host "User ID: $candidateUserId"
    Write-Host ""
} else {
    Write-Error "❌ Candidate login failed. Please register first or check credentials."
    Write-Host ""
    Write-Host "To register candidate, use:"
    Write-Host "curl -X POST $baseUrl/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Candidate\",\"email\":\"candidate@test.com\",\"password\":\"password123\",\"phone\":\"1234567890\",\"role\":\"CANDIDATE\"}'"
    Write-Host ""
    exit
}

# ============================================
# STEP 2: Login as Employer
# ============================================
Write-Host "STEP 2: Login as Employer" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$employerLogin = @{
    email = "employer@test.com"
    password = "password123"
} | ConvertTo-Json

$employerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $employerLogin -ContentType "application/json" -ErrorAction SilentlyContinue

if ($employerResponse) {
    $employerToken = $employerResponse.token
    $employerUserId = $employerResponse.user.id
    Write-Success "✅ Employer logged in successfully"
    Write-Host "Token: $($employerToken.Substring(0, 20))..."
    Write-Host "User ID: $employerUserId"
    Write-Host ""
} else {
    Write-Error "❌ Employer login failed. Please register first or check credentials."
    Write-Host ""
    exit
}

# ============================================
# STEP 3: Get Candidate Notifications (Before)
# ============================================
Write-Host "STEP 3: Get Candidate Notifications (Before)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $candidateToken"
    "Content-Type" = "application/json"
}

$candidateNotificationsBefore = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=10" -Method GET -Headers $headers -ErrorAction SilentlyContinue

if ($candidateNotificationsBefore) {
    $unreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $headers).unreadCount
    Write-Info "Candidate has $unreadCount unread notifications"
    Write-Host "Total notifications: $($candidateNotificationsBefore.totalElements)"
    Write-Host ""
}

# ============================================
# STEP 4: Get Employer Notifications (Before)
# ============================================
Write-Host "STEP 4: Get Employer Notifications (Before)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$employerHeaders = @{
    "Authorization" = "Bearer $employerToken"
    "Content-Type" = "application/json"
}

$employerNotificationsBefore = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=10" -Method GET -Headers $employerHeaders -ErrorAction SilentlyContinue

if ($employerNotificationsBefore) {
    $employerUnreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $employerHeaders).unreadCount
    Write-Info "Employer has $employerUnreadCount unread notifications"
    Write-Host "Total notifications: $($employerNotificationsBefore.totalElements)"
    Write-Host ""
}

# ============================================
# STEP 5: Get a Job ID (for application)
# ============================================
Write-Host "STEP 5: Get a Job ID for Testing" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$jobsResponse = Invoke-RestMethod -Uri "$baseUrl/jobs?page=0&size=1" -Method GET -ErrorAction SilentlyContinue

if ($jobsResponse -and $jobsResponse.content.Count -gt 0) {
    $testJobId = $jobsResponse.content[0].id
    Write-Success "✅ Found job: $testJobId"
    Write-Host "Job Title: $($jobsResponse.content[0].title)"
    Write-Host ""
} else {
    Write-Error "❌ No jobs found. Please create a job first."
    Write-Host ""
    exit
}

# ============================================
# STEP 6: Candidate Applies for Job (Should create notifications)
# ============================================
Write-Host "STEP 6: Candidate Applies for Job" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "This should create:"
Write-Host "  1. Notification to Employer: 'New application received'"
Write-Host "  2. Notification to Candidate: 'Application submitted successfully'"
Write-Host ""

$applyFormData = @{
    jobId = $testJobId
    candidateName = "Test Candidate"
    candidateEmail = "candidate@test.com"
    candidatePhone = "1234567890"
    notes = "Test application for notification testing"
}

Write-Host "Request: POST $baseUrl/applications"
Write-Host "Body: $($applyFormData | ConvertTo-Json)"
Write-Host ""

try {
    $applyResponse = Invoke-RestMethod -Uri "$baseUrl/applications" -Method POST -Headers $headers -Body ($applyFormData | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
    Write-Success "✅ Application submitted successfully!"
    Write-Host "Application ID: $($applyResponse.id)"
    Write-Host ""
    
    # Wait a bit for notifications to be created
    Start-Sleep -Seconds 2
    
    # Check notifications
    Write-Host "Checking notifications after application..."
    $candidateNotificationsAfter = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=10" -Method GET -Headers $headers
    $newUnreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $headers).unreadCount
    
    if ($newUnreadCount -gt $unreadCount) {
        Write-Success "✅ Candidate received new notification!"
        Write-Host "New unread count: $newUnreadCount (was $unreadCount)"
    }
    
    $employerNotificationsAfter = Invoke-RestMethod -Uri "$baseUrl/notifications?page=0&size=10" -Method GET -Headers $employerHeaders
    $employerNewUnreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $employerHeaders).unreadCount
    
    if ($employerNewUnreadCount -gt $employerUnreadCount) {
        Write-Success "✅ Employer received new notification!"
        Write-Host "New unread count: $employerNewUnreadCount (was $employerUnreadCount)"
    }
    
    Write-Host ""
} catch {
    Write-Error "❌ Application submission failed: $($_.Exception.Message)"
    Write-Host ""
}

# ============================================
# STEP 7: Update Application Status (Should notify candidate)
# ============================================
Write-Host "STEP 7: Update Application Status to SHORTLISTED" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "This should create notification to Candidate: 'Application shortlisted'"
Write-Host ""

# Get application ID (you may need to adjust this)
$applicationsResponse = Invoke-RestMethod -Uri "$baseUrl/applications?candidateId=$candidateUserId&page=0&size=1" -Method GET -Headers $headers -ErrorAction SilentlyContinue

if ($applicationsResponse -and $applicationsResponse.content.Count -gt 0) {
    $applicationId = $applicationsResponse.content[0].id
    Write-Host "Found application: $applicationId"
    
    # Login as Admin to update status
    Write-Host "Logging in as Admin..."
    $adminLogin = @{
        email = "admin@test.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -ErrorAction SilentlyContinue
    
    if ($adminResponse) {
        $adminToken = $adminResponse.token
        $adminHeaders = @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        
        $statusUpdate = @{
            status = "SHORTLISTED"
            notes = "Candidate has been shortlisted"
        } | ConvertTo-Json
        
        Write-Host "Request: PUT $baseUrl/applications/$applicationId/status"
        Write-Host "Body: $statusUpdate"
        Write-Host ""
        
        try {
            $updateResponse = Invoke-RestMethod -Uri "$baseUrl/applications/$applicationId/status" -Method PUT -Headers $adminHeaders -Body $statusUpdate -ErrorAction Stop
            Write-Success "✅ Application status updated to SHORTLISTED!"
            Write-Host ""
            
            Start-Sleep -Seconds 2
            
            # Check candidate notifications
            $finalUnreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method GET -Headers $headers).unreadCount
            Write-Success "✅ Candidate unread notifications: $finalUnreadCount"
            
        } catch {
            Write-Error "❌ Status update failed: $($_.Exception.Message)"
        }
    } else {
        Write-Error "❌ Admin login failed. Please check admin credentials."
    }
} else {
    Write-Error "❌ No applications found for candidate"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view all notifications, use:" -ForegroundColor Yellow
Write-Host "  Candidate: curl -H 'Authorization: Bearer $candidateToken' $baseUrl/notifications" -ForegroundColor White
Write-Host "  Employer: curl -H 'Authorization: Bearer $employerToken' $baseUrl/notifications" -ForegroundColor White
Write-Host ""

