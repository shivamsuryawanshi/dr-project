#!/bin/bash
# AI assisted development
# Complete Notification System Test Script
# Bash script with CURL commands to test all notification endpoints

echo "========================================"
echo "NOTIFICATION SYSTEM TEST - CURL COMMANDS"
echo "========================================"
echo ""

BASE_URL="http://localhost:8081/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Make sure backend is running on http://localhost:8081${NC}"
echo ""

# ============================================
# STEP 1: Login as Candidate
# ============================================
echo -e "${CYAN}STEP 1: Login as Candidate${NC}"
echo "----------------------------------------"

CANDIDATE_LOGIN='{"email":"candidate@test.com","password":"password123"}'

echo "Request: POST ${BASE_URL}/auth/login"
echo "Body: $CANDIDATE_LOGIN"
echo ""

CANDIDATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "$CANDIDATE_LOGIN")

CANDIDATE_TOKEN=$(echo $CANDIDATE_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
CANDIDATE_USER_ID=$(echo $CANDIDATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CANDIDATE_TOKEN" ]; then
  echo -e "${GREEN}✅ Candidate logged in successfully${NC}"
  echo "Token: ${CANDIDATE_TOKEN:0:20}..."
  echo "User ID: $CANDIDATE_USER_ID"
  echo ""
else
  echo -e "${RED}❌ Candidate login failed. Please register first.${NC}"
  echo ""
  echo "To register candidate, use:"
  echo "curl -X POST ${BASE_URL}/auth/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Candidate\",\"email\":\"candidate@test.com\",\"password\":\"password123\",\"phone\":\"1234567890\",\"role\":\"CANDIDATE\"}'"
  echo ""
  exit 1
fi

# ============================================
# STEP 2: Login as Employer
# ============================================
echo -e "${CYAN}STEP 2: Login as Employer${NC}"
echo "----------------------------------------"

EMPLOYER_LOGIN='{"email":"employer@test.com","password":"password123"}'

EMPLOYER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "$EMPLOYER_LOGIN")

EMPLOYER_TOKEN=$(echo $EMPLOYER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
EMPLOYER_USER_ID=$(echo $EMPLOYER_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$EMPLOYER_TOKEN" ]; then
  echo -e "${GREEN}✅ Employer logged in successfully${NC}"
  echo "Token: ${EMPLOYER_TOKEN:0:20}..."
  echo "User ID: $EMPLOYER_USER_ID"
  echo ""
else
  echo -e "${RED}❌ Employer login failed. Please register first.${NC}"
  echo ""
  exit 1
fi

# ============================================
# STEP 3: Get Candidate Notifications (Before)
# ============================================
echo -e "${CYAN}STEP 3: Get Candidate Notifications (Before)${NC}"
echo "----------------------------------------"

CANDIDATE_NOTIFICATIONS_BEFORE=$(curl -s -X GET "${BASE_URL}/notifications?page=0&size=10" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json")

UNREAD_COUNT_BEFORE=$(curl -s -X GET "${BASE_URL}/notifications/unread-count" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2)

echo -e "${YELLOW}Candidate has ${UNREAD_COUNT_BEFORE:-0} unread notifications${NC}"
echo ""

# ============================================
# STEP 4: Get Employer Notifications (Before)
# ============================================
echo -e "${CYAN}STEP 4: Get Employer Notifications (Before)${NC}"
echo "----------------------------------------"

EMPLOYER_UNREAD_COUNT_BEFORE=$(curl -s -X GET "${BASE_URL}/notifications/unread-count" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2)

echo -e "${YELLOW}Employer has ${EMPLOYER_UNREAD_COUNT_BEFORE:-0} unread notifications${NC}"
echo ""

# ============================================
# STEP 5: Get a Job ID (for application)
# ============================================
echo -e "${CYAN}STEP 5: Get a Job ID for Testing${NC}"
echo "----------------------------------------"

JOBS_RESPONSE=$(curl -s -X GET "${BASE_URL}/jobs?page=0&size=1" \
  -H "Content-Type: application/json")

TEST_JOB_ID=$(echo $JOBS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$TEST_JOB_ID" ]; then
  echo -e "${GREEN}✅ Found job: $TEST_JOB_ID${NC}"
  echo ""
else
  echo -e "${RED}❌ No jobs found. Please create a job first.${NC}"
  echo ""
  exit 1
fi

# ============================================
# STEP 6: Candidate Applies for Job
# ============================================
echo -e "${CYAN}STEP 6: Candidate Applies for Job${NC}"
echo "----------------------------------------"
echo "This should create:"
echo "  1. Notification to Employer: 'New application received'"
echo "  2. Notification to Candidate: 'Application submitted successfully'"
echo ""

APPLY_BODY="{\"jobId\":\"$TEST_JOB_ID\",\"candidateName\":\"Test Candidate\",\"candidateEmail\":\"candidate@test.com\",\"candidatePhone\":\"1234567890\",\"notes\":\"Test application\"}"

echo "Request: POST ${BASE_URL}/applications"
echo "Body: $APPLY_BODY"
echo ""

APPLY_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/applications" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$APPLY_BODY")

HTTP_STATUS=$(echo "$APPLY_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
APPLY_BODY_RESPONSE=$(echo "$APPLY_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  APPLICATION_ID=$(echo $APPLY_BODY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Application submitted successfully!${NC}"
  echo "Application ID: $APPLICATION_ID"
  echo ""
  
  # Wait for notifications
  sleep 2
  
  # Check notifications
  echo "Checking notifications after application..."
  UNREAD_COUNT_AFTER=$(curl -s -X GET "${BASE_URL}/notifications/unread-count" \
    -H "Authorization: Bearer $CANDIDATE_TOKEN" \
    -H "Content-Type: application/json" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2)
  
  if [ "$UNREAD_COUNT_AFTER" -gt "${UNREAD_COUNT_BEFORE:-0}" ]; then
    echo -e "${GREEN}✅ Candidate received new notification!${NC}"
    echo "New unread count: $UNREAD_COUNT_AFTER (was ${UNREAD_COUNT_BEFORE:-0})"
  fi
  
  EMPLOYER_UNREAD_COUNT_AFTER=$(curl -s -X GET "${BASE_URL}/notifications/unread-count" \
    -H "Authorization: Bearer $EMPLOYER_TOKEN" \
    -H "Content-Type: application/json" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2)
  
  if [ "$EMPLOYER_UNREAD_COUNT_AFTER" -gt "${EMPLOYER_UNREAD_COUNT_BEFORE:-0}" ]; then
    echo -e "${GREEN}✅ Employer received new notification!${NC}"
    echo "New unread count: $EMPLOYER_UNREAD_COUNT_AFTER (was ${EMPLOYER_UNREAD_COUNT_BEFORE:-0})"
  fi
  
  echo ""
else
  echo -e "${RED}❌ Application submission failed${NC}"
  echo "Response: $APPLY_BODY_RESPONSE"
  echo ""
fi

# ============================================
# STEP 7: View All Notifications
# ============================================
echo -e "${CYAN}STEP 7: View All Notifications${NC}"
echo "----------------------------------------"

echo -e "${YELLOW}Candidate Notifications:${NC}"
curl -s -X GET "${BASE_URL}/notifications?page=0&size=5" \
  -H "Authorization: Bearer $CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" | python -m json.tool 2>/dev/null || echo "Install python for JSON formatting"
echo ""

echo -e "${YELLOW}Employer Notifications:${NC}"
curl -s -X GET "${BASE_URL}/notifications?page=0&size=5" \
  -H "Authorization: Bearer $EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" | python -m json.tool 2>/dev/null || echo "Install python for JSON formatting"
echo ""

# ============================================
# STEP 8: Update Application Status (if admin available)
# ============================================
echo -e "${CYAN}STEP 8: Update Application Status to SHORTLISTED${NC}"
echo "----------------------------------------"
echo "This should create notification to Candidate: 'Application shortlisted'"
echo ""

if [ -n "$APPLICATION_ID" ]; then
  # Try to login as admin
  ADMIN_LOGIN='{"email":"admin@test.com","password":"admin123"}'
  ADMIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "$ADMIN_LOGIN")
  
  ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -n "$ADMIN_TOKEN" ]; then
    STATUS_UPDATE='{"status":"SHORTLISTED","notes":"Candidate has been shortlisted"}'
    
    echo "Request: PUT ${BASE_URL}/applications/$APPLICATION_ID/status"
    echo "Body: $STATUS_UPDATE"
    echo ""
    
    UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "${BASE_URL}/applications/$APPLICATION_ID/status" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$STATUS_UPDATE")
    
    HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
      echo -e "${GREEN}✅ Application status updated to SHORTLISTED!${NC}"
      echo ""
      
      sleep 2
      
      # Check candidate notifications
      FINAL_UNREAD_COUNT=$(curl -s -X GET "${BASE_URL}/notifications/unread-count" \
        -H "Authorization: Bearer $CANDIDATE_TOKEN" \
        -H "Content-Type: application/json" | grep -o '"unreadCount":[0-9]*' | cut -d':' -f2)
      
      echo -e "${GREEN}✅ Candidate unread notifications: ${FINAL_UNREAD_COUNT:-0}${NC}"
    else
      echo -e "${RED}❌ Status update failed${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️ Admin login failed. Skipping status update test.${NC}"
  fi
fi

echo ""
echo "========================================"
echo "TEST COMPLETE"
echo "========================================"
echo ""
echo -e "${YELLOW}To view all notifications manually:${NC}"
echo "  Candidate: curl -H 'Authorization: Bearer $CANDIDATE_TOKEN' ${BASE_URL}/notifications"
echo "  Employer: curl -H 'Authorization: Bearer $EMPLOYER_TOKEN' ${BASE_URL}/notifications"
echo ""

