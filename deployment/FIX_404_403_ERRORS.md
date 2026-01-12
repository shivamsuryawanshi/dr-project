# AI assisted development

# Fix 404 and 403 Errors - Step by Step

## 🔴 Problem

- 404 Not Found on `/api/auth/register`
- 403 Forbidden errors

## ✅ Solution Steps

### Step 1: Check Backend is Running

**VPS Web Terminal में:**

```bash
systemctl status medexjob-backend
curl http://localhost:8081/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test","fullName":"Test","phoneNumber":"123","role":"CANDIDATE"}' -v
```

---

### Step 2: Check Nginx Proxy Configuration

```bash
cat /etc/nginx/sites-available/medexjob.com | grep -A 10 "location /api"
```

**Should show:**

```nginx
location /api {
    proxy_pass http://backend;
    ...
}
```

---

### Step 3: Test Nginx Proxy

```bash
curl http://localhost/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test","fullName":"Test","phoneNumber":"123","role":"CANDIDATE"}' -v
```

---

### Step 4: Check Backend Logs

```bash
journalctl -u medexjob-backend -n 50 --no-pager
```

Look for:

- Route mapping errors
- Security filter errors
- CORS errors

---

### Step 5: Verify SecurityConfig

```bash
grep -A 3 "requestMatchers.*auth" /opt/medexjob/backend/src/main/java/com/medexjob/security/SecurityConfig.java
```

**Should show:**

```java
.requestMatchers("/api/auth/**").permitAll()
```

---

### Step 6: Check Application Context Path

```bash
grep -i "context-path\|server.servlet.context-path" /opt/medexjob/backend/src/main/resources/application-prod.yml
```

If context-path is set, it might be causing routing issues.

---

### Step 7: Restart Services

```bash
systemctl restart medexjob-backend
systemctl restart nginx
systemctl status medexjob-backend
systemctl status nginx
```

---

## 🔧 Quick Fix Commands

```bash
# 1. Check backend
systemctl status medexjob-backend
curl http://localhost:8081/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test","fullName":"Test","phoneNumber":"123","role":"CANDIDATE"}'

# 2. Check nginx
nginx -t
cat /etc/nginx/sites-available/medexjob.com | grep -A 10 "/api"

# 3. Check logs
journalctl -u medexjob-backend -n 50

# 4. Restart
systemctl restart medexjob-backend && systemctl restart nginx
```

---

**Start with Step 1 to see what's actually happening!** 🚀
