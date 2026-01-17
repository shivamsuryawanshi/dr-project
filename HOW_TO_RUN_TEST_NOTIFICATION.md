# AI assisted development

# Test Notification Kaise Run Karein - Step by Step Guide

## 🚀 **Method 1: Browser Console (Easiest)**

### **Step 1: Browser Console Open Karein**
1. Browser mein `/notifications` page par jayein
2. **F12** key press karein (ya right-click → Inspect)
3. **Console** tab select karein

### **Step 2: Code Copy Karein**
Yeh code copy karein:

```javascript
fetch('/api/notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Test notification created:', data);
  window.location.reload();
})
.catch(err => console.error('❌ Error:', err));
```

### **Step 3: Code Run Karein**
1. Console mein code paste karein
2. **Enter** press karein
3. Wait karein - notification create hoga
4. Page automatically refresh hoga
5. Notification dikhna chahiye! 🎉

---

## 🎯 **Method 2: One Line Command (Quick)**

Console mein yeh single line run karein:

```javascript
fetch('/api/notifications/test', {method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}}).then(r => r.json()).then(d => {console.log('✅ Created:', d); window.location.reload();});
```

---

## 📸 **Visual Steps:**

### **Step 1:**
```
1. Browser open karein
2. localhost:5173/notifications par jayein
3. F12 press karein
```

### **Step 2:**
```
1. Console tab click karein
2. Code paste karein
3. Enter press karein
```

### **Step 3:**
```
1. Console mein "✅ Test notification created" dikhega
2. Page automatically refresh hoga
3. Notification dikhna chahiye!
```

---

## 🔍 **Expected Console Output:**

**Success Case:**
```
✅ Test notification created: {
  id: "uuid-here",
  userId: "your-user-id",
  type: "application_update",
  message: "🧪 Test notification - System is working correctly!",
  read: false,
  createdAt: "2026-01-17T..."
}
```

**Error Case:**
```
❌ Error: Failed to fetch...
```

---

## 🛠️ **Troubleshooting:**

### **Issue 1: "Unauthorized" Error**
**Solution:**
- Login karein phir se
- Token check karein: `localStorage.getItem('token')`

### **Issue 2: "Failed to fetch" Error**
**Solution:**
- Backend running hai? `http://localhost:8081`
- Network tab check karein

### **Issue 3: Notification Create Ho Gaya But UI Mein Nahi Dikha**
**Solution:**
- Page manually refresh karein (F5)
- Console mein notifications fetch karein:
  ```javascript
  fetch('/api/notifications?page=0&size=10', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  }).then(r => r.json()).then(d => console.log('Notifications:', d));
  ```

---

## ✅ **Quick Checklist:**

- [ ] Browser console open hai (F12)
- [ ] Console tab selected hai
- [ ] User logged in hai
- [ ] Token available hai
- [ ] Code paste kiya
- [ ] Enter press kiya
- [ ] Success message dikha
- [ ] Page refresh hua
- [ ] Notification dikha

---

## 🎉 **After Running:**

Agar notification create ho gaya, to:
- ✅ System working hai
- ✅ Database connection working hai
- ✅ API endpoints working hain
- ✅ Frontend properly connected hai

**Ab real events (job apply, status update) par bhi notifications automatically create honge!** 🚀

