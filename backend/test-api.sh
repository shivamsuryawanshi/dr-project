#!/bin/bash
# API Testing Script for MedExJob Backend
# Run this after starting the server with: mvn spring-boot:run

BASE_URL="http://localhost:8081/api"

echo "=========================================="
echo "MedExJob Backend API Testing"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -X GET "$BASE_URL/actuator/health" -w "\nStatus: %{http_code}\n" 2>/dev/null || echo "Health endpoint not available (this is OK)"
echo ""

# Test 2: Jobs List (Public)
echo "2. Testing Jobs List (Public Endpoint)..."
curl -X GET "$BASE_URL/jobs?page=0&size=5" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | head -50
echo ""

# Test 3: Jobs Meta (Public)
echo "3. Testing Jobs Meta (Categories & Locations)..."
curl -X GET "$BASE_URL/jobs/meta" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 4: News (Public)
echo "4. Testing News Endpoint..."
curl -X GET "$BASE_URL/news/homepage" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  | head -30
echo ""

# Test 5: Applications (Requires Auth - should return 401)
echo "5. Testing Applications Endpoint (Should require auth)..."
curl -X GET "$BASE_URL/applications?page=0&size=5" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 6: Auth - Register (Public)
echo "6. Testing Registration Endpoint..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#",
    "role": "CANDIDATE"
  }' \
  -w "\nStatus: %{http_code}\n"
echo ""

# Test 7: Auth - Login (Public)
echo "7. Testing Login Endpoint..."
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "Note: For authenticated endpoints, you need to:"
echo "1. Register a user (or use existing credentials)"
echo "2. Login to get a JWT token"
echo "3. Use the token in Authorization header:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' ..."
echo ""

