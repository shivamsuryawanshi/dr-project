# AI assisted development
# Final Fix for 404/403 Errors

## ✅ Good News!
Backend is working! The curl test showed 400 validation error, which means:
- ✅ Backend is running
- ✅ Endpoint `/api/auth/register` is accessible
- ✅ Security is allowing the request

## 🔴 Problem
Browser is getting 404/403, which means:
- ❌ Nginx proxy might not be working
- ❌ CORS might still be blocking
- ❌ Request might not be reaching backend through Nginx

## ✅ Solution Steps

### Step 1: Test Nginx Proxy

**VPS Web Terminal में:**

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://medexjob.com" \
  -d '{"name":"Test User","email":"test@test.com","phone":"1234567890","password":"test123","role":"CANDIDATE"}' \
  -v
```

**Check:**
- Should return 200 or 400 (not 404)
- Should have CORS headers in response

---

### Step 2: Check Nginx Configuration

```bash
cat /etc/nginx/sites-available/medexjob.com
```

**Verify:**
- `location /api` exists
- `proxy_pass http://backend;` is correct
- No typos in configuration

---

### Step 3: Test Backend Through Nginx

```bash
curl http://localhost/api/actuator/health
```

Should return: `{"status":"UP"}`

---

### Step 4: Check Nginx Error Logs

```bash
tail -f /var/log/nginx/error.log
```

Then try accessing the website in browser and see if errors appear.

---

### Step 5: Restart Nginx

```bash
nginx -t
systemctl restart nginx
systemctl status nginx
```

---

### Step 6: Check Backend CORS Logs

```bash
journalctl -u medexjob-backend -n 100 | grep -i cors
```

---

## 🔧 Quick Fix: Update Nginx Config

If Nginx proxy isn't working, update the config:

```bash
nano /etc/nginx/sites-available/medexjob.com
```

**Ensure `/api` location block looks like:**

```nginx
location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # CORS headers (if needed)
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

**Then:**
```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Test Commands

```bash
# 1. Test backend directly
curl http://localhost:8081/api/actuator/health

# 2. Test through Nginx
curl http://localhost/api/actuator/health

# 3. Test register endpoint through Nginx
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"123","password":"test123","role":"CANDIDATE"}'
```

---

**Start with Step 1 to test Nginx proxy!** 🚀

