# AI assisted development
# Update All Configurations to Use https://medexjob.com

## ✅ Step 1: Update Backend CORS (VPS Web Terminal)

```bash
nano /opt/medexjob/backend/src/main/resources/application-prod.yml
```

**CORS section update करें:**

```yaml
cors:
  allowed-origins: https://medexjob.com,https://www.medexjob.com,http://medexjob.com,http://www.medexjob.com,http://72.62.196.181
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

## ✅ Step 2: Rebuild Backend

```bash
cd /opt/medexjob/backend
mvn clean package -DskipTests
systemctl restart medexjob-backend
```

---

## ✅ Step 3: Update Frontend Environment (Local Machine)

**Windows PowerShell में:**

```powershell
cd "D:\chrome download\MedExJobUpdated\frontend"
echo "VITE_API_BASE=https://medexjob.com/api" > .env.production
```

---

## ✅ Step 4: Rebuild Frontend

```powershell
npm run build
```

---

## ✅ Step 5: Upload Frontend

```powershell
scp -r dist/* root@72.62.196.181:/var/www/medexjob/
```

---

## ✅ Step 6: Update Nginx Configuration (VPS Web Terminal)

```bash
nano /etc/nginx/sites-available/medexjob.com
```

**Ensure HTTPS configuration is correct:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name medexjob.com www.medexjob.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Frontend and API
server {
    listen 443 ssl http2;
    server_name medexjob.com www.medexjob.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/medexjob.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medexjob.com/privkey.pem;
    
    root /var/www/medexjob;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

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
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save और reload:**

```bash
nginx -t
systemctl reload nginx
```

---

## ✅ Step 7: Setup SSL Certificate (If Not Done)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d medexjob.com -d www.medexjob.com
```

---

## ✅ Step 8: Verify Everything

**Test HTTPS:**

```bash
curl https://medexjob.com
```

**Check backend:**

```bash
curl https://medexjob.com/api/actuator/health
```

---

## 📝 Summary of Changes

1. ✅ Backend CORS: Added `https://medexjob.com`
2. ✅ Frontend API Base: `https://medexjob.com/api`
3. ✅ Nginx: HTTPS configuration
4. ✅ SSL Certificate: Setup with Certbot

---

## 🎯 Final URLs

- **Frontend:** https://medexjob.com
- **Backend API:** https://medexjob.com/api
- **Health Check:** https://medexjob.com/api/actuator/health

---

**Follow steps 1-8 in order!** 🚀


