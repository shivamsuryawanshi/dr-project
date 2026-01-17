# AI assisted development

# Notification System - Complete Test Guide

## 📋 Test Overview

Yeh guide aapko step-by-step batayega ki kaise notification system ko test karein using CURL commands.

---

## 🚀 Prerequisites

1. **Backend running**: `http://localhost:8081`
2. **Test Users**: Candidate, Employer, Admin accounts
3. **CURL** ya **PowerShell** installed

---

## 📝 Test Users Setup

Pehle test users register karein:

### 1. Register Candidate
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

### 2. Register Employer
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

### 3. Create Admin (Database se ya seed script se)

---

## 🧪 Test Scenarios

### TEST 1: Application Submit Notifications

#### Step 1: Login as Candidate
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "password": "password123"
  }'
```

**Response se token save karein:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": { "id": "...", "email": "candidate@test.com", "role": "CANDIDATE" }
}
```

#### Step 2: Get Job ID
```bash
curl -X GET "http://localhost:8081/api/jobs?page=0&size=1" \
  -H "Content-Type: application/json"
```

**Response se job ID note karein**

#### Step 3: Apply for Job (Creates 2 notifications)
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

**Expected Notifications:**
- ✅ Candidate: "Your application for 'Job Title' has been submitted successfully!"
- ✅ Employer: "New application received for job: Job Title from Test Candidate (candidate@test.com)"

#### Step 4: Check Candidate Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json"
```

#### Step 5: Check Employer Notifications
```bash
# Pehle employer login karein
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@test.com",
    "password": "password123"
  }'

# Phir notifications check karein
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json"
```

---

### TEST 2: Application Status Update Notifications

#### Step 1: Login as Admin
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

#### Step 2: Update Application Status to SHORTLISTED
```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED",
    "notes": "Candidate has been shortlisted"
  }'
```

**Expected Notification:**
- ✅ Candidate: "🎉 Congratulations! Your application for 'Job Title' has been shortlisted."

#### Step 3: Update to INTERVIEW (with date)
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

**Expected Notification:**
- ✅ Candidate: "📅 Interview scheduled for job 'Job Title' on 2025-01-20T10:00:00"

#### Step 4: Update to SELECTED
```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SELECTED",
    "notes": "Congratulations!"
  }'
```

**Expected Notification:**
- ✅ Candidate: "🎉 Congratulations! You have been selected for the job 'Job Title'"

---

### TEST 3: Job Status Notifications

#### Step 1: Employer Creates Job
```bash
curl -X POST http://localhost:8081/api/jobs \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job for Notifications",
    "sector": "private",
    "category": "Junior Resident",
    "location": "Mumbai",
    "qualification": "MBBS",
    "experience": "0-2 years",
    "description": "Test job description",
    "lastDate": "2025-02-01",
    "contactEmail": "employer@test.com",
    "contactPhone": "1234567890"
  }'
```

**Expected Notifications:**
- ✅ Employer: "Your job 'Test Job for Notifications' has been approved and is now live!" (if verified)
- ✅ Employer: "Your job 'Test Job for Notifications' is pending admin approval" (if not verified)
- ✅ Admin: "New job 'Test Job for Notifications' from Company Name is pending approval" (if pending)

#### Step 2: Admin Updates Job Status
```bash
curl -X PUT "http://localhost:8081/api/jobs/JOB_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job for Notifications",
    "status": "ACTIVE"
  }'
```

**Expected Notification:**
- ✅ Employer: "✅ Your job 'Test Job for Notifications' has been approved and is now live!"

---

### TEST 4: Subscription Notifications

#### Step 1: Employer Purchases Subscription
```bash
curl -X POST http://localhost:8081/api/subscriptions \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PLAN_ID_HERE"
  }'
```

**Expected Notification:**
- ✅ Employer: "✅ Your subscription plan 'Plan Name' has been activated!"

#### Step 2: Cancel Subscription
```bash
curl -X POST "http://localhost:8081/api/subscriptions/SUBSCRIPTION_ID/cancel" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Notification:**
- ✅ Employer: "Your subscription plan 'Plan Name' has been cancelled."

---

### TEST 5: Employer Verification Notifications

#### Step 1: Admin Updates Verification Status
```bash
curl -X PUT "http://localhost:8081/api/employers/EMPLOYER_ID/verification?status=APPROVED&notes=Verified" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Notification:**
- ✅ Employer: "✅ Your employer account for 'Company Name' has been verified and approved!"

---

## 🔍 Notification Endpoints

### Get All Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Unread Count
```bash
curl -X GET "http://localhost:8081/api/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

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

## 📊 Expected Notification Types

| Type | When | To Whom |
|------|------|---------|
| `application_received` | Application submit | Employer |
| `application_update` | Status change | Candidate |
| `interview_scheduled` | Interview schedule | Candidate |
| `job_alert` | Job status change | Employer |
| `subscription` | Subscription events | Employer |
| `employer_verification` | Verification status | Employer |
| `job_pending` | Job pending | Admin |
| `employer_verification` | Verification request | Admin |

---

## ✅ Quick Test Checklist

- [ ] Candidate apply kare → Candidate + Employer ko notification
- [ ] Admin status update kare → Candidate ko notification
- [ ] Interview schedule kare → Candidate ko interview notification
- [ ] Job create kare → Employer ko job status notification
- [ ] Job approve kare → Employer ko approval notification
- [ ] Subscription purchase kare → Employer ko subscription notification
- [ ] Employer verify kare → Employer ko verification notification
- [ ] Admin ko pending approvals notifications

---

## 🐛 Troubleshooting

### No Notifications Received?

1. **Check Backend Logs**: `backend/logs/medexjob.log`
2. **Verify User IDs**: Notification `userId` sahi hai ya nahi
3. **Check Preferences**: User ne notifications disable kiye hain ya nahi
4. **Database Check**: `notifications` table mein entries check karein

### Check Database Directly
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

---

## 📝 Notes

- Notifications automatically create hote hain events par
- Error handling: Agar notification fail ho, to main operation fail nahi hota
- Preferences: User apni preferences se notifications on/off kar sakta hai
- Logging: Sab notifications logs mein record hote hain

---

**Happy Testing! 🎉**

