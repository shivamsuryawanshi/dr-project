# AI assisted development
# Debug Forgot Password Functionality

## Issues to Check:

### 1. Browser Console Errors
Open browser console (F12) and check for:
- API call errors
- CORS errors
- Network errors

### 2. Backend Logs Check

VPS terminal में run करें:

```bash
# Real-time logs (forgot password try करते समय)
journalctl -u medexjob-backend -f
```

या recent logs:

```bash
journalctl -u medexjob-backend -n 100 --no-pager | grep -i "forgot\|otp\|email\|mail"
```

### 3. Direct API Test

```bash
# Test forgot password API
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"shivamsuryawanshi1000@gmail.com"}' \
  -v
```

### 4. Email Configuration Check

```bash
# Check email settings
grep -A 10 'mail:' /opt/medexjob/backend/src/main/resources/application-prod.yml
```

### 5. Check if User Exists

```bash
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, is_active, is_verified FROM users WHERE email = 'shivamsuryawanshi1000@gmail.com';"
```

## Common Issues:

1. **Email Service Not Working**: SMTP configuration issue
2. **User Not Found**: Email doesn't exist in database
3. **CORS Error**: Frontend can't call backend API
4. **Dialog Not Opening**: Frontend JavaScript error


