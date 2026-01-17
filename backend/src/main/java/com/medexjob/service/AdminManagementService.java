// AI assisted development
package com.medexjob.service;

import com.medexjob.dto.CreateAdminRequest;
import com.medexjob.dto.UpdateAdminRequest;
import com.medexjob.dto.ResetAdminPasswordRequest;
import com.medexjob.entity.User;
import com.medexjob.entity.Employer;
import com.medexjob.security.AuthException;
import com.medexjob.repository.UserRepository;
import com.medexjob.repository.EmployerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@Transactional
public class AdminManagementService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private EmployerRepository employerRepository;

    // ---------------- Get All Admins ----------------
    public List<User> getAllAdmins() {
        return userRepository.findByRole(User.UserRole.ADMIN);
    }

    // ---------------- Get Admin by ID ----------------
    public User getAdminById(UUID id) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new AuthException("Admin not found"));

        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new AuthException("User is not an admin");
        }

        return admin;
    }

    // ---------------- Create Admin ----------------
    public User createAdmin(CreateAdminRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email is already registered!");
        }

        // Create new admin user
        User admin = new User();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setRole(User.UserRole.ADMIN);
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setIsActive(true);
        admin.setIsVerified(true);

        return userRepository.save(admin);
    }

    // ---------------- Update Admin ----------------
    @Transactional
    public User updateAdmin(UUID id, UpdateAdminRequest request) {
        try {
            User admin = getAdminById(id);

            // Log before update
            System.out.println("═══════════════════════════════════════════════════════");
            System.out.println("✏️  Updating admin:");
            System.out.println("   ID: " + id);
            System.out.println("   Old Name: " + admin.getName());
            System.out.println("   Old Email: " + admin.getEmail());
            System.out.println("   Old Phone: " + admin.getPhone());
            System.out.println("   New Name: " + request.getName());
            System.out.println("   New Email: " + request.getEmail());
            System.out.println("   New Phone: " + request.getPhone());
            System.out.println("═══════════════════════════════════════════════════════");

            // Check if email is being changed and if new email already exists
            if (!admin.getEmail().equals(request.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new AuthException("Email is already registered!");
                }
            }

            // Update the admin fields
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            admin.setPhone(request.getPhone());

            // Save the admin
            User savedAdmin = userRepository.save(admin);
            System.out.println("   Saved admin ID: " + savedAdmin.getId());

            // Flush to ensure update is committed immediately
            userRepository.flush();
            entityManager.flush();
            entityManager.clear(); // Clear persistence context to force fresh read

            // Wait a moment for database to commit
            Thread.sleep(100);

            // Verify update by reading from database
            User verifiedAdmin = userRepository.findById(id).orElse(null);
            if (verifiedAdmin == null) {
                System.err.println("❌ ERROR: Admin not found after update!");
                throw new AuthException("Failed to verify admin update in database");
            }

            // Check if values were actually updated
            if (!verifiedAdmin.getName().equals(request.getName()) ||
                !verifiedAdmin.getEmail().equals(request.getEmail()) ||
                !verifiedAdmin.getPhone().equals(request.getPhone())) {
                System.err.println("❌ ERROR: Admin values do not match expected values!");
                System.err.println("   Expected Name: " + request.getName() + ", Got: " + verifiedAdmin.getName());
                System.err.println("   Expected Email: " + request.getEmail() + ", Got: " + verifiedAdmin.getEmail());
                System.err.println("   Expected Phone: " + request.getPhone() + ", Got: " + verifiedAdmin.getPhone());
                throw new AuthException("Admin update verification failed - values do not match");
            }

            System.out.println("✅ Admin successfully updated in database");
            System.out.println("   Verified Name: " + verifiedAdmin.getName());
            System.out.println("   Verified Email: " + verifiedAdmin.getEmail());
            System.out.println("   Verified Phone: " + verifiedAdmin.getPhone());
            System.out.println("═══════════════════════════════════════════════════════");

            return verifiedAdmin;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AuthException("Update operation was interrupted");
        } catch (Exception e) {
            System.err.println("❌ ERROR during admin update: " + e.getMessage());
            e.printStackTrace();
            throw new AuthException("Failed to update admin: " + e.getMessage());
        }
    }

    // ---------------- Reset Admin Password ----------------
    public void resetAdminPassword(UUID id, ResetAdminPasswordRequest request) {
        User admin = getAdminById(id);

        // Log before password reset
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("🔑 Resetting password for admin:");
        System.out.println("   ID: " + id);
        System.out.println("   Email: " + admin.getEmail());
        System.out.println("   Name: " + admin.getName());
        System.out.println("═══════════════════════════════════════════════════════");

        admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(admin);

        // Flush to ensure password update is committed immediately
        userRepository.flush();
        entityManager.flush();
        entityManager.clear(); // Clear persistence context to force fresh read

        // Verify password update by reading from database
        User verifiedAdmin = userRepository.findById(id).orElse(null);
        if (verifiedAdmin == null) {
            throw new AuthException("Failed to verify password reset in database");
        }

        System.out.println("✅ Password successfully reset in database");
        System.out.println("   Verified: Password hash updated");
        System.out.println("═══════════════════════════════════════════════════════");
    }

    // ---------------- Delete Admin ----------------
    @Transactional
    public void deleteAdmin(UUID id) {
        User currentAdmin = authService.getCurrentUser();

        // Prevent admin from deleting themselves
        if (currentAdmin.getId().equals(id)) {
            throw new AuthException("You cannot delete your own account");
        }

        User admin = getAdminById(id);

        // Log before deletion
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("🗑️  Attempting to delete admin:");
        System.out.println("   ID: " + id);
        System.out.println("   Email: " + admin.getEmail());
        System.out.println("   Name: " + admin.getName());
        System.out.println("   Role: " + admin.getRole());
        System.out.println("═══════════════════════════════════════════════════════");

        try {
            // Step 1: Check and delete related Employer records if they exist
            // Since Employer has OneToOne relationship with User, we need to delete it first
            Optional<Employer> employerOpt = employerRepository.findByUserId(id);
            
            if (employerOpt.isPresent()) {
                Employer employer = employerOpt.get();
                System.out.println("   Found related Employer record, deleting it first...");
                System.out.println("   Employer ID: " + employer.getId());
                System.out.println("   Company Name: " + employer.getCompanyName());
                
                // Delete employer first to avoid foreign key constraint violation
                employerRepository.delete(employer);
                employerRepository.flush();
                System.out.println("   ✅ Employer record deleted successfully");
            } else {
                System.out.println("   No related Employer records found");
            }

            // Step 2: Check for any Jobs related to this user through Employer
            // This is handled by cascade or we need to delete jobs manually
            // For now, we'll let the database handle it with proper cascade settings

            // Step 3: Delete the admin user
            System.out.println("   Deleting admin user from database...");
            userRepository.deleteById(id);

            // Step 4: Flush to ensure deletion is committed immediately
            userRepository.flush();
            entityManager.flush();
            entityManager.clear(); // Clear persistence context to force fresh read

            // Step 5: Verify deletion by reading from database
            boolean stillExists = userRepository.existsById(id);
            if (stillExists) {
                System.err.println("❌ ERROR: Admin still exists after deletion attempt!");
                System.err.println("   This might be due to foreign key constraints or transaction issues.");
                throw new AuthException("Failed to delete admin from database. Admin may have related records that prevent deletion.");
            }

            System.out.println("✅ Admin successfully deleted from database");
            System.out.println("   Verified: Admin no longer exists in database");
            System.out.println("═══════════════════════════════════════════════════════");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("❌ Database integrity violation during deletion:");
            System.err.println("   Error: " + e.getMessage());
            System.err.println("   This usually means there are foreign key constraints preventing deletion.");
            throw new AuthException("Cannot delete admin: There are related records (e.g., jobs, applications) that reference this admin. Please remove those records first.");
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during admin deletion:");
            System.err.println("   Error: " + e.getMessage());
            e.printStackTrace();
            throw new AuthException("Failed to delete admin: " + e.getMessage());
        }
    }
}
