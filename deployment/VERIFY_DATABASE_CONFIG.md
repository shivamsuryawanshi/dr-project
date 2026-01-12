# AI assisted development
# Database Configuration Verify करें

## 🔴 Problem

Backend अभी भी database connection error दे रहा है:
- `Unable to determine Dialect without JDBC metadata`
- यह मतलब है कि Hibernate database तक connect नहीं कर पा रहा

---

## ✅ Step-by-Step Verification

### Step 1: application-prod.yml Verify करें

VPS Web Terminal में:

```bash
# File check करें
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 5 "datasource:"
```

**Expected output:**
```yaml
datasource:
  url: jdbc:mysql://localhost:3306/medtech_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
  driver-class-name: com.mysql.cj.jdbc.Driver
  username: medexjob_user
  password: MedExJob@2024!StrongPass
```

---

### Step 2: MySQL Connection Test करें

```bash
# Direct MySQL connection test
mysql -u medexjob_user -p medtech_db
```

**Password enter करें:** `MedExJob@2024!StrongPass`

**अगर connection successful है:**
```sql
SHOW TABLES;
SELECT DATABASE();
exit;
```

**अगर connection fail होता है:**
- Password गलत है
- User exist नहीं करता
- Database exist नहीं करता

---

### Step 3: Database और User Verify करें

```bash
# Root user से MySQL में login करें
mysql -u root -p
```

**Root password enter करें** (जो आपने MySQL setup के समय set किया था)

MySQL prompt में:

```sql
-- Database check करें
SHOW DATABASES;

-- medtech_db check करें
USE medtech_db;
SHOW TABLES;

-- User check करें
SELECT User, Host FROM mysql.user WHERE User='medexjob_user';

-- User permissions check करें
SHOW GRANTS FOR 'medexjob_user'@'localhost';
```

---

### Step 4: अगर Database/User नहीं है, Create करें

MySQL root prompt में:

```sql
-- Database create करें (अगर नहीं है)
CREATE DATABASE IF NOT EXISTS medtech_db;
USE medtech_db;

-- User create करें (अगर नहीं है)
CREATE USER IF NOT EXISTS 'medexjob_user'@'localhost' IDENTIFIED BY 'MedExJob@2024!StrongPass';

-- Permissions दें
GRANT ALL PRIVILEGES ON medtech_db.* TO 'medexjob_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify करें
SHOW GRANTS FOR 'medexjob_user'@'localhost';
exit;
```

---

### Step 5: Connection Test करें

```bash
# User connection test
mysql -u medexjob_user -p medtech_db
# Password: MedExJob@2024!StrongPass

# अगर successful है:
exit;
```

---

### Step 6: Hibernate Dialect Explicitly Set करें

अगर connection test successful है लेकिन application अभी भी fail हो रहा है, तो `application-prod.yml` में dialect explicitly set करें:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: false
```

---

### Step 7: Updated File Upload करें

Windows PowerShell में:

```powershell
cd "D:\chrome download\MedExJobUpdated"
scp backend/application-prod.yml root@72.62.196.181:/opt/medexjob/backend/src/main/resources/
```

---

### Step 8: Backend Restart करें

VPS Web Terminal में:

```bash
systemctl restart medexjob-backend
sleep 5
journalctl -u medexjob-backend -n 50 --no-pager | tail -30
```

---

## 🔍 Common Issues

### Issue 1: Password Mismatch

**Solution:** MySQL में password reset करें:

```sql
ALTER USER 'medexjob_user'@'localhost' IDENTIFIED BY 'MedExJob@2024!StrongPass';
FLUSH PRIVILEGES;
```

### Issue 2: User Doesn't Exist

**Solution:** User create करें (Step 4 देखें)

### Issue 3: Database Doesn't Exist

**Solution:** Database create करें (Step 4 देखें)

### Issue 4: Connection Works but App Fails

**Solution:** Hibernate dialect explicitly set करें (Step 6 देखें)

---

**Follow Steps 1-8 to fix the database connection!** 🚀

