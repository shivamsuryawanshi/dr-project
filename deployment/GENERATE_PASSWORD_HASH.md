# AI assisted development
# Generate BCrypt Password Hash for Admin User

## Password: `shivam@123`

## Method 1: Online BCrypt Generator
1. Go to: https://bcrypt-generator.com/
2. Enter password: `shivam@123`
3. Rounds: 10 (default)
4. Copy the generated hash

## Method 2: Using Java Code (Run on VPS)

Create a temporary Java file on VPS:

```bash
ssh root@72.62.196.181
cd /tmp
cat > HashPassword.java << 'EOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "shivam@123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
    }
}
EOF
```

Then compile and run (if Java is available):
```bash
javac -cp /opt/medexjob/backend/target/medexjob-backend-1.0.0.jar HashPassword.java
java -cp .:/opt/medexjob/backend/target/medexjob-backend-1.0.0.jar HashPassword
```

## Method 3: Using Maven/Gradle (Recommended)

On VPS, use the backend project:

```bash
ssh root@72.62.196.181
cd /opt/medexjob/backend

# Create a simple test class
cat > src/test/java/com/medexjob/util/PasswordHashGenerator.java << 'EOF'
package com.medexjob.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "shivam@123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("\nSQL Update Command:");
        System.out.println("UPDATE users SET password_hash = '" + hash + "' WHERE email = 'shivamsuryawanshi1000@gmail.com';");
    }
}
EOF

# Run the test
mvn test -Dtest=PasswordHashGenerator
```

## Method 4: Quick Fix - Use Existing Hash Pattern

If you have access to another user's hash, you can use a similar pattern, but it's better to generate a fresh one.

## After Getting Hash:

Update the password in database:

```sql
UPDATE users 
SET password_hash = 'YOUR_GENERATED_BCRYPT_HASH_HERE' 
WHERE email = 'shivamsuryawanshi1000@gmail.com';
```

