# AI assisted development
#!/bin/bash

# Script to reset admin password with proper BCrypt hash

DB_USER="medexjob_user"
DB_PASS="MedExJob@2024!StrongPass"
DB_NAME="medtech_db"
ADMIN_EMAIL="shivamsuryawanshi1000@gmail.com"
ADMIN_PASSWORD="shivam@123"

echo "Generating BCrypt hash for password: $ADMIN_PASSWORD"
echo ""

# Method 1: Use Java to generate hash (if backend JAR is available)
cd /opt/medexjob/backend

# Create a simple Java class to generate hash
cat > /tmp/GenerateHash.java << 'EOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args.length > 0 ? args[0] : "shivam@123";
        String hash = encoder.encode(password);
        System.out.println(hash);
    }
}
EOF

# Try to compile and run
if command -v javac &> /dev/null; then
    echo "Compiling hash generator..."
    javac -cp target/medexjob-backend-1.0.0.jar:/usr/share/java/* /tmp/GenerateHash.java 2>/dev/null
    
    if [ -f /tmp/GenerateHash.class ]; then
        echo "Running hash generator..."
        HASH=$(java -cp /tmp:/opt/medexjob/backend/target/medexjob-backend-1.0.0.jar GenerateHash "$ADMIN_PASSWORD" 2>/dev/null)
        
        if [ ! -z "$HASH" ] && [[ "$HASH" == \$2* ]]; then
            echo "Generated BCrypt hash: $HASH"
            echo ""
            echo "Updating password in database..."
            mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "UPDATE users SET password_hash = '$HASH' WHERE email = '$ADMIN_EMAIL';"
            echo ""
            echo "Password updated successfully!"
            echo ""
            echo "Verifying update..."
            mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT email, LEFT(password_hash, 10) as hash_start FROM users WHERE email = '$ADMIN_EMAIL';"
        else
            echo "Failed to generate hash using Java method"
        fi
    fi
fi

# Cleanup
rm -f /tmp/GenerateHash.java /tmp/GenerateHash.class

echo ""
echo "If hash generation failed, use online tool: https://bcrypt-generator.com/"
echo "Then run: mysql -u $DB_USER -p'$DB_PASS' $DB_NAME -e \"UPDATE users SET password_hash = 'YOUR_HASH_HERE' WHERE email = '$ADMIN_EMAIL';\""

