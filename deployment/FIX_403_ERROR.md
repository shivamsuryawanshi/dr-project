# AI assisted development
# Fix 403 Forbidden Error - Step by Step

## 🔴 Problem
Getting 403 Forbidden errors on `/api/auth/register` endpoint.

## ✅ Solution Steps

### Step 1: Check Backend Logs

**VPS Web Terminal में:**

```bash
journalctl -u medexjob-backend -n 100 --no-pager
```

Look for CORS or security-related errors.

---

### Step 2: Verify SecurityConfig is Updated

```bash
grep -A 5 "OPTIONS" /opt/medexjob/backend/src/main/java/com/medexjob/security/SecurityConfig.java
```

Should show: `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`

---

### Step 3: Verify CORS Configuration

```bash
grep -A 5 "allowed-origins" /opt/medexjob/backend/src/main/resources/application-prod.yml
```

Should include: `http://72.62.196.181,http://medexjob.com,...`

---

### Step 4: Rebuild and Restart (Important!)

```bash
cd /opt/medexjob/backend
mvn clean package -DskipTests
systemctl restart medexjob-backend
systemctl status medexjob-backend
```

---

### Step 5: Test Backend Directly

```bash
curl -X OPTIONS http://localhost:8081/api/auth/register \
  -H "Origin: http://72.62.196.181" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return 200 OK with CORS headers.

---

### Step 6: Test Register Endpoint

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://72.62.196.181" \
  -d '{"email":"test@test.com","password":"test123","fullName":"Test User","phoneNumber":"1234567890","role":"CANDIDATE"}' \
  -v
```

---

## 🔧 Alternative: Temporarily Disable Security for Testing

If still not working, temporarily allow all requests:

**Edit SecurityConfig.java:**

```java
.authorizeHttpRequests(authz -> authz
    .anyRequest().permitAll()  // TEMPORARY - for testing only
)
```

**Then rebuild and restart.**

---

## ✅ Quick Fix Commands

```bash
# 1. Check logs
journalctl -u medexjob-backend -n 50

# 2. Rebuild
cd /opt/medexjob/backend && mvn clean package -DskipTests

# 3. Restart
systemctl restart medexjob-backend

# 4. Check status
systemctl status medexjob-backend

# 5. Test
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","fullName":"Test","phoneNumber":"123","role":"CANDIDATE"}'
```

---

**Start with Step 1 (check logs) to see what's actually happening!** 🚀

