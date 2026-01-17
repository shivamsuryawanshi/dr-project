# AI assisted development

# Test Notification - Quick Guide

## ✅ **Test Notification Endpoint Added!**

Ab aap easily test notification create kar sakte ho!

---

## 🧪 **How to Test:**

### **Method 1: Browser Console (Easiest)**

Browser console mein yeh run karein (F12 → Console):

```javascript
// Get your token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Create test notification
fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Test notification created:', data);
  // Refresh notifications page
  window.location.reload();
})
.catch(err => console.error('❌ Error:', err));
```

---

### **Method 2: Using curl (Terminal)**

```bash
# First, login and get token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Copy the token from response, then:
curl -X POST http://localhost:8081/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

### **Method 3: Postman/Thunder Client**

1. **URL:** `POST http://localhost:8081/api/notifications/test`
2. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN`
   - `Content-Type: application/json`
3. **Body:** Empty (no body needed)
4. **Send**

---

## 📊 **Expected Response:**

```json
{
  "id": "uuid-here",
  "userId": "your-user-id",
  "type": "application_update",
  "message": "🧪 Test notification - System is working correctly!",
  "read": false,
  "createdAt": "2026-01-17T..."
}
```

---

## ✅ **After Creating Test Notification:**

1. Browser console mein notification create hoga
2. `/notifications` page refresh karein
3. Ab notification dikhna chahiye! 🎉

---

## 🔍 **Check Backend Logs:**

Backend console mein yeh dikhna chahiye:
```
✅ Test notification created for user: <user-id>
```

---

## 🚀 **Quick Steps:**

1. **Login karein** (agar nahi logged in ho)
2. **Browser console open karein** (F12)
3. **Yeh code run karein:**
   ```javascript
   fetch('/api/notifications/test', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`,
       'Content-Type': 'application/json'
     }
   }).then(r => r.json()).then(d => {
     console.log('✅ Created:', d);
     window.location.reload();
   });
   ```
4. **Notifications page refresh karein**
5. **Notification dikhna chahiye!** ✅

---

## 🎯 **Next Steps:**

Agar test notification create ho gaya, to:
- ✅ System working hai
- ✅ Database connection working hai
- ✅ API endpoints working hain

Agar phir bhi notifications nahi dikh rahe, to:
- Browser console check karein
- Network tab check karein
- Backend logs check karein

**Ab test karein aur batao kya hua!** 🚀

