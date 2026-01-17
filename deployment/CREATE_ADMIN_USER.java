// AI assisted development
// Java code to create/update admin user with proper password hash
// Run this in a simple Java class or use it in a test

package com.medexjob.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CreateAdminUser {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "shivam@123";
        String hashedPassword = encoder.encode(password);
        
        System.out.println("Original Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println("");
        System.out.println("Use this SQL to update password:");
        System.out.println("UPDATE users SET password_hash = '" + hashedPassword + "' WHERE email = 'shivamsuryawanshi1000@gmail.com';");
    }
}

