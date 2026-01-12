# AI assisted development
# Complete Nginx Configuration - Final Version

## ✅ Current Configuration Status

आपका current configuration **mostly correct** है, लेकिन एक improvement add कर सकते हैं:

---

## 🔧 Complete Nginx Configuration

```nginx
upstream backend {
    server localhost:8081;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name medexjob.com www.medexjob.com;
    
    # Handle API requests before redirect (optional but recommended)
    location /api {
        return 301 https://$server_name$request_uri;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Frontend and API
server {
    listen 443 ssl http2;
    server_name medexjob.com www.medexjob.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/medexjob.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/medexjob.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Root directory for frontend
    root /var/www/medexjob;
    index index.html;
    
    # Client body size limit (for file uploads)
    client_max_body_size 10M;
    
    # Frontend routes - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Backend API proxy
    location /api {
        # Handle CORS preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' '3600' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' '0';
            return 204;
        }
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
    gzip_comp_level 6;
}
```

---

## 📝 Key Improvements Added:

1. ✅ **SSL Session Cache** - Better performance
2. ✅ **Client Max Body Size** - For file uploads (10MB)
3. ✅ **Proxy Buffering Off** - Better for real-time requests
4. ✅ **Strict Transport Security** - Security header
5. ✅ **HTTP API Redirect** - Handles API requests on HTTP

---

## ✅ Your Current Config is Good!

आपका current configuration **working है**, लेकिन ये improvements add कर सकते हैं (optional):

- SSL session cache
- Client max body size
- Proxy buffering settings
- Strict Transport Security header

---

## 🚀 Next Steps:

1. **Save current file:** `Ctrl+X`, `Y`, `Enter`
2. **Test configuration:**
```bash
nginx -t
```
3. **Reload Nginx:**
```bash
systemctl reload nginx
```
4. **Test website:**
```bash
curl -X POST https://medexjob.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"123","password":"test123","role":"CANDIDATE"}'
```

---

**आपका current config correct है! Optional improvements add कर सकते हैं.** ✅

