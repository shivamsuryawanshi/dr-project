# AI assisted development

# Forgot Password Testing Guide

## 🚀 Quick Start Commands

### Step 1: Start Backend

**Terminal 1 में:**
```bash
cd MedExJobUpdated/backend
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
🚀 MedExJob.com Backend Server is running!
📊 API Base: /api
🌐 Frontend: https://medexjob.com
```

**Backend URL:** `http://localhost:8081`

---

### Step 2: Start Frontend

**Terminal 2 में (नई terminal खोलें):**
```bash
cd MedExJobUpdated/frontend
npm install
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Frontend URL:** `http://localhost:5173`

---

## ✅ Testing Steps

### 1. Open Browser
```
http://localhost:5173/login
```

### 2. Click "Forgot password?" Link
- Login page पर "Forgot password?" link पर click करें
- `/forgot-password` page खुलेगा

### 3. Step 1: Enter Email
- Email address enter करें (जो database में registered है)
- "Send OTP" button click करें
- Backend OTP generate करेगा और email भेजेगा

### 4. Check Gmail
- Email inbox check करें: `shivamsuryawanshi51@gmail.com` से email आएगा
- Subject: "Password Reset OTP - MedExJob.com"
- 6-digit OTP note करें

### 5. Step 2: Enter OTP
- 6-digit OTP enter करें
- "Verify OTP" button click करें
- OTP verify होने पर Step 3 पर जाएगा

### 6. Step 3: Enter New Password
- New password enter करें (minimum 8 characters)
- Confirm password enter करें
- "Reset Password" button click करें
- Success message दिखेगा
- 3 seconds बाद automatically login page पर redirect होगा

### 7. Test Login
- New password से login करें
- Login successful होना चाहिए

---

## 🔍 Troubleshooting

### Backend Issues:

**Port 8081 already in use:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8081 | xargs kill -9
```

**Maven build fails:**
```bash
cd MedExJobUpdated/backend
mvn clean
mvn install -U
```

**Database connection error:**
- MySQL server check करें
- `application.yml` में credentials verify करें

### Frontend Issues:

**Port 5173 already in use:**
- Vite automatically next available port use करेगा
- Console में check करें कौन सा port use हो रहा है

**npm install fails:**
```bash
cd MedExJobUpdated/frontend
rm -rf node_modules package-lock.json
npm install
```

### Email Issues:

**OTP email नहीं आ रहा:**
1. **Backend logs check करें:**
   - Terminal में देखें: "OTP email sent successfully" message
   - या error message

2. **Gmail App Password verify करें:**
   - Gmail में 2-Step Verification enable होना चाहिए
   - App Password generate करें (not regular password)

3. **Spam folder check करें**

4. **Backend console में OTP print होगा:**
   ```
   OTP for user@example.com: 123456
   ```

**Email authentication error:**
- Gmail App Password सही है या नहीं verify करें
- `application.yml` में credentials double-check करें

---

## 📋 Checklist

- [ ] Backend running on port 8081
- [ ] Frontend running on port 5173
- [ ] Database connected
- [ ] User email exists in database
- [ ] Gmail credentials configured
- [ ] OTP email received
- [ ] OTP verification working
- [ ] Password reset successful
- [ ] Login with new password working

---

## 🧪 Manual API Testing (Optional)

### Test Forgot Password API:
```bash
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Test Verify OTP:
```bash
curl -X POST http://localhost:8081/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Test Reset Password:
```bash
curl -X POST http://localhost:8081/api/auth/reset-password-with-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456","newPassword":"NewPass123"}'
```

---

## 📝 Notes

1. **OTP Expiry:** 10 minutes
2. **Password Requirements:** Minimum 8 characters
3. **Email Delivery:** May take 10-30 seconds
4. **Backend Logs:** Check terminal for OTP if email doesn't arrive

---

**Happy Testing! 🎉**

