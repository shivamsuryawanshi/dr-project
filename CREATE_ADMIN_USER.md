# AI assisted development
# Admin User बनाने के तरीके

यह document आपको admin user बनाने के तीन तरीके बताता है।

## तरीका 1: Java Utility Class (सबसे आसान) ⭐

यह तरीका सबसे आसान है और automatically admin user create कर देगा जब आप application run करेंगे।

### Steps:

1. **Admin details update करें:**
   - File खोलें: `backend/src/main/java/com/medexjob/util/AdminUserCreator.java`
   - Line 26-29 पर admin details update करें:
     ```java
     private static final String ADMIN_NAME = "Admin User";
     private static final String ADMIN_EMAIL = "admin@medexjob.com";
     private static final String ADMIN_PHONE = "9999999999";
     private static final String ADMIN_PASSWORD = "Admin@123"; // अपना password change करें!
     ```

2. **Application run करें:**
   ```bash
   cd dr-project/backend
   mvn spring-boot:run
   ```

3. **Console में check करें:**
   - Application start होने पर admin user automatically create हो जाएगा
   - Console में success message दिखेगा

4. **Login करें:**
   - Email: `admin@medexjob.com`
   - Password: `Admin@123` (या जो आपने set किया है)

---

## तरीका 2: SQL Script (Direct Database)

अगर आप directly database में admin user insert करना चाहते हैं:

### Steps:

1. **MySQL database connect करें:**
   ```bash
   mysql -u root -p
   ```

2. **Database select करें:**
   ```sql
   USE medtech_db;
   ```

3. **SQL script run करें:**
   ```sql
   -- File: deployment/CREATE_ADMIN_USER.sql
   -- या manually यह command run करें:
   
   INSERT INTO users (
       id, name, email, phone, role, password_hash, 
       is_active, is_verified, email_verification_token,
       email_verified_at, created_at, updated_at
   ) VALUES (
       UUID(), 
       'Admin User', 
       'admin@medexjob.com', 
       '9999999999', 
       'ADMIN', 
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       true, 
       true, 
       UUID(),
       NOW(),
       NOW(), 
       NOW()
   );
   ```

4. **Verify करें:**
   ```sql
   SELECT id, name, email, role, is_active, is_verified 
   FROM users 
   WHERE email = 'admin@medexjob.com';
   ```

**Note:** Password hash `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` password `Admin@123` के लिए है।

अगर आप अपना password change करना चाहते हैं, तो BCrypt hash generate करें:
- Online tool: https://bcrypt-generator.com/
- या Java code use करें (deployment/CREATE_ADMIN_USER.java देखें)

---

## तरीका 3: Application के बाद Manual Creation

अगर application already running है, तो आप एक temporary endpoint भी add कर सकते हैं:

1. **Temporary Controller बनाएं:**
   ```java
   @RestController
   @RequestMapping("/api/admin")
   public class AdminSetupController {
       
       @Autowired
       private AdminUserCreator adminUserCreator;
       
       @PostMapping("/create")
       public ResponseEntity<String> createAdmin() {
           adminUserCreator.createAdminUser();
           return ResponseEntity.ok("Admin user created!");
       }
   }
   ```

2. **Endpoint call करें:**
   ```bash
   curl -X POST http://localhost:8081/api/admin/create
   ```

3. **Controller delete करें** (security के लिए)

---

## Default Admin Credentials

- **Email:** `admin@medexjob.com`
- **Password:** `Admin@123`
- **Role:** `ADMIN`

⚠️ **Important:** Production में जाने से पहले password जरूर change करें!

---

## Troubleshooting

### Problem: "Admin user already exists"
**Solution:** 
- Database में check करें: `SELECT * FROM users WHERE role = 'ADMIN';`
- अगर admin exist करता है, तो उसका password reset करें

### Problem: "Cannot connect to database"
**Solution:**
- `application.yml` में database credentials check करें
- MySQL service running है या नहीं check करें

### Problem: "Password not working"
**Solution:**
- Password hash verify करें
- BCrypt hash सही है या नहीं check करें
- Database में `password_hash` field check करें

---

## Security Notes

1. ✅ Admin user create करने के बाद, `AdminUserCreator` class को disable कर दें
2. ✅ Production में strong password use करें
3. ✅ Admin creation endpoint को secure करें
4. ✅ Regular password changes करें

---

## Support

अगर कोई problem है, तो:
1. Logs check करें: `logs/medexjob.log`
2. Database connection verify करें
3. Application.yml में settings check करें

