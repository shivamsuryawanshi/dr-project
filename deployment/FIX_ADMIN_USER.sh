# AI assisted development
#!/bin/bash

# Script to fix admin user in database
# This will check and update the admin user credentials

DB_USER="medexjob_user"
DB_PASS="MedExJob@2024!StrongPass"
DB_NAME="medtech_db"
ADMIN_EMAIL="shivamsuryawanshi1000@gmail.com"
ADMIN_NAME="shivam suryawanshi"
ADMIN_PHONE="6264817954"
ADMIN_PASSWORD="shivam@123"

echo "Checking admin user in database..."

# Check if user exists
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" << EOF
-- Check current admin user
SELECT email, name, role, is_active, is_verified 
FROM users 
WHERE email = '$ADMIN_EMAIL';

-- Update admin user to ensure is_active and is_verified are true
UPDATE users 
SET is_active = true, is_verified = true 
WHERE email = '$ADMIN_EMAIL' AND role = 'ADMIN';

-- Verify the update
SELECT email, name, role, is_active, is_verified 
FROM users 
WHERE email = '$ADMIN_EMAIL';
EOF

echo ""
echo "Note: If password is not working, you need to reset it using BCrypt hash."
echo "The password needs to be hashed using BCryptPasswordEncoder."

