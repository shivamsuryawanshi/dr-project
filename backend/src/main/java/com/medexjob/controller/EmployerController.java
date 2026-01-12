package com.medexjob.controller;

import com.medexjob.entity.Employer;
import com.medexjob.repository.EmployerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/employers")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployerController {

    private final EmployerRepository employerRepository;
    private final Path uploadPath = Paths.get("uploads/verification");

    public EmployerController(EmployerRepository employerRepository) {
        this.employerRepository = employerRepository;
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create verification upload directory", e);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getEmployers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(required = false) String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Employer> employerPage;
        if (verificationStatus != null) {
            Employer.VerificationStatus status = Employer.VerificationStatus.valueOf(verificationStatus.toUpperCase());
            employerPage = employerRepository.findAll(pageable); // TODO: Add custom query for filtering by status
        } else {
            employerPage = employerRepository.findAll(pageable);
        }

        List<Map<String, Object>> employers = employerPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("employers", employers);
        response.put("totalElements", employerPage.getTotalElements());
        response.put("totalPages", employerPage.getTotalPages());
        response.put("currentPage", page);
        response.put("size", size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployer(@PathVariable UUID id) {
        return employerRepository.findById(id)
                .map(employer -> ResponseEntity.ok(toResponse(employer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/verification")
    public ResponseEntity<?> updateVerificationStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String notes
    ) {
        return employerRepository.findById(id)
                .map(employer -> {
                    Employer.VerificationStatus verificationStatus = Employer.VerificationStatus.valueOf(status.toUpperCase());
                    employer.setVerificationStatus(verificationStatus);

                    if (verificationStatus == Employer.VerificationStatus.APPROVED) {
                        employer.setIsVerified(true);
                        employer.setVerifiedAt(LocalDateTime.now());
                    } else if (verificationStatus == Employer.VerificationStatus.REJECTED) {
                        employer.setIsVerified(false);
                    }

                    if (notes != null) {
                        employer.setVerificationNotes(notes);
                    }

                    Employer saved = employerRepository.save(employer);
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/documents")
        public ResponseEntity<?> uploadVerificationDocument(
            @PathVariable UUID id,
            @RequestParam("document") MultipartFile document
    ) {
        return employerRepository.findById(id)
                .map(employer -> {
                    try {
                        String fileName = id + "_" + document.getOriginalFilename();
                        Path filePath = uploadPath.resolve(fileName);
                        Files.copy(document.getInputStream(), filePath);

                        // In a real implementation, you'd store document references in a separate table
                        // For now, we'll just acknowledge the upload

                        Map<String, Object> response = new HashMap<>();
                        response.put("message", "Document uploaded successfully");
                        response.put("fileName", fileName);
                        return ResponseEntity.ok(response);
                    } catch (IOException e) {
                        return ResponseEntity.internalServerError().build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toResponse(Employer employer) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", employer.getId().toString());
        m.put("userId", employer.getUser().getId().toString());
        m.put("userName", employer.getUser().getName());
        m.put("userEmail", employer.getUser().getEmail());
        m.put("companyName", employer.getCompanyName());
        m.put("companyType", employer.getCompanyType().name().toLowerCase());
        m.put("companyDescription", employer.getCompanyDescription());
        m.put("website", employer.getWebsite());
        m.put("address", employer.getAddress());
        m.put("city", employer.getCity());
        m.put("state", employer.getState());
        m.put("pincode", employer.getPincode());
        m.put("isVerified", employer.getIsVerified());
        m.put("verificationStatus", employer.getVerificationStatus().name().toLowerCase());
        m.put("verificationNotes", employer.getVerificationNotes());
        m.put("verifiedAt", employer.getVerifiedAt() != null ? employer.getVerifiedAt().toString() : null);
        m.put("createdAt", employer.getCreatedAt() != null ? employer.getCreatedAt().toString() : null);
        m.put("updatedAt", employer.getUpdatedAt() != null ? employer.getUpdatedAt().toString() : null);
        return m;
    }
}
