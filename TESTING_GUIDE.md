# Testing Guide - Dynamic Functionality

## Overview

यह guide उन सभी dynamic functionalities को test करने के लिए है जो अब तक implement की गई हैं。

> **📋 Complete Testing Guide:** सभी functionality के लिए detailed step-by-step testing guide देखने के लिए [COMPLETE_STEP_BY_STEP_TESTING_GUIDE.md](./COMPLETE_STEP_BY_STEP_TESTING_GUIDE.md) file देखें। वह guide में सभी features, API endpoints, और test cases detailed हैं।

## Completed Dynamic Features

### 1. ✅ ApplicationTracking Component

### 2. ✅ NotificationCenter Component

### 3. ✅ JobAlerts Component

### 4. ✅ FraudProtection Component

### 5. ✅ SubscriptionPage Component

---

## Pre-Testing Setup

### Backend Setup:

```bash
cd MedExJobUpdated/backend
./mvnw clean build
# या Windows पर:
mvnw.cmd clean build
```

### Database:

- Database tables automatically create होंगी जब backend start होगा
- Subscription plans automatically seed होंगे (DataSeeder में)

### Frontend Setup:

```bash
cd MedExJobUpdated/frontend
npm install
npm run dev
```

---

## Testing Steps

### 1. SubscriptionPage Component Testing

#### Test Case 1.1: View Subscription Plans

1. Frontend को open करें
2. Subscription page पर navigate करें
3. **Expected**: 3 subscription plans दिखने चाहिए:
   - Basic Plan - ₹999 (per post)
   - Monthly Plan - ₹4,999 (monthly)
   - Yearly Plan - ₹49,999 (yearly)

#### Test Case 1.2: API Endpoint Test (Public)

```bash
# GET /api/subscriptions/plans
curl http://localhost:8080/api/subscriptions/plans
```

**Expected Response:**

```json
{
  "plans": [
    {
      "id": "...",
      "name": "Basic Plan",
      "price": 999.0,
      "duration": "per post",
      "jobPostsAllowed": 1,
      "features": [...]
    },
    ...
  ]
}
```

#### Test Case 1.3: Select Plan (Login Required)

1. Login करें (employer account)
2. Subscription page पर जाएं
3. किसी plan पर "Choose Plan" button click करें
4. **Expected**:
   - Payment initiation message दिखे
   - Transaction ID generate हो
   - Alert message show हो

#### Test Case 1.4: Get Current Subscription (Authenticated)

```bash
# Login करके token लें, फिर:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/subscriptions/current
```

**Expected**:

- अगर subscription है तो details return हो
- अगर नहीं है तो `{"subscription": null}`

#### Test Case 1.5: Payment History

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/subscriptions/payments/history
```

---

### 2. ApplicationTracking Component Testing

#### Test Case 2.1: View Applications

1. Login करें (candidate या employer)
2. Application Tracking page पर जाएं
3. **Expected**:
   - User की सभी applications list में दिखें
   - Loading state दिखे (initially)
   - Job details के साथ application cards

#### Test Case 2.2: Update Application Status (Employer Only)

1. Employer account से login करें
2. Application Tracking page पर जाएं
3. किसी application पर "Update Status" click करें
4. Status update करें (e.g., "Shortlisted")
5. **Expected**: Status successfully update हो

---

### 3. NotificationCenter Component Testing

#### Test Case 3.1: View Notifications

1. Login करें
2. Notification Center page पर जाएं
3. **Expected**:
   - सभी notifications list में दिखें
   - Unread count badge दिखे

#### Test Case 3.2: Mark as Read

1. किसी unread notification पर click करें
2. **Expected**: Notification read हो जाए

#### Test Case 3.3: Notification Preferences

1. Notification preferences section में जाएं
2. Preferences toggle करें
3. **Expected**: Preferences save हों

---

### 4. JobAlerts Component Testing

#### Test Case 4.1: View Job Alerts

1. Login करें
2. Job Alerts page पर जाएं
3. **Expected**: User की सभी job alerts दिखें

#### Test Case 4.2: Create Job Alert

1. "Create Alert" button click करें
2. Alert details fill करें (keywords, location, category, etc.)
3. Save करें
4. **Expected**: New alert create हो और list में दिखे

#### Test Case 4.3: Toggle Alert Status

1. किसी alert का toggle switch click करें
2. **Expected**: Alert active/inactive हो जाए

---

### 5. FraudProtection Component Testing

#### Test Case 5.1: Submit Fraud Report

1. Login करें
2. Fraud Protection page पर जाएं
3. Fraud report form fill करें
4. Submit करें
5. **Expected**: Report successfully submit हो

#### Test Case 5.2: View Fraud Reports (Admin Only)

1. Admin account से login करें
2. Fraud reports list देखें
3. **Expected**: सभी reports दिखें

---

## API Endpoints Summary

### Subscription Endpoints:

- `GET /api/subscriptions/plans` - Public (no auth required)
- `GET /api/subscriptions/current` - Authenticated
- `POST /api/subscriptions` - Authenticated
- `PUT /api/subscriptions/{id}` - Authenticated
- `POST /api/subscriptions/{id}/cancel` - Authenticated
- `POST /api/subscriptions/payments` - Authenticated
- `GET /api/subscriptions/payments/history` - Authenticated

### Application Endpoints:

- `GET /api/applications` - Authenticated
- `POST /api/applications` - Authenticated
- `PUT /api/applications/{id}/status` - Authenticated (Employer/Admin)

### Notification Endpoints:

- `GET /api/notifications` - Authenticated
- `GET /api/notifications/unread-count` - Authenticated
- `PUT /api/notifications/{id}/read` - Authenticated
- `POST /api/notifications/read-all` - Authenticated
- `GET /api/notifications/preferences` - Authenticated
- `PUT /api/notifications/preferences` - Authenticated

### Job Alert Endpoints:

- `GET /api/job-alerts` - Authenticated
- `POST /api/job-alerts` - Authenticated
- `PUT /api/job-alerts/{id}` - Authenticated
- `DELETE /api/job-alerts/{id}` - Authenticated
- `POST /api/job-alerts/{id}/toggle-active` - Authenticated

### Fraud Report Endpoints:

- `POST /api/fraud-reports` - Authenticated
- `GET /api/fraud-reports` - Authenticated
- `GET /api/fraud-reports/{id}` - Authenticated
- `PUT /api/fraud-reports/{id}` - Admin only
- `DELETE /api/fraud-reports/{id}` - Admin only

---

## Common Issues & Solutions

### Issue 1: "Failed to fetch subscription plans"

**Solution**:

- Backend running है या नहीं check करें
- Database connection check करें
- DataSeeder ने plans seed किए हैं या नहीं check करें

### Issue 2: "Unauthorized" errors

**Solution**:

- Login करके valid JWT token लें
- Token को Authorization header में `Bearer TOKEN` format में send करें

### Issue 3: Empty lists

**Solution**:

- Database में data है या नहीं check करें
- User ID correct है या नहीं verify करें

### Issue 4: CORS errors

**Solution**:

- Backend में CORS configuration check करें
- Frontend और backend ports correct हैं या नहीं verify करें

---

## Database Verification

### Check Subscription Plans:

```sql
SELECT * FROM subscription_plans;
```

**Expected**: 3 rows (Basic, Monthly, Yearly)

### Check Subscriptions:

```sql
SELECT * FROM subscriptions;
```

### Check Payments:

```sql
SELECT * FROM payments;
```

---

## Next Steps After Testing

1. ✅ सभी features test करें
2. ✅ Errors fix करें (अगर कोई हैं)
3. ✅ Performance check करें
4. ✅ Remaining static functionalities को dynamic बनाएं

---

## Notes

- Payment gateway (Razorpay) integration अभी basic structure है
- Production में Razorpay SDK integrate करना होगा
- Webhook endpoint को properly implement करना होगा
- Subscription plans को admin panel से manage करने की facility add कर सकते हैं
