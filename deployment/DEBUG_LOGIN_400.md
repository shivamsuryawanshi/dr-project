# AI assisted development
# Debug 400 Error on Admin Login

## Step 1: Backend Logs Check करें

```powershell
# Real-time logs देखें (login try करते समय)
ssh root@72.62.196.181 "journalctl -u medexjob-backend -f"
```

या recent logs:

```powershell
ssh root@72.62.196.181 "journalctl -u medexjob-backend -n 100 --no-pager | grep -i 'login\|auth\|error\|exception'"
```

## Step 2: Database में User Verify करें

```powershell
ssh root@72.62.196.181 "mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e \"SELECT email, name, role, is_active, is_verified, LENGTH(password_hash) as pwd_length FROM users WHERE email = 'shivamsuryawanshi1000@gmail.com';\""
```

## Step 3: Test Login API Directly

```powershell
# VPS से directly test करें
ssh root@72.62.196.181 "curl -X POST http://localhost:8081/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"shivamsuryawanshi1000@gmail.com\",\"password\":\"shivam@123\"}' -v"
```

## Step 4: Check Password Hash Format

```powershell
# Password hash check करें (BCrypt format होना चाहिए - $2a$ या $2b$ से start होना चाहिए)
ssh root@72.62.196.181 "mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e \"SELECT email, LEFT(password_hash, 10) as hash_start FROM users WHERE email = 'shivamsuryawanshi1000@gmail.com';\""
```

## Step 5: Check Email Format in Database

```powershell
# Email exact match check करें (case sensitivity)
ssh root@72.62.196.181 "mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e \"SELECT email, BINARY email as exact_email FROM users WHERE email LIKE '%shivamsuryawanshi1000%';\""
```

## Common Issues:

1. **Password Hash Wrong Format**: BCrypt hash `$2a$10$...` format में होना चाहिए
2. **is_active = false**: User inactive है
3. **is_verified = false**: User email verified नहीं है
4. **Email Case Mismatch**: Database में email different case में हो सकता है
5. **Password Not Hashed**: Password plain text में हो सकता है

## Quick Fix Commands:

```powershell
# All checks in one
ssh root@72.62.196.181 "mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e \"
SELECT 
    email, 
    name, 
    role, 
    is_active, 
    is_verified,
    CASE 
        WHEN password_hash LIKE '\$2a\$%' OR password_hash LIKE '\$2b\$%' THEN 'BCrypt OK'
        ELSE 'WRONG FORMAT'
    END as hash_status,
    LENGTH(password_hash) as hash_length
FROM users 
WHERE email = 'shivamsuryawanshi1000@gmail.com';
\""
```

