# AI assisted development
-- SQL Commands to Check and Fix Admin User in Database

-- 1. Check if admin user exists
SELECT id, name, email, role, is_active, is_verified, created_at 
FROM users 
WHERE role = 'ADMIN';

-- 2. Check specific admin user by email
SELECT id, name, email, role, is_active, is_verified, password_hash 
FROM users 
WHERE email = 'shivamsuryawanshi1000@gmail.com';

-- 3. Fix admin user if needed (set is_active and is_verified to true)
UPDATE users 
SET is_active = true, is_verified = true 
WHERE email = 'shivamsuryawanshi1000@gmail.com' AND role = 'ADMIN';

-- 4. Reset admin password (replace 'NEW_PASSWORD_HASH' with BCrypt hash)
-- First, you need to generate BCrypt hash for your password
-- Use this Java code or online BCrypt generator:
-- String hash = new BCryptPasswordEncoder().encode("your_password");
-- Then update:
-- UPDATE users SET password_hash = 'NEW_PASSWORD_HASH' WHERE email = 'shivamsuryawanshi1000@gmail.com';

-- 5. Create admin user if doesn't exist (replace values)
-- INSERT INTO users (id, name, email, phone, role, password_hash, is_active, is_verified, created_at, updated_at)
-- VALUES (
--     UUID(), 
--     'Admin Name', 
--     'admin@example.com', 
--     '9999999999', 
--     'ADMIN', 
--     '$2a$10$...', -- BCrypt hashed password
--     true, 
--     true, 
--     NOW(), 
--     NOW()
-- );

