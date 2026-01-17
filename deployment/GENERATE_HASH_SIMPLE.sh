# AI assisted development
#!/bin/bash

# Simple method to generate password hash

cd /opt/medexjob/backend

# Create a simple standalone Java file
cat > /tmp/GeneratePasswordHash.java << 'EOF'
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

// Simple BCrypt-like hash generator using Spring's BCryptPasswordEncoder
// We'll use a simpler approach - create a main class that can be compiled with the JAR

public class GeneratePasswordHash {
    public static void main(String[] args) {
        try {
            // Load BCryptPasswordEncoder from Spring Security
            Class<?> encoderClass = Class.forName("org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder");
            Object encoder = encoderClass.getDeclaredConstructor().newInstance();
            java.lang.reflect.Method encodeMethod = encoderClass.getMethod("encode", CharSequence.class);
            
            String password = "shivam@123";
            String hash = (String) encodeMethod.invoke(encoder, password);
            
            System.out.println("Password: " + password);
            System.out.println("BCrypt Hash: " + hash);
            System.out.println("");
            System.out.println("SQL Command:");
            System.out.println("UPDATE users SET password_hash = '" + hash + "' WHERE email = 'shivamsuryawanshi1000@gmail.com';");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("");
            System.out.println("Please use online tool: https://bcrypt-generator.com/");
            System.out.println("Password: shivam@123");
        }
    }
}
EOF

# Try to compile and run
echo "Attempting to generate password hash..."
echo ""

# Check if test directory exists, if not create it
mkdir -p src/test/java/com/medexjob/util

# Try using Maven to compile test
if [ -f "src/test/java/com/medexjob/util/PasswordHashTest.java" ]; then
    echo "Test file exists, trying to compile..."
    mvn test-compile -DskipTests 2>&1 | tail -5
    
    # Try to run the test with proper syntax
    echo ""
    echo "Running test..."
    mvn test -Dtest=com.medexjob.util.PasswordHashTest 2>&1 | grep -A 10 "Password Hash\|Hash:\|SQL Command" || echo "Test execution failed"
else
    echo "Test file not found. Creating it now..."
    cat > src/test/java/com/medexjob/util/PasswordHashTest.java << 'EOFTEST'
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
EOFTEST
    
    echo "Test file created. Now running..."
    mvn test-compile -DskipTests
    mvn test -Dtest=com.medexjob.util.PasswordHashTest 2>&1 | grep -A 10 "Password Hash\|Hash:\|SQL Command"
fi

echo ""
echo "If above failed, use online tool: https://bcrypt-generator.com/"
echo "Password: shivam@123"

