// AI assisted development
package com.medexjob.controller;

import com.medexjob.dto.CreateAdminRequest;
import com.medexjob.dto.UpdateAdminRequest;
import com.medexjob.dto.ResetAdminPasswordRequest;
import com.medexjob.dto.AdminUserResponse;
import com.medexjob.entity.User;
import com.medexjob.service.AdminManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminManagementController {

    @Autowired
    private AdminManagementService adminManagementService;

    // ---------------- Get All Admins ----------------
    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllAdmins() {
        List<User> admins = adminManagementService.getAllAdmins();
        List<AdminUserResponse> response = admins.stream()
                .map(AdminUserResponse::new)
                .toList();
        return ResponseEntity.ok(response);
    }

    // ---------------- Get Admin by ID ----------------
    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getAdminById(@PathVariable UUID id) {
        User admin = adminManagementService.getAdminById(id);
        return ResponseEntity.ok(new AdminUserResponse(admin));
    }

    // ---------------- Create Admin ----------------
    @PostMapping
    public ResponseEntity<?> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        User admin = adminManagementService.createAdmin(request);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin created successfully");
        response.put("admin", new AdminUserResponse(admin));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ---------------- Update Admin ----------------
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable UUID id, @Valid @RequestBody UpdateAdminRequest request) {
        User admin = adminManagementService.updateAdmin(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin updated successfully");
        response.put("admin", new AdminUserResponse(admin));
        return ResponseEntity.ok(response);
    }

    // ---------------- Reset Admin Password ----------------
    @PutMapping("/{id}/password")
    public ResponseEntity<?> resetAdminPassword(@PathVariable UUID id,
            @Valid @RequestBody ResetAdminPasswordRequest request) {
        adminManagementService.resetAdminPassword(id, request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin password reset successfully");
        return ResponseEntity.ok(response);
    }

    // ---------------- Delete Admin ----------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable UUID id) {
        adminManagementService.deleteAdmin(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin deleted successfully");
        return ResponseEntity.ok(response);
    }
}
