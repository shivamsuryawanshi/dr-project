# AI assisted development
#!/bin/bash

# Test Forgot Password API

echo "Testing Forgot Password API..."
echo ""

# Test 1: Check if endpoint is accessible
echo "=== Test 1: Endpoint Check ==="
curl -X POST http://localhost:8081/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"shivamsuryawanshi1000@gmail.com"}' \
  -v

echo ""
echo ""
echo "=== Test 2: Check Backend Logs ==="
journalctl -u medexjob-backend -n 20 --no-pager | grep -i "forgot\|otp\|email\|error"

echo ""
echo ""
echo "=== Test 3: Check Email Configuration ==="
grep -A 5 'mail:' /opt/medexjob/backend/src/main/resources/application-prod.yml | head -10


