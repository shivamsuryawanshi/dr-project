# AI assisted development

# Subscription-Based Job Posting Implementation

## ✅ Completed Changes

### 1. Razorpay Credentials Updated
- **File:** `backend/src/main/resources/application.yml`
- **Changes:** Updated Razorpay test credentials:
  - Key ID: `rzp_test_S4URMphJWIwUfN`
  - Key Secret: `ZFejLMSKd0kBegzvEQZWrsBX`

### 2. Job Posting with Subscription Validation
- **File:** `backend/src/main/java/com/medexjob/controller/JobController.java`
- **Changes:**
  - Added subscription validation before job posting
  - Added job posting limit check based on subscription plan
  - Increment `jobPostsUsed` when job is posted
  - Associate job with authenticated employer (not admin dummy user)

## 🔒 Validation Logic

### For Employers:
1. **Authentication Check:** User must be logged in
2. **Role Check:** User must be EMPLOYER role
3. **Employer Profile Check:** Employer profile must exist
4. **Verification Check:** Employer must be verified (APPROVED status)
5. **Subscription Check:** Active subscription required
6. **Limit Check:** `jobPostsUsed < jobPostsAllowed`

### For Admins:
- Admins can bypass all subscription checks
- Can post jobs without subscription

## 📊 Subscription Plans & Limits

| Plan | Price | Duration | Job Posts Allowed |
|------|-------|----------|-------------------|
| Basic Plan | ₹999 | per post | 1 job post |
| Monthly Plan | ₹4,999 | monthly | 10 job posts |
| Yearly Plan | ₹49,999 | yearly | 120 job posts |

## 🔄 Job Posting Flow

```
1. Employer clicks "Post Job"
   ↓
2. Backend checks authentication
   ↓
3. Backend checks if user is EMPLOYER
   ↓
4. Backend checks employer verification status
   ↓
5. Backend checks for active subscription
   ↓
6. Backend checks job posting limit
   ↓
7. If all checks pass:
   - Create job
   - Associate with employer
   - Increment jobPostsUsed
   - Return success
   ↓
8. If any check fails:
   - Return error with appropriate message
   - Suggest redirect to subscription page
```

## 📝 API Response Examples

### Success Response:
```json
{
  "id": "job-uuid",
  "title": "Senior Doctor",
  "organization": "ABC Hospital",
  "status": "pending",
  ...
}
```

### Error Responses:

**No Subscription:**
```json
{
  "error": "No active subscription found. Please purchase a subscription plan to post jobs.",
  "redirectTo": "/subscription"
}
```

**Limit Reached:**
```json
{
  "error": "You have reached your job posting limit (1/1). Please upgrade your plan to post more jobs.",
  "redirectTo": "/subscription",
  "used": 1,
  "allowed": 1
}
```

**Not Verified:**
```json
{
  "error": "Your employer account is not verified. Please complete verification first."
}
```

## 🧪 Testing Steps

### Test Case 1: Employer Without Subscription
1. Register as EMPLOYER
2. Complete verification
3. Try to post job
4. **Expected:** Error message with redirect to subscription page

### Test Case 2: Employer With Basic Plan
1. Register as EMPLOYER
2. Complete verification
3. Purchase Basic Plan (₹999)
4. Post 1 job → **Success**
5. Try to post 2nd job → **Expected:** Limit reached error

### Test Case 3: Employer With Monthly Plan
1. Register as EMPLOYER
2. Complete verification
3. Purchase Monthly Plan (₹4,999)
4. Post jobs up to limit (10 jobs)
5. Try to post 11th job → **Expected:** Limit reached error

### Test Case 4: Admin Bypass
1. Login as ADMIN
2. Post job without subscription
3. **Expected:** Job posted successfully (no subscription check)

## 🔧 Backend Code Changes

### Added Imports:
```java
import com.medexjob.entity.Subscription;
import com.medexjob.repository.SubscriptionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDate;
```

### Modified `create()` Method:
- Added authentication check
- Added role validation (EMPLOYER or ADMIN)
- Added employer verification check
- Added subscription validation
- Added job posting limit check
- Increment `jobPostsUsed` after successful job creation
- Associate job with authenticated employer

## 📋 Next Steps (Frontend)

1. **Update EmployerDashboard:**
   - Check subscription status before enabling "Post Job" button
   - Show subscription status and remaining job posts
   - Redirect to subscription page if no active subscription

2. **Update JobPostingForm:**
   - Check subscription before showing form
   - Display subscription info (remaining posts)
   - Handle error responses from backend

3. **Add Subscription Status Display:**
   - Show current plan
   - Show used/allowed job posts
   - Show subscription expiry date

## 🐛 Error Handling

All errors return appropriate HTTP status codes:
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no subscription, limit reached, not verified)
- `404` - Not Found (user/employer not found)
- `500` - Internal Server Error

## ✅ Verification Checklist

- [x] Razorpay credentials updated
- [x] Subscription validation added
- [x] Job posting limit check implemented
- [x] Job posts counter increment implemented
- [x] Employer association implemented
- [x] Admin bypass implemented
- [x] Error messages added
- [ ] Frontend subscription check (TODO)
- [ ] Frontend error handling (TODO)
- [ ] Subscription status display (TODO)

---

**Note:** Frontend changes are still pending. The backend is fully functional and will return appropriate errors if subscription is missing or limit is reached.

