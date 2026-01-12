# AI assisted development
# SecurityConfig.java को सही Location में Move करें

## 🔴 Problem

`SecurityConfig.java` file `/opt/medexjob/backend` में upload हुई है, लेकिन सही path है:
`/opt/medexjob/backend/src/main/java/com/medexjob/security/`

## ✅ Solution

VPS Web Terminal में ये commands run करें:

```bash
# पहले check करें कि file कहाँ है
ls -la /opt/medexjob/backend/SecurityConfig.java

# Directory create करें (अगर नहीं है)
mkdir -p /opt/medexjob/backend/src/main/java/com/medexjob/security/

# File को सही location में move करें
mv /opt/medexjob/backend/SecurityConfig.java /opt/medexjob/backend/src/main/java/com/medexjob/security/

# Verify करें
ls -la /opt/medexjob/backend/src/main/java/com/medexjob/security/SecurityConfig.java
```

**Expected output:**
```
-rw-r--r-- 1 root root 5294 Jan 10 09:30 /opt/medexjob/backend/src/main/java/com/medexjob/security/SecurityConfig.java
```

---

## 📝 Next Steps

1. ✅ File move करें (ऊपर के commands)
2. ✅ Backend rebuild करें
3. ✅ Service restart करें
4. ✅ Test करें

