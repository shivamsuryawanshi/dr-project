# AI assisted development

# Static/Mock Functionality in MedExJob Website

## 📋 Overview

This document lists all static, mock, and hardcoded functionality in the MedExJob website that needs to be converted to dynamic, database-driven implementations.

---

## 🎨 FRONTEND - Static/Mock Data

### 1. **ApplicationTracking Component**

**File:** `frontend/src/components/ApplicationTracking.tsx`

**Static Elements:**

- ✅ Uses `mockApplications` from `mockData.ts`
- ✅ Uses `mockJobs` from `mockData.ts`
- ✅ Creates `mockApplicationsWithJobs` array by combining mock data
- ❌ No real API calls to fetch applications
- ❌ Status updates are not persisted to backend
- ❌ Interview scheduling is not saved to database

**What Needs to be Done:**

- Replace mock data with API calls to `/api/applications`
- Implement real-time status updates
- Connect interview scheduling to backend
- Add proper error handling and loading states

---

### 2. **JobAlerts Component**

**File:** `frontend/src/components/JobAlerts.tsx`

**Static Elements:**

- ✅ `mockJobAlerts` array with 3 hardcoded alerts
- ✅ Alert creation/update/delete only updates local state
- ❌ No backend API integration
- ❌ Job matching logic is not implemented
- ❌ Alert notifications are not sent

**What Needs to be Done:**

- Create backend API endpoints for job alerts
- Implement job matching algorithm
- Add email/notification system for matched jobs
- Connect CRUD operations to backend

---

### 3. **FraudProtection Component**

**File:** `frontend/src/components/FraudProtection.tsx`

**Static Elements:**

- ✅ `mockFraudReports` array with 3 hardcoded reports
- ✅ Report creation only updates local state
- ✅ Admin actions (approve/reject) only update local state
- ❌ No backend API integration
- ❌ Reports are not persisted to database

**What Needs to be Done:**

- Create backend API endpoints for fraud reports
- Implement report submission and storage
- Add admin review workflow
- Connect status updates to backend

---

### 4. **NotificationCenter Component**

**File:** `frontend/src/components/NotificationCenter.tsx`

**Static Elements:**

- ✅ Uses `mockNotifications` from `mockData.ts`
- ✅ Notification preferences (email, SMS, push) only in local state
- ✅ Mark as read/delete only updates local state
- ❌ No real-time notifications
- ❌ No backend API integration
- ❌ Preferences are not saved

**What Needs to be Done:**

- Create backend API endpoints for notifications
- Implement real-time notification system (WebSocket/SSE)
- Add notification preferences persistence
- Connect read/unread status to backend

---

### 5. **SubscriptionPage Component**

**File:** `frontend/src/components/SubscriptionPage.tsx`

**Static Elements:**

- ✅ Uses `subscriptionPlans` from `mockData.ts` (3 hardcoded plans)
- ✅ Plan selection only shows alert, no actual subscription
- ✅ FAQ items are hardcoded in component
- ❌ No payment gateway integration
- ❌ No subscription management API
- ❌ No plan purchase functionality

**What Needs to be Done:**

- Create backend API for subscription plans
- Integrate payment gateway (Razorpay/PayPal)
- Implement subscription purchase flow
- Add subscription management (upgrade/downgrade/cancel)

---

### 6. **AnalyticsDashboard Component**

**File:** `frontend/src/components/AnalyticsDashboard.tsx`

**Static Elements:**

- ✅ `avgResponseTime = '2.3 days'` - hardcoded string
- ✅ `conversionRate = '12.5%'` - hardcoded string
- ✅ `recentActivity: any[] = []` - empty array
- ✅ Trending percentages (+12.5%, +8.3%, etc.) are hardcoded
- ❌ Time range filter doesn't affect backend queries
- ❌ Export Report button has no functionality

**What Needs to be Done:**

- Calculate avgResponseTime from actual application data
- Calculate conversionRate from job/application statistics
- Implement recent activity feed from database
- Add time range filtering to backend analytics API
- Implement report export functionality

---

### 7. **mockData.ts File**

**File:** `frontend/src/data/mockData.ts`

**Static Data:**

- ✅ `mockJobs` - 8 hardcoded job listings
- ✅ `mockApplications` - 3 hardcoded applications
- ✅ `mockCandidate` - 1 hardcoded candidate profile
- ✅ `mockEmployer` - 1 hardcoded employer profile
- ✅ `mockNotifications` - 3 hardcoded notifications
- ✅ `subscriptionPlans` - 3 hardcoded subscription plans

**What Needs to be Done:**

- Remove this file entirely
- Replace all imports with real API calls
- Ensure all components fetch data from backend

---

## ⚙️ BACKEND - Static/Hardcoded Functionality

### 1. **NewsController - Seed Data**

**File:** `backend/src/main/java/com/medexjob/controller/NewsController.java`

**Static Elements:**

- ✅ `@PostConstruct seedData()` method creates 10 hardcoded news items
- ✅ News items are created with fixed dates and content
- ❌ No admin API to create/update/delete news items
- ❌ News management is limited to seed data

**What Needs to be Done:**

- Add admin CRUD endpoints for news management
- Remove or make seed data optional
- Implement proper news creation/editing UI

---

### 2. **JobController - Dummy User Creation**

**File:** `backend/src/main/java/com/medexjob/controller/JobController.java`

**Static Elements:**

- ✅ `resolveOrCreateEmployer()` creates dummy users for admin-posted jobs
- ✅ Uses `dummy_password_hash` as placeholder password
- ✅ Creates users with email pattern: `admin+{companyName}@medexjob.com`
- ✅ Phone number set to `"0000000000"`
- ❌ Not a proper solution for production

**What Needs to be Done:**

- Implement proper employer selection for admin-posted jobs
- Create a system/admin user for admin postings
- Remove dummy user creation logic

---

### 3. **AuthService - Email Verification**

**File:** `backend/src/main/java/com/medexjob/service/AuthService.java`

**Static Elements:**

- ✅ `// TODO: Send email verification email (for production)` comment
- ❌ Email verification is not implemented
- ❌ No email sending functionality

**What Needs to be Done:**

- Implement email verification flow
- Integrate email service (SMTP/SendGrid)
- Add email verification token generation
- Add verification endpoint

---

### 4. **EmployerController - TODO Comment**

**File:** `backend/src/main/java/com/medexjob/controller/EmployerController.java`

**Static Elements:**

- ✅ `// TODO: Add custom query for filtering by status` comment
- ❌ Status filtering uses `findAll()` instead of optimized query

**What Needs to be Done:**

- Add custom repository method for status filtering
- Optimize query for better performance

---

### 5. **DataSeeder - Development Seed Data**

**File:** `backend/src/main/java/com/medexjob/config/DataSeeder.java`

**Static Elements:**

- ✅ Creates seed data for development/testing
- ✅ Controlled by `SEED_JOBS` environment variable
- ⚠️ Should be disabled in production

**What Needs to be Done:**

- Ensure `@Profile({"default","dev"})` is working
- Document that this should not run in production
- Consider removing or making it more configurable

---

## 🔌 MISSING BACKEND APIs

### 1. **Job Alerts API**

**Status:** ❌ Not Implemented

**Required Endpoints:**

```
POST   /api/job-alerts              - Create job alert
GET    /api/job-alerts              - Get user's job alerts
GET    /api/job-alerts/{id}         - Get specific alert
PUT    /api/job-alerts/{id}         - Update job alert
DELETE /api/job-alerts/{id}         - Delete job alert
POST   /api/job-alerts/match        - Match jobs with alerts (background job)
```

**Required Entities:**

- `JobAlert` entity with fields: keywords, locations, categories, sectors, salaryRange, experience, frequency, active

---

### 2. **Fraud Reports API**

**Status:** ❌ Not Implemented

**Required Endpoints:**

```
POST   /api/fraud-reports                    - Create fraud report
GET    /api/fraud-reports                    - Get fraud reports (admin only)
GET    /api/fraud-reports/{id}               - Get report details
PUT    /api/fraud-reports/{id}/status        - Update report status (admin)
PUT    /api/fraud-reports/{id}/priority      - Update priority (admin)
DELETE /api/fraud-reports/{id}               - Delete report (admin)
```

**Required Entities:**

- `FraudReport` entity with fields: type, jobId, employerId, reporterId, reason, description, status, priority, evidence, adminNotes

---

### 3. **Notifications API**

**Status:** ❌ Not Implemented

**Required Endpoints:**

```
GET    /api/notifications                    - Get user notifications
GET    /api/notifications/unread-count       - Get unread count
PUT    /api/notifications/{id}/read          - Mark as read
PUT    /api/notifications/read-all           - Mark all as read
DELETE /api/notifications/{id}                - Delete notification
GET    /api/notifications/preferences         - Get preferences
PUT    /api/notifications/preferences         - Update preferences
POST   /api/notifications/send               - Send notification (admin/system)
```

**Required Entities:**

- `Notification` entity with fields: userId, type, message, read, relatedJobId, relatedApplicationId, createdAt
- `NotificationPreferences` entity with fields: userId, emailEnabled, smsEnabled, pushEnabled

---

### 4. **Subscriptions API**

**Status:** ❌ Not Implemented

**Required Endpoints:**

```
GET    /api/subscriptions/plans               - Get subscription plans
POST   /api/subscriptions                    - Create subscription
GET    /api/subscriptions/current            - Get current subscription
PUT    /api/subscriptions/{id}                - Update subscription
POST   /api/subscriptions/{id}/cancel         - Cancel subscription
POST   /api/payments                          - Process payment
GET    /api/payments/history                  - Get payment history
```

**Required Entities:**

- `SubscriptionPlan` entity with fields: name, price, duration, jobPostsAllowed, features
- `Subscription` entity with fields: userId, planId, startDate, endDate, status, autoRenew
- `Payment` entity with fields: userId, subscriptionId, amount, status, transactionId, paymentMethod

---

### 5. **Analytics API Enhancements**

**Status:** ⚠️ Partially Implemented

**Missing Endpoints:**

```
GET    /api/analytics/response-time?timeRange={range}  - Get avg response time
GET    /api/analytics/conversion-rate?timeRange={range} - Get conversion rate
GET    /api/analytics/recent-activity?timeRange={range}  - Get recent activity
GET    /api/analytics/trends?metric={metric}&timeRange={range} - Get trends
POST   /api/analytics/export?format={format}            - Export analytics report
```

**Current Implementation:**

- ✅ Basic analytics endpoints exist
- ❌ Time range filtering not implemented
- ❌ Response time calculation missing
- ❌ Conversion rate calculation missing
- ❌ Recent activity feed missing

---

## 📊 PRIORITY MATRIX

### 🔴 **HIGH PRIORITY** (Critical for Core Functionality)

1. **ApplicationTracking** - Users need to track their applications
2. **NotificationCenter** - Users need real-time updates
3. **Job Alerts API** - Core feature for job matching
4. **Fraud Reports API** - Important for platform safety

### 🟡 **MEDIUM PRIORITY** (Important for Business)

5. **Subscription Management** - Revenue generation
6. **Analytics Enhancements** - Business insights
7. **News Management API** - Content management

### 🟢 **LOW PRIORITY** (Nice to Have)

8. **Dummy User Creation Fix** - Technical debt
9. **Email Verification** - Security enhancement
10. **Data Seeder Cleanup** - Code quality

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Frontend Tasks

- [ ] Remove `mockData.ts` file
- [ ] Replace all `mockApplications` with API calls
- [ ] Replace all `mockJobs` with API calls
- [ ] Replace all `mockNotifications` with API calls
- [ ] Replace all `mockJobAlerts` with API calls
- [ ] Replace all `mockFraudReports` with API calls
- [ ] Replace `subscriptionPlans` with API calls
- [ ] Implement real-time notifications (WebSocket/SSE)
- [ ] Add payment gateway integration
- [ ] Calculate dynamic analytics metrics
- [ ] Add proper error handling and loading states

### Backend Tasks

- [ ] Create `JobAlert` entity and repository
- [ ] Create `FraudReport` entity and repository
- [ ] Create `Notification` entity and repository
- [ ] Create `SubscriptionPlan` entity and repository
- [ ] Create `Subscription` entity and repository
- [ ] Create `Payment` entity and repository
- [ ] Implement Job Alerts API endpoints
- [ ] Implement Fraud Reports API endpoints
- [ ] Implement Notifications API endpoints
- [ ] Implement Subscriptions API endpoints
- [ ] Implement Payment processing
- [ ] Add email service integration
- [ ] Fix dummy user creation in JobController
- [ ] Add admin news management endpoints
- [ ] Enhance Analytics API with time range filtering
- [ ] Add response time calculation
- [ ] Add conversion rate calculation
- [ ] Add recent activity feed

### Integration Tasks

- [ ] Connect frontend components to new APIs
- [ ] Add authentication/authorization to new endpoints
- [ ] Implement real-time updates
- [ ] Add proper error handling
- [ ] Add loading states
- [ ] Add data validation
- [ ] Add logging and monitoring

---

## 📝 NOTES

1. **Mock Data File**: The `mockData.ts` file should be completely removed once all components are connected to real APIs.

2. **Backward Compatibility**: When removing mock data, ensure all components have proper fallback states for when APIs fail.

3. **Testing**: After converting static data to dynamic, thoroughly test all functionality to ensure nothing breaks.

4. **Performance**: Consider implementing caching for frequently accessed data like subscription plans and job alerts.

5. **Real-time Updates**: Consider using WebSockets or Server-Sent Events (SSE) for notifications and job alerts.

---

## 🔗 RELATED FILES

### Frontend Files with Static Data:

- `frontend/src/data/mockData.ts` - Main mock data file
- `frontend/src/components/ApplicationTracking.tsx`
- `frontend/src/components/JobAlerts.tsx`
- `frontend/src/components/FraudProtection.tsx`
- `frontend/src/components/NotificationCenter.tsx`
- `frontend/src/components/SubscriptionPage.tsx`
- `frontend/src/components/AnalyticsDashboard.tsx`

### Backend Files with Static/Hardcoded Logic:

- `backend/src/main/java/com/medexjob/controller/NewsController.java`
- `backend/src/main/java/com/medexjob/controller/JobController.java`
- `backend/src/main/java/com/medexjob/service/AuthService.java`
- `backend/src/main/java/com/medexjob/controller/EmployerController.java`
- `backend/src/main/java/com/medexjob/config/DataSeeder.java`

---

**Last Updated:** 2026-01-16
**Status:** Analysis Complete - Ready for Implementation
