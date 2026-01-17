# AI assisted development
# Quick Fix for Admin Password

## Problem:
Password hash database में है लेकिन password match नहीं हो रहा।

## Solution: Password Hash Generate करें और Update करें

### Option 1: Online Tool (सबसे आसान)

1. Go to: https://bcrypt-generator.com/
2. Enter password: `shivam@123`
3. Rounds: 10 (default)
4. Click "Generate Hash"
5. Copy the hash (जैसे: `$2a$10$...`)

फिर VPS पर run करें:

```bash
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "UPDATE users SET password_hash = 'YOUR_GENERATED_HASH_HERE' WHERE email = 'shivamsuryawanshi1000@gmail.com';"
```

### Option 2: Using Maven Test (VPS पर)

```bash
cd /opt/medexjob/backend

# Create test file
cat > src/test/java/com/medexjob/util/PasswordHashTest.java << 'EOF'
package com.medexjob.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashTest {
    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "shivam@123";
        String hash = encoder.encode(password);
        System.out.println("\n=== Password Hash ===");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("\n=== SQL Command ===");
        System.out.println("UPDATE users SET password_hash = '" + hash + "' WHERE email = 'shivamsuryawanshi1000@gmail.com';");
    }
}
EOF

# Run test
mvn test -Dtest=PasswordHashTest
```

### Option 3: Simple Java One-liner

```bash
cd /opt/medexjob/backend
java -cp target/medexjob-backend-1.0.0.jar org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder 2>/dev/null || echo "Use online tool instead"
```

## After Getting Hash:

```bash
# Update password
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "UPDATE users SET password_hash = 'YOUR_HASH' WHERE email = 'shivamsuryawanshi1000@gmail.com';"

# Verify
mysql -u medexjob_user -p'MedExJob@2024!StrongPass' medtech_db -e "SELECT email, LEFT(password_hash, 10) as hash_start FROM users WHERE email = 'shivamsuryawanshi1000@gmail.com';"

# Test login
curl -X POST http://localhost:8081/api/auth/login -H 'Content-Type: application/json' -d '{"email":"shivamsuryawanshi1000@gmail.com","password":"shivam@123"}'
```

