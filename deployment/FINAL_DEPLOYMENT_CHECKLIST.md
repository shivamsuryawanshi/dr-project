# AI assisted development

# Final Deployment Checklist - Complete Guide

## ✅ Final Steps to Complete Deployment

### Step 1: Upload Updated Config to VPS

**Windows PowerShell में:**

```powershell
cd "D:\chrome download\MedExJobUpdated"
scp backend/application-prod.yml root@72.62.196.181:/opt/medexjob/backend/src/main/resources/
```

---

### Step 2: Backend Rebuild and Restart

**VPS Web Terminal में:**

```bash
cd /opt/medexjob/backend
mvn clean package -DskipTests
systemctl restart medexjob-backend
systemctl status medexjob-backend
```

---

### Step 3: Verify All Services

```bash
# Check backend
systemctl status medexjob-backend
curl http://localhost:8081/api/actuator/health

# Check nginx
systemctl status nginx
nginx -t

# Check mysql
systemctl status mysql
```

---

### Step 4: Test Website

**Browser में:**

1. **HTTPS Test:**

   - `https://medexjob.com` खोलें
   - Hard refresh: `Ctrl + Shift + R`

2. **Test Registration:**

   - Register page पर जाएं
   - Test user register करें
   - Check console for errors (F12)

3. **Test Login:**
   - Login page पर जाएं
   - Login try करें

---

### Step 5: Final Verification Checklist

- [ ] Backend service running
- [ ] Nginx service running
- [ ] MySQL service running
- [ ] Website loads at `https://medexjob.com`
- [ ] No console errors in browser
- [ ] Registration works
- [ ] Login works
- [ ] API calls successful
- [ ] SSL certificate valid (green lock icon)

---

## 🎯 Your Live Website URLs

- **Frontend:** https://medexjob.com
- **Backend API:** https://medexjob.com/api
- **Health Check:** https://medexjob.com/api/actuator/health

---

## 📝 Important Notes

1. **Email Configuration:** Make sure Gmail App Password is set correctly
2. **Database:** All data is stored in MySQL `medtech_db`
3. **File Uploads:** Stored in `/opt/medexjob/uploads`
4. **Logs:** Backend logs at `/opt/medexjob/backend/logs/medexjob.log`

---

## 🔧 Useful Commands for Future

### View Backend Logs:

```bash
journalctl -u medexjob-backend -f
```

### Restart Backend:

```bash
systemctl restart medexjob-backend
```

### Restart Nginx:

```bash
systemctl restart nginx
```

### Database Backup:

```bash
mysqldump -u medexjob_user -p medtech_db > backup_$(date +%Y%m%d).sql
```

---

## 🎉 Deployment Complete!

Your website is now live at **https://medexjob.com**!

---

**Follow Steps 1-4 to complete the deployment!** 🚀
