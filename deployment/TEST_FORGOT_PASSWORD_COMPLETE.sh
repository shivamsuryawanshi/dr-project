# AI assisted development
#!/bin/bash

# Complete Test for Forgot Password Functionality

EMAIL="sulikhiya@gmail.com"

echo "=========================================="
echo "Testing Forgot Password for Candidate"
echo "=========================================="
echo ""

# Step 1: Check if user exists
echo "=== Step 1: Check User in Database ==="
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, name, role, is_active, is_verified FROM users WHERE email = '$EMAIL';"

echo ""
echo "=== Step 2: Test Forgot Password API ==="
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\"}" \
  -v

echo ""
echo ""
echo "=== Step 3: Check OTP in Database ==="
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, otp, otp_expires FROM users WHERE email = '$EMAIL';"

echo ""
echo ""
echo "=== Step 4: Check Backend Logs ==="
journalctl -u medexjob-backend -n 30 --no-pager | grep -i "forgot\|otp\|email\|mail\|error" | tail -10


