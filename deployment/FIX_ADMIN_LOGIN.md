# AI assisted development
# Fix Admin Login Issue

## Problem:
Admin user database में है लेकिन login नहीं हो रहा (400 error)

## Possible Issues:
1. `is_verified = false` - User email verified नहीं है
2. `is_active = false` - User inactive है
3. Password hash mismatch - Password सही नहीं है
4. Email case sensitivity issue

## Solution Steps:

### Step 1: Database में Admin User Check करें

VPS पर SSH करें और MySQL में जाएं:

```bash
ssh root@72.62.196.181
mysql -u medexjob_user -p medtech_db
```

फिर SQL commands run करें:

```sql
-- Admin users देखें
SELECT id, name, email, role, is_active, is_verified 
FROM users 
WHERE role = 'ADMIN';

-- Specific email check करें
SELECT id, name, email, role, is_active, is_verified 
FROM users 
WHERE email = 'shivamsuryawanshi1000@gmail.com';
```

### Step 2: Admin User Fix करें

अगर `is_active = false` या `is_verified = false` है:

```sql
UPDATE users 
SET is_active = true, is_verified = true 
WHERE email = 'shivamsuryawanshi1000@gmail.com' AND role = 'ADMIN';
```

### Step 3: Password Reset करें (अगर जरूरत हो)

Backend में password reset API use करें या manually BCrypt hash generate करें।

### Step 4: Backend Logs Check करें

```bash
ssh root@72.62.196.181 "journalctl -u medexjob-backend -n 100 --no-pager | grep -i 'login\|auth\|error'"
```

## Quick Fix Script:

```bash
# VPS पर run करें
ssh root@72.62.196.181

# MySQL में जाएं
mysql -u medexjob_user -p medtech_db << EOF
UPDATE users 
SET is_active = true, is_verified = true 
WHERE role = 'ADMIN';
SELECT email, role, is_active, is_verified FROM users WHERE role = 'ADMIN';
EOF
```

