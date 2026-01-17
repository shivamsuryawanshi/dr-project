// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.FraudReport;
import com.medexjob.entity.User;
import com.medexjob.repository.FraudReportRepository;
import com.medexjob.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fraud-reports")
public class FraudReportController {

    private static final Logger logger = LoggerFactory.getLogger(FraudReportController.class);

    private final FraudReportRepository fraudReportRepository;
    private final UserRepository userRepository;

    public FraudReportController(
            FraudReportRepository fraudReportRepository,
            UserRepository userRepository) {
        this.fraudReportRepository = fraudReportRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create fraud report
     * POST /api/fraud-reports
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createFraudReport(@RequestBody Map<String, Object> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            String typeStr = ((String) request.get("type")).toUpperCase();
            FraudReport.ReportType type;
            try {
                type = FraudReport.ReportType.valueOf(typeStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid report type"));
            }

            String reason = (String) request.get("reason");
            String description = (String) request.get("description");
            if (reason == null || reason.trim().isEmpty() || description == null || description.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Reason and description are required"));
            }

            FraudReport report = new FraudReport(type, user.getId(), user.getName(), user.getEmail(), reason, description);

            if (request.containsKey("jobId")) {
                try {
                    report.setJobId(UUID.fromString((String) request.get("jobId")));
                } catch (Exception e) {
                    // Invalid UUID, ignore
                }
            }
            if (request.containsKey("employerId")) {
                try {
                    report.setEmployerId(UUID.fromString((String) request.get("employerId")));
                } catch (Exception e) {
                    // Invalid UUID, ignore
                }
            }
            if (request.containsKey("priority")) {
                String priorityStr = ((String) request.get("priority")).toUpperCase();
                try {
                    report.setPriority(FraudReport.ReportPriority.valueOf(priorityStr));
                } catch (IllegalArgumentException e) {
                    report.setPriority(FraudReport.ReportPriority.MEDIUM);
                }
            }
            if (request.containsKey("evidence")) {
                List<?> evidenceList = (List<?>) request.get("evidence");
                if (evidenceList != null) {
                    report.setEvidence(evidenceList.stream()
                            .map(Object::toString)
                            .collect(Collectors.joining(",")));
                }
            }

            report = fraudReportRepository.save(report);
            return ResponseEntity.ok(toResponse(report));
        } catch (Exception e) {
            logger.error("Error creating fraud report", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create fraud report"));
        }
    }

    /**
     * Get fraud reports (admin only for all, users for their own)
     * GET /api/fraud-reports
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFraudReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String type
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<FraudReport> reports;
            boolean isAdmin = user.getRole() == User.UserRole.ADMIN;

            if (isAdmin) {
                // Admin can see all reports with filters
                if (status != null && !status.isEmpty()) {
                    try {
                        FraudReport.ReportStatus reportStatus = FraudReport.ReportStatus.valueOf(status.toUpperCase());
                        reports = fraudReportRepository.findByStatusOrderByCreatedAtDesc(reportStatus, pageable);
                    } catch (IllegalArgumentException e) {
                        reports = fraudReportRepository.findAll(pageable);
                    }
                } else if (priority != null && !priority.isEmpty()) {
                    try {
                        FraudReport.ReportPriority reportPriority = FraudReport.ReportPriority.valueOf(priority.toUpperCase());
                        reports = fraudReportRepository.findByPriorityOrderByCreatedAtDesc(reportPriority, pageable);
                    } catch (IllegalArgumentException e) {
                        reports = fraudReportRepository.findAll(pageable);
                    }
                } else if (type != null && !type.isEmpty()) {
                    try {
                        FraudReport.ReportType reportType = FraudReport.ReportType.valueOf(type.toUpperCase());
                        reports = fraudReportRepository.findByTypeOrderByCreatedAtDesc(reportType, pageable);
                    } catch (IllegalArgumentException e) {
                        reports = fraudReportRepository.findAll(pageable);
                    }
                } else {
                    reports = fraudReportRepository.findAll(pageable);
                }
            } else {
                // Regular users can only see their own reports
                reports = fraudReportRepository.findByReporterIdOrderByCreatedAtDesc(user.getId(), pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("content", reports.getContent().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList()));
            response.put("page", reports.getNumber());
            response.put("size", reports.getSize());
            response.put("totalElements", reports.getTotalElements());
            response.put("totalPages", reports.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching fraud reports", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch fraud reports"));
        }
    }

    /**
     * Get report details
     * GET /api/fraud-reports/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFraudReport(@PathVariable("id") UUID id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            Optional<FraudReport> reportOpt = fraudReportRepository.findById(id);

            if (reportOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Fraud report not found"));
            }

            FraudReport report = reportOpt.get();
            boolean isAdmin = user.getRole() == User.UserRole.ADMIN;

            // Users can only see their own reports, admins can see all
            if (!isAdmin && !report.getReporterId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            return ResponseEntity.ok(toResponse(report));
        } catch (Exception e) {
            logger.error("Error fetching fraud report", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch fraud report"));
        }
    }

    /**
     * Update report status (admin only)
     * PUT /api/fraud-reports/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }

            Optional<FraudReport> reportOpt = fraudReportRepository.findById(id);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Fraud report not found"));
            }

            FraudReport report = reportOpt.get();
            String statusStr = ((String) request.get("status")).toUpperCase();
            try {
                FraudReport.ReportStatus newStatus = FraudReport.ReportStatus.valueOf(statusStr);
                report.setStatus(newStatus);

                if (newStatus == FraudReport.ReportStatus.RESOLVED) {
                    report.setResolvedAt(LocalDateTime.now());
                    report.setResolvedBy(user.getId());
                }

                if (request.containsKey("adminNotes")) {
                    report.setAdminNotes((String) request.get("adminNotes"));
                }

                report = fraudReportRepository.save(report);
                return ResponseEntity.ok(toResponse(report));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid status"));
            }
        } catch (Exception e) {
            logger.error("Error updating report status", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update report status"));
        }
    }

    /**
     * Update priority (admin only)
     * PUT /api/fraud-reports/{id}/priority
     */
    @PutMapping("/{id}/priority")
    public ResponseEntity<Map<String, Object>> updatePriority(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request
    ) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }

            Optional<FraudReport> reportOpt = fraudReportRepository.findById(id);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Fraud report not found"));
            }

            FraudReport report = reportOpt.get();
            String priorityStr = ((String) request.get("priority")).toUpperCase();
            try {
                FraudReport.ReportPriority newPriority = FraudReport.ReportPriority.valueOf(priorityStr);
                report.setPriority(newPriority);
                report = fraudReportRepository.save(report);
                return ResponseEntity.ok(toResponse(report));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid priority"));
            }
        } catch (Exception e) {
            logger.error("Error updating priority", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update priority"));
        }
    }

    /**
     * Delete report (admin only)
     * DELETE /api/fraud-reports/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFraudReport(@PathVariable("id") UUID id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }

            if (!fraudReportRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("error", "Fraud report not found"));
            }

            fraudReportRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Fraud report deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting fraud report", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete fraud report"));
        }
    }

    /**
     * Get statistics (admin only)
     * GET /api/fraud-reports/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if (user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("pending", fraudReportRepository.countByStatus(FraudReport.ReportStatus.PENDING));
            stats.put("underReview", fraudReportRepository.countByStatus(FraudReport.ReportStatus.UNDER_REVIEW));
            stats.put("resolved", fraudReportRepository.countByStatus(FraudReport.ReportStatus.RESOLVED));
            stats.put("dismissed", fraudReportRepository.countByStatus(FraudReport.ReportStatus.DISMISSED));
            stats.put("critical", fraudReportRepository.countByPriority(FraudReport.ReportPriority.CRITICAL));
            stats.put("high", fraudReportRepository.countByPriority(FraudReport.ReportPriority.HIGH));
            stats.put("medium", fraudReportRepository.countByPriority(FraudReport.ReportPriority.MEDIUM));
            stats.put("low", fraudReportRepository.countByPriority(FraudReport.ReportPriority.LOW));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching stats", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    // Helper methods
    private Map<String, Object> toResponse(FraudReport report) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", report.getId().toString());
        response.put("type", report.getType().name().toLowerCase());
        if (report.getJobId() != null) {
            response.put("jobId", report.getJobId().toString());
        }
        if (report.getEmployerId() != null) {
            response.put("employerId", report.getEmployerId().toString());
        }
        response.put("reporterId", report.getReporterId().toString());
        response.put("reporterName", report.getReporterName());
        response.put("reporterEmail", report.getReporterEmail());
        response.put("reason", report.getReason());
        response.put("description", report.getDescription());
        response.put("status", report.getStatus().name().toLowerCase());
        response.put("priority", report.getPriority().name().toLowerCase());
        if (report.getAdminNotes() != null) {
            response.put("adminNotes", report.getAdminNotes());
        }
        if (report.getEvidence() != null && !report.getEvidence().isEmpty()) {
            response.put("evidence", Arrays.asList(report.getEvidence().split(",")));
        }
        if (report.getResolvedAt() != null) {
            response.put("resolvedAt", report.getResolvedAt().toString());
        }
        response.put("createdAt", report.getCreatedAt().toString());
        if (report.getUpdatedAt() != null) {
            response.put("updatedAt", report.getUpdatedAt().toString());
        }
        return response;
    }
}

