# AI assisted development
# Debug Commands for MedExJob Deployment Issues

## Issues Found:
1. 400 Error on `/api/auth/login`
2. 401 Errors on `/api/applications`
3. Routing error: `/dashboard/candidate` not matching

## Debug Commands:

### 1. Check Backend Service Status
```bash
ssh root@72.62.196.181 "systemctl status medexjob-backend"
```

### 2. View Recent Backend Logs
```bash
ssh root@72.62.196.181 "journalctl -u medexjob-backend -n 100 --no-pager"
```

### 3. Test Login API Directly
```bash
ssh root@72.62.196.181 "curl -X POST http://localhost:8081/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}'"
```

### 4. Check Nginx Configuration
```bash
ssh root@72.62.196.181 "nginx -t"
ssh root@72.62.196.181 "cat /etc/nginx/sites-available/medexjob.com | grep -A 20 'location /api'"
```

### 5. Test Backend API from VPS
```bash
ssh root@72.62.196.181 "curl http://localhost:8081/api/jobs/ping"
```

### 6. Check if Backend is Listening on Port 8081
```bash
ssh root@72.62.196.181 "netstat -tlnp | grep 8081"
```

### 7. Check CORS Configuration in Backend
```bash
ssh root@72.62.196.181 "grep -r 'cors' /opt/medexjob/backend/src/main/java/com/medexjob/config/"
```

### 8. View Real-time Backend Logs
```bash
ssh root@72.62.196.181 "journalctl -u medexjob-backend -f"
```

### 9. Check Application Properties
```bash
ssh root@72.62.196.181 "cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 5 cors"
```

### 10. Test API from Browser Console
Open browser console and run:
```javascript
fetch('https://medexjob.com/api/jobs/ping')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

