# AI assisted development
#!/bin/bash

# Update admin password with generated BCrypt hash

DB_USER="medexjob_user"
DB_PASS="MedExJob@2024!StrongPass"
DB_NAME="medtech_db"
ADMIN_EMAIL="shivamsuryawanshi1000@gmail.com"
PASSWORD_HASH="$2a$12$gXQN9Yg3uTGKkXG64p6obuuwPmENO.ar//QL4FNmE26ycRy8lwO3."

echo "Updating password hash for: $ADMIN_EMAIL"
echo ""

mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "UPDATE users SET password_hash = '$PASSWORD_HASH' WHERE email = '$ADMIN_EMAIL';" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Password hash updated successfully!"
    echo ""
    echo "Verifying update..."
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT email, LEFT(password_hash, 20) as hash_start FROM users WHERE email = '$ADMIN_EMAIL';" 2>/dev/null
    echo ""
    echo "✓ Update complete! Now test login."
else
    echo "✗ Update failed!"
fi

