# AI assisted development
-- Complete SQL script to fix admin user
-- Run this in MySQL on VPS

USE medtech_db;

-- Step 1: Check current admin user
SELECT 
    id, 
    name, 
    email, 
    phone, 
    role, 
    is_active, 
    is_verified,
    created_at
FROM users 
WHERE email = 'shivamsuryawanshi1000@gmail.com';

-- Step 2: Update admin user - set is_active and is_verified to true
UPDATE users 
SET 
    is_active = true, 
    is_verified = true,
    name = 'shivam suryawanshi',
    phone = '6264817954'
WHERE email = 'shivamsuryawanshi1000@gmail.com';

-- Step 3: If user doesn't exist, create it (password hash will be updated separately)
-- Note: You need to generate BCrypt hash for password 'shivam@123'
-- Use the Java utility or online BCrypt generator

-- Step 4: Verify the update
SELECT 
    email, 
    name, 
    role, 
    is_active, 
    is_verified 
FROM users 
WHERE email = 'shivamsuryawanshi1000@gmail.com';

