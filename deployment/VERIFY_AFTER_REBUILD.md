# AI assisted development
# Backend Rebuild के बाद Verification Steps

## ✅ Build Status: SUCCESS

Build successful है! अब next steps:

---

## Step 1: Backend Restart करें

```bash
systemctl restart medexjob-backend
sleep 3
systemctl status medexjob-backend
```

**Expected Output:**
```
● medexjob-backend.service - MedExJob Backend Service
   Loaded: loaded (/etc/systemd/system/medexjob-backend.service; enabled; vendor preset: enabled)
   Active: active (running) since ...
```

---

## Step 2: Logs Check करें

```bash
journalctl -u medexjob-backend -n 50 --no-pager | tail -30
```

**Look for:**
- ✅ "Started MedexjobBackendApplication"
- ✅ "Tomcat started on port(s): 8081"
- ✅ No CORS errors
- ✅ No exceptions

---

## Step 3: Direct Backend Test

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://medexjob.com" \
  -d '{"name":"Test User","email":"test403@test.com","phone":"1234567890","password":"test123","role":"CANDIDATE"}' \
  -v 2>&1 | grep -E "HTTP|403|200|400|CORS"
```

**Expected:**
- ✅ HTTP status: 200 या 400 (NOT 403)
- ✅ No CORS errors

---

## Step 4: HTTPS Test (Through Nginx)

```bash
curl -X POST https://medexjob.com/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://medexjob.com" \
  -d '{"name":"Test User 2","email":"test403-2@test.com","phone":"1234567891","password":"test123","role":"CANDIDATE"}' \
  -v 2>&1 | grep -E "HTTP|403|200|400|CORS"
```

**Expected:**
- ✅ HTTP status: 200 या 400 (NOT 403)
- ✅ No CORS errors

---

## Step 5: Browser Test

1. Open: `https://medexjob.com/register`
2. Hard refresh: `Ctrl + Shift + R` (Windows) या `Cmd + Shift + R` (Mac)
3. Try to register
4. Open Developer Tools (F12) → Console tab
5. Check for errors

**Expected:**
- ✅ No 403 errors
- ✅ No CORS errors
- ✅ Registration form works

---

## ✅ Verification Checklist

- [ ] Backend service restarted successfully
- [ ] Service status shows "active (running)"
- [ ] Logs show "Started MedexjobBackendApplication"
- [ ] Direct backend test returns 200/400 (not 403)
- [ ] HTTPS test returns 200/400 (not 403)
- [ ] Browser test shows no 403 errors

---

## 🚨 If Still Getting 403:

### Check CORS Configuration:

```bash
# Verify application-prod.yml
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 5 "cors:"
```

**Should show:**
```yaml
cors:
  allowed-origins: https://medexjob.com,https://www.medexjob.com,http://medexjob.com,http://www.medexjob.com,http://72.62.196.181
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### Check SecurityConfig.java:

```bash
# Verify SecurityConfig.java has latest code
grep -A 5 "allowAllOrigins" /opt/medexjob/backend/src/main/java/com/medexjob/security/SecurityConfig.java
```

---

**Follow Steps 1-5 to verify everything is working!** 🚀

