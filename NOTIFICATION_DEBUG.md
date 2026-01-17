# AI assisted development

# Notification System - Debug Guide

## 🔍 **Common Issues & Solutions**

### **Issue 1: API Base URL Not Configured**
**Problem:** Frontend `/api` use kar raha hai but backend `http://localhost:8081/api` par hai

**Check:**
1. Frontend `.env` file mein `VITE_API_BASE=http://localhost:8081/api` set hai?
2. Vite proxy properly configured hai?

**Solution:**
- Vite config mein proxy already hai: `/api` → `http://127.0.0.1:8081`
- Agar direct API call karna hai, to `.env` file mein add karein:
  ```
  VITE_API_BASE=http://localhost:8081/api
  ```

---

### **Issue 2: CORS Error**
**Problem:** Browser console mein CORS error dikh raha hai

**Check:**
- Backend `SecurityConfig.java` mein CORS properly configured hai?
- Frontend URL allowed hai?

**Solution:**
- Backend already configured hai for `http://localhost:5173`

---

### **Issue 3: Authentication Token Missing**
**Problem:** API calls fail ho rahe hain with 401 Unauthorized

**Check:**
1. Browser console mein network tab check karein
2. Request headers mein `Authorization: Bearer TOKEN` hai?
3. Token valid hai?

**Solution:**
- Login karein aur token check karein
- `localStorage.getItem('token')` check karein

---

### **Issue 4: No Notifications Showing**
**Problem:** UI par "No notifications" dikh raha hai

**Check:**
1. Backend mein notifications create ho rahe hain?
2. Database mein notifications exist karte hain?
3. User ID match kar raha hai?

**Solution:**
- Test notification manually create karein
- Database check karein: `SELECT * FROM notifications WHERE user_id = 'USER_ID'`

---

### **Issue 5: Backend Not Running**
**Problem:** API calls fail ho rahe hain

**Check:**
- Backend running hai on port 8081?
- `http://localhost:8081/api/notifications` accessible hai?

**Solution:**
- Backend start karein: `mvn spring-boot:run`
- Health check: `http://localhost:8081/actuator/health`

---

## 🧪 **Step-by-Step Testing**

### **1. Check Backend is Running**
```bash
curl http://localhost:8081/actuator/health
```

### **2. Login and Get Token**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **3. Test Get Notifications**
```bash
curl -X GET "http://localhost:8081/api/notifications?page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### **4. Test Unread Count**
```bash
curl -X GET "http://localhost:8081/api/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### **5. Create Test Notification (Admin)**
```bash
curl -X POST http://localhost:8081/api/notifications/send \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "type": "application_update",
    "message": "Test notification"
  }'
```

---

## 🔧 **Frontend Debugging**

### **Browser Console Check:**
1. Open browser DevTools (F12)
2. Console tab check karein - koi errors?
3. Network tab check karein - API calls successful?
4. Check request/response headers

### **Common Console Errors:**
- `Failed to fetch` → Backend not running or CORS issue
- `401 Unauthorized` → Token missing or invalid
- `404 Not Found` → API endpoint wrong
- `500 Internal Server Error` → Backend error

---

## 📊 **Database Check**

### **Check Notifications Table:**
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

### **Check User Notifications:**
```sql
SELECT * FROM notifications WHERE user_id = 'USER_ID' ORDER BY created_at DESC;
```

### **Check Unread Count:**
```sql
SELECT COUNT(*) FROM notifications WHERE user_id = 'USER_ID' AND is_read = false;
```

---

## ✅ **Quick Fix Checklist**

- [ ] Backend running on port 8081
- [ ] Frontend running on port 5173
- [ ] User logged in with valid token
- [ ] Browser console mein no errors
- [ ] Network tab mein API calls successful
- [ ] Database mein notifications exist
- [ ] CORS properly configured
- [ ] API base URL correct

---

## 🚀 **Quick Test Script**

Browser console mein yeh run karein:

```javascript
// Check token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found' : 'Missing');

// Test API call
fetch('/api/notifications?page=0&size=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Notifications:', data))
.catch(err => console.error('Error:', err));
```

---

## 📝 **Next Steps**

1. Browser console check karein
2. Network tab check karein
3. Backend logs check karein
4. Database check karein
5. Test API calls manually

**Sab kuch check karne ke baad specific error batao, main fix kar dunga!** 🔧

