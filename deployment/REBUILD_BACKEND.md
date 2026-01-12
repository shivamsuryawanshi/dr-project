# AI assisted development
# Backend Rebuild करें - JAR File Update

## 🔴 Problem

Service अभी भी fail हो रहा है क्योंकि:
- JAR file में old configuration है
- Updated `application-prod.yml` JAR file में include नहीं हुई
- Backend rebuild नहीं हुआ

---

## ✅ Solution

### Step 1: Backend Rebuild करें (CRITICAL!)

VPS Web Terminal में:

```bash
cd /opt/medexjob/backend
mvn clean package -DskipTests
```

**Wait for build to complete** (2-5 minutes). Build successful होने पर आखिर में "BUILD SUCCESS" दिखेगा.

---

### Step 2: JAR File Verify करें

```bash
# JAR file check करें
ls -lh /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar

# JAR file में configuration check करें
jar -xf /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar BOOT-INF/classes/application-prod.yml
cat BOOT-INF/classes/application-prod.yml | grep -A 10 "jpa:"
rm -rf BOOT-INF
```

**Expected:** `dialect: org.hibernate.dialect.MySQL8Dialect` दिखना चाहिए.

---

### Step 3: Backend Restart करें

```bash
systemctl restart medexjob-backend
sleep 5
systemctl status medexjob-backend
```

Check करें: `Active: active (running)` दिखना चाहिए.

---

### Step 4: Logs Check करें

```bash
journalctl -u medexjob-backend -n 100 --no-pager | tail -40
```

**Look for:**
- ✅ "Started MedexjobBackendApplication"
- ✅ "Tomcat started on port(s): 8081"
- ✅ "HikariPool-1 - Start completed"
- ❌ No database errors
- ❌ No Hibernate errors

---

### Step 5: Health Check करें

```bash
curl -X GET http://localhost:8081/api/actuator/health -v
```

Expected: 200 OK response.

---

## 🔍 Troubleshooting

### Issue 1: Build Fails

```bash
# Java version check करें
java -version  # Should be 17+

# Maven version check करें
mvn -version
```

### Issue 2: JAR File Not Updated

```bash
# Old JAR file delete करें
rm -f /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar

# Rebuild करें
mvn clean package -DskipTests
```

### Issue 3: Still Getting Errors

```bash
# Complete logs check करें
journalctl -u medexjob-backend -n 200 --no-pager | grep -i "error\|exception\|failed"
```

---

**Follow Steps 1-5 to fix the issue!** 🚀

