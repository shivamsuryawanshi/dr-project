// AI assisted development
package com.medexjob.util;

import com.medexjob.entity.User;
import com.medexjob.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Utility class to create admin user
 * This can be run as a CommandLineRunner or called manually
 * 
 * Usage:
 * 1. Update the admin details below (name, email, phone, password)
 * 2. Run the Spring Boot application
 * 3. The admin user will be created automatically if it doesn't exist
 */
@Component
public class AdminUserCreator implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Admin user details - UPDATE THESE VALUES
    private static final String ADMIN_NAME = "Admin User";
    private static final String ADMIN_EMAIL = "admin@medexjob.com";
    private static final String ADMIN_PHONE = "9999999999";
    private static final String ADMIN_PASSWORD = "Admin@123"; // Change this password!

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
    }

    /**
     * Creates admin user if it doesn't exist
     */
    public void createAdminUser() {
        // Check if admin user already exists
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            System.out.println("Admin user already exists with email: " + ADMIN_EMAIL);
            return;
        }

        // Create new admin user
        User adminUser = new User();
        adminUser.setName(ADMIN_NAME);
        adminUser.setEmail(ADMIN_EMAIL);
        adminUser.setPhone(ADMIN_PHONE);
        adminUser.setRole(User.UserRole.ADMIN);
        adminUser.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        adminUser.setIsActive(true);
        adminUser.setIsVerified(true);
        adminUser.setEmailVerificationToken(UUID.randomUUID().toString());
        adminUser.setEmailVerifiedAt(java.time.LocalDateTime.now());

        userRepository.save(adminUser);

        System.out.println("==========================================");
        System.out.println("Admin User Created Successfully!");
        System.out.println("==========================================");
        System.out.println("Email: " + ADMIN_EMAIL);
        System.out.println("Password: " + ADMIN_PASSWORD);
        System.out.println("Role: ADMIN");
        System.out.println("==========================================");
        System.out.println("Please change the password after first login!");
        System.out.println("==========================================");
    }
}

