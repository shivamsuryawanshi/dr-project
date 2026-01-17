# AI assisted development
# Forgot Password - Complete Steps Guide

## User: sulikhiya@gmail.com (Candidate)

## Step-by-Step Process:

### Step 1: User Clicks "Forgot password?"
- Dialog opens
- User enters email: `sulikhiya@gmail.com`
- Clicks "Send OTP"

### Step 2: Backend Process
- Backend receives request at `/api/auth/forgot-password`
- Checks if user exists and is active
- Generates 6-digit OTP
- Saves OTP in database with 10-minute expiration
- Sends OTP via email

### Step 3: User Receives OTP
- Check email inbox
- Check spam folder
- OTP email subject: "Password Reset OTP - MedExJob.com"

### Step 4: User Enters OTP
- User enters 6-digit OTP in dialog
- Clicks "Verify OTP"
- Backend verifies OTP

### Step 5: User Sets New Password
- User enters new password (min 8 characters)
- Confirms password
- Clicks "Reset Password"
- Backend updates password

### Step 6: Login with New Password
- User logs in with new password

---

## Testing Commands:

### 1. Check User Status:
```bash
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, role, is_active, is_verified FROM users WHERE email = 'sulikhiya@gmail.com';"
```

### 2. Test Forgot Password API:
```bash
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"sulikhiya@gmail.com"}' \
  -v
```

### 3. Check OTP Generated:
```bash
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, otp, otp_expires FROM users WHERE email = 'sulikhiya@gmail.com';"
```

### 4. Test Verify OTP:
```bash
# Replace YOUR_OTP with actual OTP from database
curl -X POST http://localhost:8081/api/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"sulikhiya@gmail.com","otp":"YOUR_OTP"}' \
  -v
```

### 5. Test Reset Password:
```bash
# Replace YOUR_OTP with actual OTP
curl -X POST http://localhost:8081/api/auth/reset-password-with-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"sulikhiya@gmail.com","otp":"YOUR_OTP","newPassword":"NewPassword123"}' \
  -v
```

---

## Common Issues:

1. **OTP Email Not Received**: Check SMTP configuration
2. **OTP Expired**: Request new OTP (10 minutes validity)
3. **Invalid OTP**: Check database for correct OTP
4. **User Not Found**: Verify email in database

---

## Email Configuration Check:

```bash
grep -A 10 'mail:' /opt/medexjob/backend/src/main/resources/application-prod.yml
```

---

## Backend Logs (Real-time):

```bash
journalctl -u medexjob-backend -f
```


