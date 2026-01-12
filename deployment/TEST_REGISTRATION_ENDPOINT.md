# AI assisted development
# Registration Endpoint Test करें

## ✅ Backend Running Successfully!

Backend successfully running है:
- ✅ "Started MedexjobBackendApplication"
- ✅ "Tomcat started on port(s): 8081"
- ✅ Database connection successful

---

## Step 1: Registration Endpoint Test करें

VPS Web Terminal में:

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://medexjob.com" \
  -d '{"name":"Test User","email":"test403@test.com","phone":"1234567890","password":"test123","role":"CANDIDATE"}' \
  -v 2>&1 | grep -E "HTTP|403|200|400|CORS|error"
```

**Expected:**
- ✅ HTTP status: 200 या 400 (NOT 403)
- ✅ No CORS errors

---

## Step 2: HTTPS Test (Through Nginx)

```bash
curl -X POST https://medexjob.com/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://medexjob.com" \
  -d '{"name":"Test User 2","email":"test403-2@test.com","phone":"1234567891","password":"test123","role":"CANDIDATE"}' \
  -v 2>&1 | grep -E "HTTP|403|200|400|CORS|error"
```

**Expected:**
- ✅ HTTP status: 200 या 400 (NOT 403)
- ✅ No CORS errors

---

## Step 3: Browser Test

1. Open: `https://medexjob.com/register`
2. Hard refresh: `Ctrl + Shift + R`
3. Fill registration form
4. Open Developer Tools (F12) → Console tab
5. Check for errors

**Expected:**
- ✅ No 403 errors
- ✅ No CORS errors
- ✅ Registration successful

---

## 🔍 Health Endpoint Issue (Optional Fix)

Health endpoint 500 error दे रहा है। यह optional है, लेकिन अगर fix करना चाहते हैं:

```bash
# Actuator endpoint check करें
curl -X GET http://localhost:8081/actuator/health -v
```

**Note:** `/api/actuator/health` के बजाय `/actuator/health` try करें।

---

**Follow Steps 1-3 to verify the 403 error is fixed!** 🚀

