# AI assisted development
# Fix Database Connection Error

## 🔴 Problem

Backend service fail हो रहा है क्योंकि:
- `HibernateException: Unable to determine Dialect without JDBC metadata`
- Database password placeholder है: `your_strong_password_here`
- Actual password set नहीं है

---

## ✅ Solution Steps

### Step 1: MySQL Service Check करें

VPS Web Terminal में:

```bash
# MySQL service status
systemctl status mysql

# MySQL service start करें (अगर stopped है)
systemctl start mysql
systemctl enable mysql
```

---

### Step 2: Database और User Verify करें

```bash
# MySQL में login करें
mysql -u root -p
```

**Password enter करें** (जो आपने MySQL setup के समय set किया था)

MySQL prompt में:

```sql
-- Database check करें
SHOW DATABASES;

-- medtech_db database check करें
USE medtech_db;
SHOW TABLES;

-- User check करें
SELECT User, Host FROM mysql.user WHERE User='medexjob_user';

-- User permissions check करें
SHOW GRANTS FOR 'medexjob_user'@'localhost';
```

**Expected:**
- `medtech_db` database exist करना चाहिए
- `medexjob_user` user exist करना चाहिए
- User को proper permissions होनी चाहिए

---

### Step 3: Actual Password Set करें

**Option A: अगर आपको actual password पता है:**

Windows PowerShell में `application-prod.yml` edit करें:

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/medtech_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
  driver-class-name: com.mysql.cj.jdbc.Driver
  username: ${DB_USERNAME:medexjob_user}
  password: MedExJob@2024!StrongPass  # या आपका actual password
```

**Option B: अगर password पता नहीं है, नया password set करें:**

MySQL में:

```sql
-- नया password set करें
ALTER USER 'medexjob_user'@'localhost' IDENTIFIED BY 'MedExJob@2024!StrongPass';
FLUSH PRIVILEGES;
```

---

### Step 4: application-prod.yml Update करें

**Local file edit करें:**

`backend/application-prod.yml` में line 13 update करें:

```yaml
password: MedExJob@2024!StrongPass
```

**या environment variable use करें:**

```yaml
password: ${DB_PASSWORD:MedExJob@2024!StrongPass}
```

---

### Step 5: Updated File Upload करें

Windows PowerShell में:

```powershell
cd "D:\chrome download\MedExJobUpdated"
scp backend/application-prod.yml root@72.62.196.181:/opt/medexjob/backend/src/main/resources/
```

---

### Step 6: Backend Restart करें

VPS Web Terminal में:

```bash
systemctl restart medexjob-backend
sleep 5
systemctl status medexjob-backend
```

---

### Step 7: Logs Check करें

```bash
journalctl -u medexjob-backend -n 50 --no-pager | tail -30
```

**Look for:**
- ✅ "Started MedexjobBackendApplication"
- ✅ "Tomcat started on port(s): 8081"
- ✅ No database errors
- ✅ No Hibernate errors

---

## 🔍 Troubleshooting

### Issue 1: MySQL Service Not Running

```bash
# Service start करें
systemctl start mysql
systemctl enable mysql

# Status check करें
systemctl status mysql
```

### Issue 2: Database Not Found

```sql
-- Database create करें
CREATE DATABASE medtech_db;
USE medtech_db;
```

### Issue 3: User Not Found

```sql
-- User create करें
CREATE USER 'medexjob_user'@'localhost' IDENTIFIED BY 'MedExJob@2024!StrongPass';
GRANT ALL PRIVILEGES ON medtech_db.* TO 'medexjob_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 4: Connection Still Fails

```bash
# MySQL connection test करें
mysql -u medexjob_user -p medtech_db
# Password enter करें: MedExJob@2024!StrongPass

# अगर connection successful है, तो application-prod.yml में password verify करें
cat /opt/medexjob/backend/src/main/resources/application-prod.yml | grep -A 3 "datasource:"
```

---

**Follow Steps 1-7 to fix the database connection!** 🚀

