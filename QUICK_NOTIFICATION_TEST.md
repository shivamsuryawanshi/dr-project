# AI assisted development

# Quick Notification Test - CURL Commands

## 🚀 Quick Start

Backend start karein aur phir yeh commands run karein:

---

## 1️⃣ Register Test Users

### Candidate Register
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Candidate",
    "email": "candidate@test.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "CANDIDATE"
  }'
```

### Employer Register
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employer",
    "email": "employer@test.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "EMPLOYER"
  }'
```

---

## 2️⃣ Login aur Token Save Karein

### Candidate Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "password": "password123"
  }'
```

**Response se token copy karein:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {...}
}
```

### Employer Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@test.com",
    "password": "password123"
  }'
```

---

## 3️⃣ Get Job ID

```bash
curl -X GET "http://localhost:8081/api/jobs?page=0&size=1" \
  -H "Content-Type: application/json"
```

**Response se job ID copy karein**

---

## 4️⃣ Test Application Submit (Creates 2 Notifications)

**Replace `YOUR_CANDIDATE_TOKEN` aur `JOB_ID_HERE`:**

```bash
curl -X POST http://localhost:8081/api/applications \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "JOB_ID_HERE",
    "candidateName": "Test Candidate",
    "candidateEmail": "candidate@test.com",
    "candidatePhone": "1234567890",
    "notes": "Test application"
  }'
```

**Expected:**
- ✅ Candidate ko notification: "Application submitted successfully"
- ✅ Employer ko notification: "New application received"

---

## 5️⃣ Check Notifications

### Candidate Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json"
```

### Employer Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json"
```

### Unread Count
```bash
curl -X GET "http://localhost:8081/api/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 6️⃣ Test Status Update (Admin Required)

### Login as Admin
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Update Application Status
**Replace `YOUR_ADMIN_TOKEN` aur `APPLICATION_ID`:**

```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED",
    "notes": "Candidate shortlisted"
  }'
```

**Expected:**
- ✅ Candidate ko notification: "Congratulations! Your application has been shortlisted"

### Interview Scheduled
```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERVIEW",
    "interviewDate": "2025-01-20T10:00:00",
    "notes": "Interview scheduled"
  }'
```

**Expected:**
- ✅ Candidate ko notification: "Interview scheduled for job 'Job Title' on 2025-01-20T10:00:00"

---

## 7️⃣ Test Job Status Notification

### Employer Creates Job
```bash
curl -X POST http://localhost:8081/api/jobs \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "sector": "private",
    "category": "Junior Resident",
    "location": "Mumbai",
    "qualification": "MBBS",
    "experience": "0-2 years",
    "description": "Test job",
    "lastDate": "2025-02-01",
    "contactEmail": "employer@test.com",
    "contactPhone": "1234567890"
  }'
```

**Expected:**
- ✅ Employer ko notification: "Your job 'Test Job' has been approved" ya "pending approval"

---

## 8️⃣ Test Subscription Notification

### Purchase Subscription
```bash
curl -X POST http://localhost:8081/api/subscriptions \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PLAN_ID_HERE"
  }'
```

**Expected:**
- ✅ Employer ko notification: "Your subscription plan has been activated!"

---

## 9️⃣ Test Verification Notification

### Admin Updates Verification
```bash
curl -X PUT "http://localhost:8081/api/employers/EMPLOYER_ID/verification?status=APPROVED&notes=Verified" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:**
- ✅ Employer ko notification: "Your employer account has been verified and approved!"

---

## 🔟 Notification Management

### Mark as Read
```bash
curl -X PUT "http://localhost:8081/api/notifications/NOTIFICATION_ID/read" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Mark All as Read
```bash
curl -X PUT "http://localhost:8081/api/notifications/read-all" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Delete Notification
```bash
curl -X DELETE "http://localhost:8081/api/notifications/NOTIFICATION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Filter by Type
```bash
curl -X GET "http://localhost:8081/api/notifications?type=application_update&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Unread Only
```bash
curl -X GET "http://localhost:8081/api/notifications?unreadOnly=true&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 Complete Test Flow

1. ✅ Register Candidate & Employer
2. ✅ Login aur tokens save karein
3. ✅ Get job ID
4. ✅ Candidate apply kare → 2 notifications create
5. ✅ Check candidate notifications
6. ✅ Check employer notifications
7. ✅ Admin status update kare → Candidate ko notification
8. ✅ Interview schedule kare → Candidate ko notification
9. ✅ Job create kare → Employer ko notification
10. ✅ Subscription purchase kare → Employer ko notification

---

## 🎯 Expected Results

Har test ke baad notifications automatically create honge:
- **Candidate**: Application submit, status update, interview
- **Employer**: Application received, job status, subscription, verification
- **Admin**: Pending approvals

Sab notifications database mein save honge aur API se fetch kiye ja sakte hain!

---

**Test karne ke liye PowerShell script run karein:**
```powershell
.\test-notifications-simple.ps1
```

