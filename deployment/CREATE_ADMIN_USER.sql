# AI assisted development
-- SQL Script to Create Admin User
-- Run this script in your MySQL database

-- First, generate a BCrypt hash for your password
-- You can use online BCrypt generator or the Java code provided
-- Default password: Admin@123
-- BCrypt hash for "Admin@123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Check if admin user already exists
SELECT id, name, email, role, is_active, is_verified 
FROM users 
WHERE email = 'admin@medexjob.com' OR role = 'ADMIN';

-- Create admin user (replace values as needed)
INSERT INTO users (
    id, 
    name, 
    email, 
    phone, 
    role, 
    password_hash, 
    is_active, 
    is_verified, 
    email_verification_token,
    email_verified_at,
    created_at, 
    updated_at
) VALUES (
    UUID(), 
    'Admin User', 
    'admin@medexjob.com', 
    '9999999999', 
    'ADMIN', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash for "Admin@123"
    true, 
    true, 
    UUID(),
    NOW(),
    NOW(), 
    NOW()
)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    role = VALUES(role),
    is_active = true,
    is_verified = true;

-- Verify admin user was created
SELECT id, name, email, role, is_active, is_verified, created_at 
FROM users 
WHERE email = 'admin@medexjob.com';

