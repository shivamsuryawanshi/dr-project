# AI assisted development

# Notification System - Live Test Commands

Backend running hai! Ab yeh commands step-by-step run karein:

---

## 🚀 STEP 1: Register Test Users

### Register Candidate
```bash
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Candidate\",\"email\":\"candidate@test.com\",\"password\":\"password123\",\"phone\":\"1234567890\",\"role\":\"CANDIDATE\"}"
```

### Register Employer
```bash
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Test Employer\",\"email\":\"employer@test.com\",\"password\":\"password123\",\"phone\":\"1234567890\",\"role\":\"EMPLOYER\"}"
```

---

## 🔑 STEP 2: Login aur Token Save Karein

### Candidate Login
```bash
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"candidate@test.com\",\"password\":\"password123\"}"
```

**Response se token copy karein aur `CANDIDATE_TOKEN` variable mein save karein**

### Employer Login
```bash
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"employer@test.com\",\"password\":\"password123\"}"
```

**Response se token copy karein aur `EMPLOYER_TOKEN` variable mein save karein**

---

## 📋 STEP 3: Get Job ID

```bash
curl -X GET "http://localhost:8081/api/jobs?page=0&size=1" -H "Content-Type: application/json"
```

**Response se job ID copy karein**

---

## ✅ STEP 4: Test Application Submit (2 Notifications Create Honge)

**Replace `YOUR_CANDIDATE_TOKEN` aur `JOB_ID_HERE`:**

```bash
curl -X POST http://localhost:8081/api/applications -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" -H "Content-Type: application/json" -d "{\"jobId\":\"JOB_ID_HERE\",\"candidateName\":\"Test Candidate\",\"candidateEmail\":\"candidate@test.com\",\"candidatePhone\":\"1234567890\",\"notes\":\"Test application\"}"
```

**Expected Results:**
- ✅ Candidate ko notification: "Your application for 'Job Title' has been submitted successfully!"
- ✅ Employer ko notification: "New application received for job: Job Title from Test Candidate (candidate@test.com)"

---

## 🔍 STEP 5: Check Notifications

### Candidate Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" -H "Content-Type: application/json"
```

### Employer Notifications
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" -H "Content-Type: application/json"
```

### Unread Count
```bash
curl -X GET "http://localhost:8081/api/notifications/unread-count" -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" -H "Content-Type: application/json"
```

---

## 📊 STEP 6: Test Status Update (Admin Required)

### Admin Login
```bash
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}"
```

### Update Application Status to SHORTLISTED
**Replace `YOUR_ADMIN_TOKEN` aur `APPLICATION_ID`:**

```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"SHORTLISTED\",\"notes\":\"Candidate shortlisted\"}"
```

**Expected:**
- ✅ Candidate ko notification: "🎉 Congratulations! Your application for 'Job Title' has been shortlisted."

### Interview Scheduled
```bash
curl -X PUT "http://localhost:8081/api/applications/APPLICATION_ID/status" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"INTERVIEW\",\"interviewDate\":\"2025-01-20T10:00:00\",\"notes\":\"Interview scheduled\"}"
```

**Expected:**
- ✅ Candidate ko notification: "📅 Interview scheduled for job 'Job Title' on 2025-01-20T10:00:00"

---

## 🎯 Complete Test Flow

1. ✅ Register users
2. ✅ Login aur tokens save karein
3. ✅ Get job ID
4. ✅ Apply for job → 2 notifications
5. ✅ Check notifications
6. ✅ Update status → Candidate ko notification
7. ✅ Interview schedule → Candidate ko notification

---

## 📝 Quick Reference

**All Notification Endpoints:**
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

**Filter Options:**
- `?type=application_update` - Filter by type
- `?unreadOnly=true` - Get unread only
- `?page=0&size=10` - Pagination

---

**Test karne ke liye yeh commands copy-paste karein!** 🚀

