# AI assisted development
# Backend Service Errors Check करें

## 🔴 Problem

Service `activating (auto-restart)` state में है और `status=1/FAILURE` दे रहा है।

---

## ✅ Step-by-Step Debugging

### Step 1: Complete Logs Check करें

```bash
journalctl -u medexjob-backend -n 200 --no-pager | tail -60
```

**Look for:**
- Database connection errors
- Hibernate errors
- Configuration errors
- Any exceptions

---

### Step 2: Application-prod.yml Verify करें

```bash
# File check करें
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 10 "datasource:"

# Hibernate dialect check करें
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 5 "jpa:"
```

**Expected:**
- Password: `MedExJob@2024!StrongPass` (या actual password)
- Dialect: `org.hibernate.dialect.MySQL8Dialect`

---

### Step 3: Direct Java Test करें

```bash
cd /opt/medexjob/backend
java -Xms512m -Xmx1024m -jar -Dspring.profiles.active=prod target/medexjob-backend-1.0.0.jar
```

**यह command run करें और errors देखें।** Ctrl+C से stop करें।

---

### Step 4: JAR File Verify करें

```bash
# JAR file exist करता है?
ls -lh /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar

# JAR file size check करें
du -h /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar
```

---

### Step 5: MySQL Connection Test करें

```bash
# User connection test
mysql -u medexjob_user -p medtech_db
# Password: MedExJob@2024!StrongPass

# अगर successful है:
SHOW TABLES;
exit;
```

---

## 🔍 Common Issues

### Issue 1: Password Still Wrong

**Solution:** MySQL में password verify करें:

```sql
mysql -u root -p
ALTER USER 'medexjob_user'@'localhost' IDENTIFIED BY 'MedExJob@2024!StrongPass';
FLUSH PRIVILEGES;
exit;
```

### Issue 2: Configuration Not Loaded

**Solution:** File path verify करें:

```bash
ls -la /opt/medexjob/backend/src/main/resources/application-prod.yml
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | head -20
```

### Issue 3: JAR File Corrupted

**Solution:** Backend rebuild करें:

```bash
cd /opt/medexjob/backend
mvn clean package -DskipTests
```

---

**Follow Steps 1-5 to identify the exact error!** 🚀

