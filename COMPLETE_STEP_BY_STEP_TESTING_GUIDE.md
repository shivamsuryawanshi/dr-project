# AI assisted development

# 📋 Complete Step-by-Step Testing Guide - MedExJob.com

यह guide आपको MedExJob.com platform की सभी functionality को step-by-step test करने में मदद करेगा।

---

## 🚀 Pre-Testing Setup (पहले ये करें)

### Step 1: Database Setup

```bash
# MySQL में database create करें
mysql -u root -p
CREATE DATABASE medtech_db;
USE medtech_db;
EXIT;
```

### Step 2: Backend Start करें

```bash
cd MedExJobUpdated/backend
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

**Check करें:**

- Backend `http://localhost:8081` पर run हो रहा है
- Database connection successful है
- Console में "Started MedexjobBackendApplication" message दिखे

### Step 3: Frontend Start करें

```bash
cd MedExJobUpdated/frontend
npm install
npm run dev
```

**Check करें:**

- Frontend `http://localhost:5173` पर run हो रहा है
- Browser में page load हो रहा है

---

## 📝 Testing Checklist

### ✅ Phase 1: Public Pages Testing (Authentication बिना)

#### Test 1.1: HomePage Testing

**Steps:**

1. Browser में `http://localhost:5173` open करें
2. Homepage load होना चाहिए

**Expected Results:**

- ✅ Hero section दिखे
- ✅ Featured jobs section दिखे
- ✅ Job categories दिखें
- ✅ Navigation menu काम करे
- ✅ Footer दिखे

**API Test:**

```bash
curl http://localhost:8081/api/jobs?featured=true
```

---

#### Test 1.2: Job Listing Page Testing

**Steps:**

1. Header में "Jobs" menu click करें
2. या URL: `http://localhost:5173/jobs` पर जाएं

**Expected Results:**

- ✅ सभी jobs list में दिखें
- ✅ Filters काम करें (sector, category, location)
- ✅ Search functionality काम करे
- ✅ Pagination काम करे (अगर jobs ज्यादा हैं)

**Test Cases:**

- **Filter by Sector:** Government/Private jobs filter करें
- **Filter by Category:** Category select करें
- **Filter by Location:** Location select करें
- **Search:** Job title में search करें

**API Test:**

```bash
# All jobs
curl http://localhost:8081/api/jobs

# Filtered jobs
curl "http://localhost:8081/api/jobs?sector=government&category=doctor"
```

---

#### Test 1.3: Job Detail Page Testing

**Steps:**

1. Job listing page से किसी job पर click करें
2. Job detail page open होना चाहिए

**Expected Results:**

- ✅ Job की सभी details दिखें
- ✅ Apply button दिखे (login required message)
- ✅ Job description properly formatted हो
- ✅ Requirements, salary, location दिखें

**API Test:**

```bash
# Replace {jobId} with actual job ID
curl http://localhost:8081/api/jobs/{jobId}
```

---

#### Test 1.4: Static Pages Testing

**Pages to Test:**

1. **About Page:** `/about`
2. **FAQ Page:** `/faq`
3. **Privacy Policy:** `/privacy-policy`
4. **Terms & Conditions:** `/terms-conditions`
5. **News Page:** `/news`

**Steps:**

- Header में respective links click करें
- या direct URL access करें

**Expected Results:**

- ✅ सभी pages properly load हों
- ✅ Content properly formatted हो
- ✅ Navigation काम करे

---

### ✅ Phase 2: Authentication Testing

#### Test 2.1: User Registration

**Steps:**

1. Header में "Register" या "Sign Up" click करें
2. Registration form fill करें:
   - Name
   - Email (unique)
   - Phone
   - Password
   - Role (CANDIDATE/EMPLOYER)
3. "Register" button click करें

**Expected Results:**

- ✅ Success message दिखे
- ✅ Email verification message दिखे (अगर configured है)
- ✅ User dashboard पर redirect हो

**API Test:**

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "Test@123",
    "role": "CANDIDATE"
  }'
```

**Test Cases:**

- ✅ Valid registration
- ✅ Duplicate email (should fail)
- ✅ Invalid email format
- ✅ Weak password
- ✅ Missing required fields

---

#### Test 2.2: User Login

**Steps:**

1. Header में "Login" click करें
2. Email और password enter करें
3. "Login" button click करें

**Expected Results:**

- ✅ Success message दिखे
- ✅ JWT token receive हो
- ✅ Role-based dashboard पर redirect हो
- ✅ Header में user name दिखे

**API Test:**

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

**Response में token save करें:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Test Cases:**

- ✅ Valid credentials
- ✅ Invalid email
- ✅ Wrong password
- ✅ Non-existent user

---

#### Test 2.3: Forgot Password Flow

**Steps:**

1. Login page पर "Forgot Password?" link click करें
2. Email enter करें
3. OTP request करें
4. Email में OTP check करें
5. OTP enter करें
6. New password set करें

**Expected Results:**

- ✅ OTP email receive हो
- ✅ OTP verification successful हो
- ✅ Password reset successful हो
- ✅ New password से login हो सके

**API Test:**

```bash
# Step 1: Request OTP
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Step 2: Verify OTP
curl -X POST http://localhost:8081/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# Step 3: Reset Password
curl -X POST http://localhost:8081/api/auth/reset-password-with-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "newPassword": "NewPass@123"
  }'
```

---

#### Test 2.4: Get Current User

**Steps:**

1. Login करने के बाद
2. Profile page पर जाएं

**Expected Results:**

- ✅ Current user details दिखें
- ✅ User role correct हो

**API Test:**

```bash
# Replace YOUR_TOKEN with actual JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/auth/me
```

---

### ✅ Phase 3: Candidate Features Testing

#### Test 3.1: Candidate Dashboard

**Steps:**

1. Candidate account से login करें
2. Dashboard पर automatically redirect होना चाहिए
3. या `/dashboard/candidate` पर जाएं

**Expected Results:**

- ✅ Dashboard load हो
- ✅ Recent applications दिखें
- ✅ Saved jobs दिखें
- ✅ Quick stats दिखें
- ✅ Navigation menu काम करे

---

#### Test 3.2: Apply for Job

**Steps:**

1. Job listing या job detail page पर जाएं
2. किसी job पर "Apply Now" button click करें
3. Application form fill करें:
   - Resume upload करें
   - Cover letter (optional)
   - Additional information
4. "Submit Application" click करें

**Expected Results:**

- ✅ Application successfully submit हो
- ✅ Success message दिखे
- ✅ Application tracking में दिखे

**API Test:**

```bash
curl -X POST http://localhost:8081/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "coverLetter": "I am interested in this position",
    "resume": "base64_encoded_resume_or_file_path"
  }'
```

---

#### Test 3.3: Application Tracking

**Steps:**

1. Candidate dashboard से "Application Tracking" पर जाएं
2. या `/notifications` पर जाएं (अगर linked है)

**Expected Results:**

- ✅ सभी submitted applications दिखें
- ✅ Application status दिखे (Pending, Shortlisted, Rejected, etc.)
- ✅ Job details के साथ application cards
- ✅ Status update notifications दिखें

**API Test:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/applications
```

**Test Cases:**

- ✅ View all applications
- ✅ Filter by status
- ✅ View application details

---

#### Test 3.4: Job Alerts

**Steps:**

1. Candidate dashboard से "Job Alerts" पर जाएं
2. "Create Alert" button click करें
3. Alert details fill करें:
   - Keywords
   - Location
   - Category
   - Salary range
   - Alert frequency
4. "Save Alert" click करें

**Expected Results:**

- ✅ Alert successfully create हो
- ✅ Alert list में दिखे
- ✅ Toggle switch से activate/deactivate कर सकें

**API Test:**

```bash
# Create Alert
curl -X POST http://localhost:8081/api/job-alerts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "doctor",
    "location": "Mumbai",
    "category": "Medical",
    "isActive": true
  }'

# Get All Alerts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/job-alerts

# Toggle Alert
curl -X POST http://localhost:8081/api/job-alerts/{alertId}/toggle-active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Cases:**

- ✅ Create new alert
- ✅ View all alerts
- ✅ Edit alert
- ✅ Delete alert
- ✅ Toggle alert active/inactive

---

#### Test 3.5: Saved Jobs

**Steps:**

1. Job detail page पर "Save Job" button click करें
2. Candidate dashboard में "Saved Jobs" section check करें

**Expected Results:**

- ✅ Job successfully save हो
- ✅ Saved jobs list में दिखे
- ✅ Unsave functionality काम करे

---

#### Test 3.6: Profile Management

**Steps:**

1. Header में profile icon click करें
2. "Profile" option select करें
3. Profile details edit करें:
   - Personal information
   - Skills
   - Experience
   - Education
   - Resume upload
4. "Save" click करें

**Expected Results:**

- ✅ Profile successfully update हो
- ✅ Changes reflect हों
- ✅ Validation errors properly show हों

---

### ✅ Phase 4: Employer Features Testing

#### Test 4.1: Employer Registration & Verification

**Steps:**

1. Registration में role "EMPLOYER" select करें
2. Registration complete करें
3. Employer verification page पर automatically redirect होना चाहिए
4. Verification documents upload करें:
   - Business License
   - GST Certificate
   - PAN Card
   - Address Proof
   - Authorization Letter
5. "Submit for Verification" click करें

**Expected Results:**

- ✅ Documents successfully upload हों
- ✅ Verification status "PENDING" हो
- ✅ Admin approval का wait करें

**API Test:**

```bash
# Upload Documents
curl -X POST http://localhost:8081/api/employers/{employerId}/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "businessLicense=@business_license.pdf" \
  -F "gstCertificate=@gst_cert.pdf" \
  -F "panCard=@pan_card.pdf" \
  -F "addressProof=@address_proof.pdf" \
  -F "authorizationLetter=@auth_letter.pdf"
```

---

#### Test 4.2: Employer Dashboard

**Steps:**

1. Verified employer account से login करें
2. Employer dashboard पर जाएं

**Expected Results:**

- ✅ Dashboard load हो
- ✅ Posted jobs दिखें
- ✅ Applications received दिखें
- ✅ Quick stats दिखें
- ✅ Subscription status दिखे

---

#### Test 4.3: Job Posting

**Steps:**

1. Employer dashboard से "Post Job" या "Create Job" click करें
2. Multi-step form fill करें:

   **Step 1: Basic Information**

   - Job Title
   - Organization Name
   - Sector (Government/Private)
   - Category
   - Location

   **Step 2: Requirements**

   - Qualification
   - Experience
   - Salary Range
   - Job Requirements

   **Step 3: Description**

   - Job Description
   - Benefits
   - Last Date to Apply

   **Step 4: Contact**

   - Contact Email
   - Contact Phone
   - External Apply Link (optional)

3. Preview check करें
4. "Publish Job" click करें

**Expected Results:**

- ✅ Job successfully create हो
- ✅ Job listing में दिखे
- ✅ Job detail page accessible हो

**API Test:**

```bash
curl -X POST http://localhost:8081/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Doctor",
    "organization": "ABC Hospital",
    "sector": "private",
    "category": "Doctor",
    "location": "Mumbai",
    "qualification": "MBBS",
    "experience": "5 years",
    "salaryMin": 50000,
    "salaryMax": 100000,
    "description": "Job description here",
    "lastDate": "2024-12-31"
  }'
```

**Test Cases:**

- ✅ Create job with all fields
- ✅ Create job with minimum fields
- ✅ Validation errors check
- ✅ Job preview functionality

---

#### Test 4.4: Manage Applications (Employer)

**Steps:**

1. Employer dashboard से "Applications" पर जाएं
2. Received applications list देखें
3. किसी application पर "View Details" click करें
4. Application status update करें:
   - Shortlisted
   - Rejected
   - Interview Scheduled
   - Hired

**Expected Results:**

- ✅ Applications list दिखे
- ✅ Status successfully update हो
- ✅ Candidate को notification मिले

**API Test:**

```bash
# Get Applications for Employer's Jobs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/applications

# Update Application Status
curl -X PUT http://localhost:8081/api/applications/{applicationId}/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED"
  }'
```

---

#### Test 4.5: Subscription Management

**Steps:**

1. Employer dashboard से "Subscription" या "Plans" पर जाएं
2. Subscription plans देखें:
   - Basic Plan - ₹999 (per post)
   - Monthly Plan - ₹4,999 (monthly)
   - Yearly Plan - ₹49,999 (yearly)
3. किसी plan पर "Choose Plan" click करें
4. Payment flow initiate करें

**Expected Results:**

- ✅ Plans properly display हों
- ✅ Plan selection काम करे
- ✅ Payment initiation message दिखे
- ✅ Transaction ID generate हो

**API Test:**

```bash
# Get All Plans (Public)
curl http://localhost:8081/api/subscriptions/plans

# Get Current Subscription
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/subscriptions/current

# Create Subscription
curl -X POST http://localhost:8081/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "paymentMethod": "razorpay"
  }'

# Payment History
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/subscriptions/payments/history
```

**Test Cases:**

- ✅ View all plans
- ✅ Select plan
- ✅ View current subscription
- ✅ Payment history
- ✅ Cancel subscription (if implemented)

---

### ✅ Phase 5: Admin Features Testing

#### Test 5.1: Admin Dashboard

**Steps:**

1. Admin account से login करें
2. Admin dashboard पर automatically redirect होना चाहिए

**Expected Results:**

- ✅ Dashboard load हो
- ✅ System statistics दिखें:
  - Total Users
  - Total Jobs
  - Total Applications
  - Active Subscriptions
- ✅ Quick actions available हों

---

#### Test 5.2: Job Management (Admin)

**Steps:**

1. Admin dashboard से "Job Management" पर जाएं
2. सभी jobs list देखें
3. Actions test करें:
   - **Create Job:** New job create करें
   - **Edit Job:** Existing job edit करें
   - **Delete Job:** Job delete करें
   - **Approve/Reject:** Job status change करें
   - **Feature Job:** Job को featured बनाएं

**Expected Results:**

- ✅ सभी jobs list में दिखें
- ✅ CRUD operations काम करें
- ✅ Status updates reflect हों

**API Test:**

```bash
# Get All Jobs (Admin)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8081/api/jobs

# Update Job
curl -X PUT http://localhost:8081/api/jobs/{jobId} \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE",
    "featured": true
  }'

# Delete Job
curl -X DELETE http://localhost:8081/api/jobs/{jobId} \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

#### Test 5.3: User Management (Admin)

**Steps:**

1. Admin dashboard से "User Management" पर जाएं
2. Users list देखें
3. Actions test करें:
   - **View User Details**
   - **Edit User**
   - **Deactivate User**
   - **Delete User**
   - **Change User Role**

**Expected Results:**

- ✅ सभी users list में दिखें
- ✅ User details properly display हों
- ✅ User management actions काम करें

---

#### Test 5.4: Employer Verification (Admin)

**Steps:**

1. Admin dashboard से "Employer Verification" पर जाएं
2. Pending verification requests देखें
3. किसी employer की documents review करें
4. Verification decision करें:
   - **Approve:** Employer verified हो जाए
   - **Reject:** Rejection reason provide करें

**Expected Results:**

- ✅ Pending verifications list दिखें
- ✅ Documents properly display हों
- ✅ Approval/rejection काम करे
- ✅ Employer को notification मिले

**API Test:**

```bash
# Get All Employers
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8081/api/employers

# Update Verification Status
curl -X PUT http://localhost:8081/api/employers/{employerId}/verification \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "VERIFIED",
    "remarks": "All documents verified"
  }'
```

---

#### Test 5.5: Application Management (Admin)

**Steps:**

1. Admin dashboard से "Applications" पर जाएं
2. सभी applications list देखें
3. Filters use करें:
   - By Job
   - By Status
   - By Date
4. Application details view करें
5. Application status update करें

**Expected Results:**

- ✅ सभी applications दिखें
- ✅ Filters काम करें
- ✅ Status updates successful हों

---

#### Test 5.6: News Management (Admin)

**Steps:**

1. Admin dashboard से "News Management" पर जाएं
2. News CRUD operations test करें:
   - **Create News:** New article create करें
   - **Edit News:** Existing article edit करें
   - **Delete News:** Article delete करें
   - **Publish/Unpublish:** Article status change करें

**Expected Results:**

- ✅ News list दिखे
- ✅ CRUD operations काम करें
- ✅ Published news public page पर दिखे

**API Test:**

```bash
# Get All News
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8081/api/news

# Create News
curl -X POST http://localhost:8081/api/news \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Medical Breakthrough",
    "content": "Article content here",
    "category": "Research",
    "published": true
  }'
```

---

#### Test 5.7: Fraud Reports Management (Admin)

**Steps:**

1. Admin dashboard से "Fraud Reports" पर जाएं
2. सभी fraud reports list देखें
3. Report details view करें
4. Report status update करें:
   - **Under Investigation**
   - **Resolved**
   - **Dismissed**

**Expected Results:**

- ✅ सभी reports दिखें
- ✅ Report details properly display हों
- ✅ Status updates काम करें

**API Test:**

```bash
# Get All Fraud Reports
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8081/api/fraud-reports

# Update Report Status
curl -X PUT http://localhost:8081/api/fraud-reports/{reportId} \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "adminNotes": "Issue resolved"
  }'
```

---

#### Test 5.8: Analytics Dashboard (Admin)

**Steps:**

1. Admin dashboard से "Analytics" पर जाएं
2. Analytics data देखें:
   - User statistics
   - Job statistics
   - Application statistics
   - Revenue statistics (if applicable)
   - Platform growth metrics

**Expected Results:**

- ✅ Analytics data properly display हो
- ✅ Charts/graphs render हों
- ✅ Data accurate हो

**API Test:**

```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8081/api/analytics
```

---

### ✅ Phase 6: Notification System Testing

#### Test 6.1: Notification Center

**Steps:**

1. Login करें (किसी भी role से)
2. Header में notification icon click करें
3. या `/notifications` पर जाएं

**Expected Results:**

- ✅ सभी notifications list में दिखें
- ✅ Unread count badge दिखे
- ✅ Notification types properly categorize हों

**API Test:**

```bash
# Get All Notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/notifications

# Get Unread Count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/notifications/unread-count
```

---

#### Test 6.2: Mark Notification as Read

**Steps:**

1. Notification center में किसी unread notification पर click करें
2. Notification read हो जाना चाहिए

**Expected Results:**

- ✅ Notification marked as read हो
- ✅ Unread count decrease हो
- ✅ Notification styling change हो

**API Test:**

```bash
# Mark as Read
curl -X PUT http://localhost:8081/api/notifications/{notificationId}/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark All as Read
curl -X POST http://localhost:8081/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Test 6.3: Notification Preferences

**Steps:**

1. Notification center में "Preferences" section पर जाएं
2. Preferences toggle करें:
   - Email notifications
   - SMS notifications
   - Push notifications
   - Job alerts
   - Application updates
3. "Save Preferences" click करें

**Expected Results:**

- ✅ Preferences successfully save हों
- ✅ Changes reflect हों

**API Test:**

```bash
# Get Preferences
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/notifications/preferences

# Update Preferences
curl -X PUT http://localhost:8081/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailEnabled": true,
    "smsEnabled": false,
    "pushEnabled": true,
    "jobAlertsEnabled": true
  }'
```

---

### ✅ Phase 7: Fraud Protection Testing

#### Test 7.1: Submit Fraud Report

**Steps:**

1. Login करें (किसी भी role से)
2. "Fraud Protection" या "Report Fraud" page पर जाएं
3. Fraud report form fill करें:
   - Report Type (Fake Job, Scam, etc.)
   - Job/Employer details
   - Description
   - Evidence (screenshots, etc.)
4. "Submit Report" click करें

**Expected Results:**

- ✅ Report successfully submit हो
- ✅ Success message दिखे
- ✅ Report ID receive हो

**API Test:**

```bash
curl -X POST http://localhost:8081/api/fraud-reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "FAKE_JOB",
    "jobId": 1,
    "description": "This job posting seems fraudulent",
    "evidence": "Screenshot URL or description"
  }'
```

---

#### Test 7.2: View Own Reports

**Steps:**

1. Fraud Protection page पर जाएं
2. "My Reports" section check करें

**Expected Results:**

- ✅ User की सभी submitted reports दिखें
- ✅ Report status दिखे

**API Test:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/fraud-reports
```

---

### ✅ Phase 8: Integration Testing

#### Test 8.1: End-to-End Job Application Flow

**Complete Flow:**

1. ✅ Employer registration और verification
2. ✅ Employer subscription purchase
3. ✅ Employer job posting
4. ✅ Candidate registration
5. ✅ Candidate job search और apply
6. ✅ Employer application review
7. ✅ Application status update
8. ✅ Candidate notification receive

**Expected Results:**

- ✅ सभी steps successfully complete हों
- ✅ Data properly flow हो
- ✅ Notifications properly send हों

---

#### Test 8.2: Subscription to Job Posting Flow

**Complete Flow:**

1. ✅ Employer registration
2. ✅ Employer verification
3. ✅ Subscription plan selection
4. ✅ Payment initiation
5. ✅ Job posting (subscription के बाद)
6. ✅ Job approval और publishing

**Expected Results:**

- ✅ Subscription properly activate हो
- ✅ Job posting limit check हो
- ✅ Job successfully post हो

---

### ✅ Phase 9: Error Handling & Edge Cases

#### Test 9.1: Invalid Input Testing

**Test Cases:**

- ✅ Empty form submissions
- ✅ Invalid email formats
- ✅ Weak passwords
- ✅ Missing required fields
- ✅ Invalid file types for uploads
- ✅ File size limits

**Expected Results:**

- ✅ Proper validation errors दिखें
- ✅ User-friendly error messages
- ✅ Form submission prevent हो

---

#### Test 9.2: Authentication Errors

**Test Cases:**

- ✅ Expired JWT token
- ✅ Invalid token
- ✅ Missing token
- ✅ Unauthorized access attempts

**Expected Results:**

- ✅ Proper error messages
- ✅ Redirect to login page
- ✅ Token refresh mechanism (if implemented)

---

#### Test 9.3: Network Errors

**Test Cases:**

- ✅ Backend not running
- ✅ Network timeout
- ✅ API errors (500, 404, etc.)

**Expected Results:**

- ✅ Proper error messages
- ✅ Graceful error handling
- ✅ User-friendly error display

---

### ✅ Phase 10: Performance Testing

#### Test 10.1: Page Load Times

**Test:**

- ✅ Homepage load time
- ✅ Job listing page load time
- ✅ Dashboard load time
- ✅ Large data sets handling

**Expected Results:**

- ✅ Pages load within acceptable time (< 3 seconds)
- ✅ Loading states properly show हों
- ✅ Pagination काम करे for large lists

---

#### Test 10.2: API Response Times

**Test:**

- ✅ API endpoint response times
- ✅ Database query performance
- ✅ File upload performance

**Expected Results:**

- ✅ APIs respond within acceptable time
- ✅ Database queries optimized हों

---

## 📊 Testing Summary Checklist

### Public Features

- [ ] HomePage
- [ ] Job Listing
- [ ] Job Detail
- [ ] Static Pages (About, FAQ, Privacy, Terms)
- [ ] News Page

### Authentication

- [ ] User Registration
- [ ] User Login
- [ ] Forgot Password
- [ ] Email Verification
- [ ] Get Current User

### Candidate Features

- [ ] Candidate Dashboard
- [ ] Apply for Job
- [ ] Application Tracking
- [ ] Job Alerts
- [ ] Saved Jobs
- [ ] Profile Management

### Employer Features

- [ ] Employer Registration
- [ ] Employer Verification
- [ ] Employer Dashboard
- [ ] Job Posting
- [ ] Manage Applications
- [ ] Subscription Management

### Admin Features

- [ ] Admin Dashboard
- [ ] Job Management
- [ ] User Management
- [ ] Employer Verification
- [ ] Application Management
- [ ] News Management
- [ ] Fraud Reports Management
- [ ] Analytics Dashboard

### Additional Features

- [ ] Notification System
- [ ] Fraud Protection
- [ ] Integration Flows
- [ ] Error Handling
- [ ] Performance

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Not Starting

**Solution:**

- Database connection check करें
- Port 8081 available है या नहीं check करें
- Maven dependencies properly install हों

### Issue 2: CORS Errors

**Solution:**

- Backend में CORS configuration check करें
- Frontend और backend ports match करें
- `application.yml` में allowed origins check करें

### Issue 3: Authentication Token Issues

**Solution:**

- Token properly store हो रहा है या नहीं check करें
- Token expiration time check करें
- Authorization header format correct है या नहीं verify करें

### Issue 4: Database Connection Errors

**Solution:**

- MySQL server running है या नहीं check करें
- Database credentials correct हैं या नहीं verify करें
- Database `medtech_db` exists है या नहीं check करें

### Issue 5: File Upload Issues

**Solution:**

- File size limits check करें (10MB max)
- File upload directory permissions check करें
- Multipart configuration check करें

---

## 📝 Testing Notes Template

हर test के लिए notes maintain करें:

```
Test ID: [Unique ID]
Feature: [Feature Name]
Date: [Date]
Tester: [Your Name]

Steps:
1. [Step 1]
2. [Step 2]
...

Expected: [Expected Result]
Actual: [Actual Result]
Status: [Pass/Fail]
Issues: [Any issues found]
Screenshots: [If applicable]
```

---

## 🎯 Next Steps After Testing

1. ✅ सभी test cases complete करें
2. ✅ Issues document करें
3. ✅ Bugs fix करें
4. ✅ Re-test fixed issues
5. ✅ Performance optimization (if needed)
6. ✅ Security testing
7. ✅ User acceptance testing (UAT)

---

## 📞 Support

अगर testing के दौरान कोई issue आए:

1. Backend logs check करें: `MedExJobUpdated/backend/logs/medexjob.log`
2. Frontend console में errors check करें
3. Network tab में API calls verify करें
4. Database में data verify करें

---

**Happy Testing! 🚀**
