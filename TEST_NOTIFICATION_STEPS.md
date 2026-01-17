# AI assisted development

# Test Notification - Step by Step Guide (Hindi)

## 🎯 **Sabse Aasaan Tarika:**

### **Step 1: Browser Console Open Karein**
1. Browser mein `/notifications` page par jayein
2. **F12** key press karein
3. **Console** tab click karein

### **Step 2: Code Copy Karein**
Yeh code copy karein (sabse neeche wala simple wala):

```javascript
fetch('/api/notifications/test', {method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}}).then(r => r.json()).then(d => {console.log('✅ Created:', d); setTimeout(() => window.location.reload(), 1000);}).catch(e => console.error('❌ Error:', e));
```

### **Step 3: Code Run Karein**
1. Console mein code paste karein
2. **Enter** press karein
3. Wait karein 1-2 seconds
4. Page automatically refresh hoga
5. Notification dikhna chahiye! 🎉

---

## 📸 **Visual Guide:**

```
┌─────────────────────────────────────┐
│  Browser Window                     │
│  ┌───────────────────────────────┐  │
│  │ localhost:5173/notifications  │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Notifications Page]               │
│                                     │
│  Press F12 → Console Tab           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Developer Tools                    │
│  ┌───────────────────────────────┐  │
│  │ Console Tab                   │  │
│  │                               │  │
│  │ > [Paste Code Here]           │  │
│  │   [Press Enter]               │  │
│  │                               │  │
│  │ ✅ Created: {...}             │  │
│  │ 🔄 Refreshing...              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ✅ **Expected Result:**

### **Console Output:**
```
✅ Created: {
  id: "uuid-here",
  userId: "your-user-id",
  type: "application_update",
  message: "🧪 Test notification - System is working correctly!",
  read: false,
  createdAt: "2026-01-17T..."
}
```

### **UI Result:**
- Page refresh hoga
- Notification dikhna chahiye
- Unread count 1 ho jayega
- Total count 1 ho jayega

---

## 🔍 **Agar Error Aaye:**

### **Error 1: "Unauthorized"**
```
❌ Error: Failed to fetch unread count (401): Unauthorized
```
**Solution:**
- Login karein phir se
- Token check: `localStorage.getItem('token')`

### **Error 2: "Failed to fetch"**
```
❌ Error: Failed to fetch...
```
**Solution:**
- Backend running hai? Check: `http://localhost:8081`
- Network tab mein request check karein

### **Error 3: "User not found"**
```
❌ Error: User not found
```
**Solution:**
- Login karein phir se
- Valid user se login karein

---

## 🚀 **Quick Test (Copy-Paste Ready):**

### **Method 1: Simple (Recommended)**
```javascript
fetch('/api/notifications/test', {method: 'POST', headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json'}}).then(r => r.json()).then(d => {console.log('✅ Created:', d); setTimeout(() => window.location.reload(), 1000);}).catch(e => console.error('❌ Error:', e));
```

### **Method 2: Detailed (With Logs)**
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

---

## 📋 **Checklist:**

- [ ] Browser console open hai (F12)
- [ ] Console tab selected hai
- [ ] User logged in hai
- [ ] Code paste kiya
- [ ] Enter press kiya
- [ ] Success message dikha
- [ ] Page refresh hua
- [ ] Notification UI mein dikha

---

## 🎉 **After Success:**

Agar notification create ho gaya, to:
- ✅ System working hai
- ✅ Database connection working hai
- ✅ API endpoints working hain
- ✅ Frontend properly connected hai

**Ab real events (job apply, status update) par bhi notifications automatically create honge!** 🚀

---

## 💡 **Tip:**

Agar multiple notifications test karni ho, to code ko multiple times run karein. Har baar naya notification create hoga!

