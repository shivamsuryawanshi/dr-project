#!/bin/bash
# Test script for Employer Verification API
# Usage: ./test_verification_api.sh

API_BASE="http://localhost:8080/api"
EMPLOYER_ID="eb9a6ea6-ae43-428c-88c7-9f1c1d542e42"  # Replace with actual employer ID

echo "=== Testing Employer Verification API ==="
echo ""

# Step 1: Login as admin to get token
echo "Step 1: Login as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medexjob.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "✗ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✓ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test verification update
echo "Step 2: Testing verification update..."
STATUS="approved"
NOTES="Test verification via curl"

RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
  "$API_BASE/employers/$EMPLOYER_ID/verification?status=$STATUS&notes=$NOTES" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ Verification update successful!"
  echo ""
  echo "Response:"
  echo "$BODY" | jq .
else
  echo "✗ Verification update failed!"
  echo "HTTP Code: $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi

echo ""
echo "=== Test Complete ==="

