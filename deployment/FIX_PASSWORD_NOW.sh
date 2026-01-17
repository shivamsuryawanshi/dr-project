# AI assisted development
#!/bin/bash

# Script to generate BCrypt hash and update admin password

DB_USER="medexjob_user"
DB_PASS="MedExJob@2024!StrongPass"
DB_NAME="medtech_db"
ADMIN_EMAIL="shivamsuryawanshi1000@gmail.com"
ADMIN_PASSWORD="shivam@123"

echo "=========================================="
echo "Generating BCrypt Hash for Admin Password"
echo "=========================================="
echo ""

cd /opt/medexjob/backend

# Method 1: Try using existing JAR to generate hash
echo "Method 1: Using Spring Boot JAR to generate hash..."
echo ""

# Create a simple Java class that can be executed
cat > /tmp/PasswordHashGenerator.java << 'EOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "shivam@123";
        String hash = encoder.encode(password);
        System.out.println(hash);
    }
}
EOF

# Try to compile
echo "Compiling hash generator..."
javac -cp target/medexjob-backend-1.0.0.jar /tmp/PasswordHashGenerator.java 2>/dev/null

if [ -f /tmp/PasswordHashGenerator.class ]; then
    echo "Running hash generator..."
    HASH=$(java -cp /tmp:/opt/medexjob/backend/target/medexjob-backend-1.0.0.jar PasswordHashGenerator 2>/dev/null)
    
    if [ ! -z "$HASH" ] && [[ "$HASH" == \$2* ]]; then
        echo "✓ Hash generated successfully!"
        echo ""
        echo "Generated Hash: $HASH"
        echo ""
        echo "Updating database..."
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "UPDATE users SET password_hash = '$HASH' WHERE email = '$ADMIN_EMAIL';" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✓ Password updated successfully!"
            echo ""
            echo "Verifying update..."
            mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT email, LEFT(password_hash, 20) as hash_start FROM users WHERE email = '$ADMIN_EMAIL';" 2>/dev/null
            echo ""
            echo "=========================================="
            echo "✓ Password fix completed!"
            echo "=========================================="
            echo ""
            echo "Now test login with:"
            echo "curl -X POST http://localhost:8081/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}'"
        else
            echo "✗ Database update failed!"
        fi
    else
        echo "✗ Hash generation failed!"
        echo ""
        echo "Please use online tool: https://bcrypt-generator.com/"
        echo "Password: $ADMIN_PASSWORD"
    fi
else
    echo "✗ Compilation failed!"
    echo ""
    echo "Using alternative method..."
    
    # Method 2: Use a known working hash (for testing)
    # Note: This is a pre-generated hash for "shivam@123"
    # You should generate your own using online tool
    echo ""
    echo "=========================================="
    echo "Please generate hash using online tool:"
    echo "=========================================="
    echo "1. Go to: https://bcrypt-generator.com/"
    echo "2. Enter password: $ADMIN_PASSWORD"
    echo "3. Click Generate"
    echo "4. Copy the hash"
    echo "5. Run this command:"
    echo ""
    echo "mysql -u $DB_USER -p'$DB_PASS' $DB_NAME -e \"UPDATE users SET password_hash = 'YOUR_HASH_HERE' WHERE email = '$ADMIN_EMAIL';\""
    echo ""
fi

# Cleanup
rm -f /tmp/PasswordHashGenerator.java /tmp/PasswordHashGenerator.class 2>/dev/null

