// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.Job;
import com.medexjob.entity.JobAlert;
import com.medexjob.entity.User;
import com.medexjob.repository.JobAlertRepository;
import com.medexjob.repository.JobRepository;
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
@RequestMapping("/api/job-alerts")
public class JobAlertController {

    private static final Logger logger = LoggerFactory.getLogger(JobAlertController.class);

    private final JobAlertRepository jobAlertRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobAlertController(
            JobAlertRepository jobAlertRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {
        this.jobAlertRepository = jobAlertRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create job alert
     * POST /api/job-alerts
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createJobAlert(@RequestBody Map<String, Object> request) {
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

            UUID userId = userOpt.get().getId();
            String name = (String) request.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Alert name is required"));
            }

            JobAlert alert = new JobAlert(userId, name);
            
            if (request.containsKey("keywords")) {
                alert.setKeywords(convertListToString((List<?>) request.get("keywords")));
            }
            if (request.containsKey("locations")) {
                alert.setLocations(convertListToString((List<?>) request.get("locations")));
            }
            if (request.containsKey("categories")) {
                alert.setCategories(convertListToString((List<?>) request.get("categories")));
            }
            if (request.containsKey("sectors")) {
                alert.setSectors(convertListToString((List<?>) request.get("sectors")));
            }
            if (request.containsKey("salaryRange")) {
                Map<String, Object> salaryRange = (Map<String, Object>) request.get("salaryRange");
                if (salaryRange.containsKey("min")) {
                    alert.setSalaryMin(((Number) salaryRange.get("min")).intValue());
                }
                if (salaryRange.containsKey("max")) {
                    alert.setSalaryMax(((Number) salaryRange.get("max")).intValue());
                }
            }
            if (request.containsKey("experience")) {
                alert.setExperience((String) request.get("experience"));
            }
            if (request.containsKey("frequency")) {
                String freqStr = ((String) request.get("frequency")).toUpperCase();
                try {
                    alert.setFrequency(JobAlert.AlertFrequency.valueOf(freqStr));
                } catch (IllegalArgumentException e) {
                    alert.setFrequency(JobAlert.AlertFrequency.DAILY);
                }
            }
            if (request.containsKey("active")) {
                alert.setActive((Boolean) request.get("active"));
            }

            alert = jobAlertRepository.save(alert);
            
            // Calculate initial match count
            int matches = findMatchingJobs(alert).size();
            alert.setMatchCount(matches);
            alert = jobAlertRepository.save(alert);

            return ResponseEntity.ok(toResponse(alert));
        } catch (Exception e) {
            logger.error("Error creating job alert", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create job alert"));
        }
    }

    /**
     * Get user's job alerts
     * GET /api/job-alerts
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getJobAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
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

            UUID userId = userOpt.get().getId();
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<JobAlert> alerts = jobAlertRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

            // Update match counts for all alerts
            List<JobAlert> updatedAlerts = alerts.getContent().stream()
                    .map(alert -> {
                        int matches = findMatchingJobs(alert).size();
                        if (matches != alert.getMatchCount()) {
                            alert.setMatchCount(matches);
                            return jobAlertRepository.save(alert);
                        }
                        return alert;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", updatedAlerts.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList()));
            response.put("page", alerts.getNumber());
            response.put("size", alerts.getSize());
            response.put("totalElements", alerts.getTotalElements());
            response.put("totalPages", alerts.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching job alerts", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch job alerts"));
        }
    }

    /**
     * Get specific alert
     * GET /api/job-alerts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getJobAlert(@PathVariable("id") UUID id) {
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

            UUID userId = userOpt.get().getId();
            Optional<JobAlert> alertOpt = jobAlertRepository.findById(id);

            if (alertOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job alert not found"));
            }

            JobAlert alert = alertOpt.get();
            if (!alert.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Update match count
            int matches = findMatchingJobs(alert).size();
            alert.setMatchCount(matches);
            alert = jobAlertRepository.save(alert);

            return ResponseEntity.ok(toResponse(alert));
        } catch (Exception e) {
            logger.error("Error fetching job alert", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch job alert"));
        }
    }

    /**
     * Update job alert
     * PUT /api/job-alerts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateJobAlert(
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

            UUID userId = userOpt.get().getId();
            Optional<JobAlert> alertOpt = jobAlertRepository.findById(id);

            if (alertOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job alert not found"));
            }

            JobAlert alert = alertOpt.get();
            if (!alert.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Update fields
            if (request.containsKey("name")) {
                alert.setName((String) request.get("name"));
            }
            if (request.containsKey("keywords")) {
                alert.setKeywords(convertListToString((List<?>) request.get("keywords")));
            }
            if (request.containsKey("locations")) {
                alert.setLocations(convertListToString((List<?>) request.get("locations")));
            }
            if (request.containsKey("categories")) {
                alert.setCategories(convertListToString((List<?>) request.get("categories")));
            }
            if (request.containsKey("sectors")) {
                alert.setSectors(convertListToString((List<?>) request.get("sectors")));
            }
            if (request.containsKey("salaryRange")) {
                Map<String, Object> salaryRange = (Map<String, Object>) request.get("salaryRange");
                if (salaryRange.containsKey("min")) {
                    alert.setSalaryMin(((Number) salaryRange.get("min")).intValue());
                }
                if (salaryRange.containsKey("max")) {
                    alert.setSalaryMax(((Number) salaryRange.get("max")).intValue());
                }
            }
            if (request.containsKey("experience")) {
                alert.setExperience((String) request.get("experience"));
            }
            if (request.containsKey("frequency")) {
                String freqStr = ((String) request.get("frequency")).toUpperCase();
                try {
                    alert.setFrequency(JobAlert.AlertFrequency.valueOf(freqStr));
                } catch (IllegalArgumentException e) {
                    // Keep existing frequency
                }
            }
            if (request.containsKey("active")) {
                alert.setActive((Boolean) request.get("active"));
            }

            alert = jobAlertRepository.save(alert);
            
            // Update match count
            int matches = findMatchingJobs(alert).size();
            alert.setMatchCount(matches);
            alert = jobAlertRepository.save(alert);

            return ResponseEntity.ok(toResponse(alert));
        } catch (Exception e) {
            logger.error("Error updating job alert", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update job alert"));
        }
    }

    /**
     * Delete job alert
     * DELETE /api/job-alerts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteJobAlert(@PathVariable("id") UUID id) {
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

            UUID userId = userOpt.get().getId();
            Optional<JobAlert> alertOpt = jobAlertRepository.findById(id);

            if (alertOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job alert not found"));
            }

            JobAlert alert = alertOpt.get();
            if (!alert.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            jobAlertRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Job alert deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting job alert", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete job alert"));
        }
    }

    /**
     * Match jobs with alerts (for background job or manual trigger)
     * POST /api/job-alerts/match
     */
    @PostMapping("/match")
    public ResponseEntity<Map<String, Object>> matchJobs() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            // This could be admin-only or allow users to trigger their own alerts
            List<JobAlert> activeAlerts = jobAlertRepository.findByActiveTrue();
            int totalMatches = 0;

            for (JobAlert alert : activeAlerts) {
                List<Job> matchingJobs = findMatchingJobs(alert);
                alert.setMatchCount(matchingJobs.size());
                jobAlertRepository.save(alert);
                totalMatches += matchingJobs.size();
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Job matching completed",
                    "alertsProcessed", activeAlerts.size(),
                    "totalMatches", totalMatches
            ));
        } catch (Exception e) {
            logger.error("Error matching jobs", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to match jobs"));
        }
    }

    /**
     * Get matching jobs for an alert
     * GET /api/job-alerts/{id}/matches
     */
    @GetMapping("/{id}/matches")
    public ResponseEntity<Map<String, Object>> getMatchingJobs(
            @PathVariable("id") UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
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

            UUID userId = userOpt.get().getId();
            Optional<JobAlert> alertOpt = jobAlertRepository.findById(id);

            if (alertOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job alert not found"));
            }

            JobAlert alert = alertOpt.get();
            if (!alert.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<Job> matchingJobs = findMatchingJobs(alert);
            
            // Paginate results
            int start = page * size;
            int end = Math.min(start + size, matchingJobs.size());
            List<Job> paginatedJobs = matchingJobs.subList(start, end);

            Map<String, Object> response = new HashMap<>();
            response.put("content", paginatedJobs.stream()
                    .map(this::jobToResponse)
                    .collect(Collectors.toList()));
            response.put("page", page);
            response.put("size", size);
            response.put("totalElements", matchingJobs.size());
            response.put("totalPages", (int) Math.ceil((double) matchingJobs.size() / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching matching jobs", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch matching jobs"));
        }
    }

    // Helper method to find matching jobs
    private List<Job> findMatchingJobs(JobAlert alert) {
        List<Job> allJobs = jobRepository.findAll();
        List<Job> matchingJobs = new ArrayList<>();

        for (Job job : allJobs) {
            if (job.getStatus() != Job.JobStatus.ACTIVE) {
                continue;
            }

            boolean matches = true;

            // Check sectors
            if (alert.getSectors() != null && !alert.getSectors().isEmpty()) {
                List<String> sectors = parseStringToList(alert.getSectors());
                if (!sectors.isEmpty() && !sectors.contains(job.getSector().name().toLowerCase())) {
                    matches = false;
                }
            }

            // Check categories
            if (alert.getCategories() != null && !alert.getCategories().isEmpty()) {
                List<String> categories = parseStringToList(alert.getCategories());
                if (!categories.isEmpty() && !categories.contains(job.getCategory().name())) {
                    matches = false;
                }
            }

            // Check locations
            if (alert.getLocations() != null && !alert.getLocations().isEmpty()) {
                List<String> locations = parseStringToList(alert.getLocations());
                if (!locations.isEmpty()) {
                    boolean locationMatch = locations.stream()
                            .anyMatch(loc -> job.getLocation().toLowerCase().contains(loc.toLowerCase()) ||
                                          loc.toLowerCase().contains(job.getLocation().toLowerCase()));
                    if (!locationMatch) {
                        matches = false;
                    }
                }
            }

            // Check keywords
            if (alert.getKeywords() != null && !alert.getKeywords().isEmpty()) {
                List<String> keywords = parseStringToList(alert.getKeywords());
                if (!keywords.isEmpty()) {
                    String jobText = (job.getTitle() + " " + job.getDescription()).toLowerCase();
                    boolean keywordMatch = keywords.stream()
                            .anyMatch(keyword -> jobText.contains(keyword.toLowerCase()));
                    if (!keywordMatch) {
                        matches = false;
                    }
                }
            }

            // Check salary range (basic check - can be enhanced)
            if (alert.getSalaryMin() != null || alert.getSalaryMax() != null) {
                // This is a simplified check - actual salary parsing would be more complex
                // For now, we'll skip salary matching if salary range is provided
            }

            if (matches) {
                matchingJobs.add(job);
            }
        }

        return matchingJobs;
    }

    // Helper methods
    private String convertListToString(List<?> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
    }

    private List<String> parseStringToList(String str) {
        if (str == null || str.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private Map<String, Object> toResponse(JobAlert alert) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", alert.getId().toString());
        response.put("userId", alert.getUserId().toString());
        response.put("name", alert.getName());
        response.put("keywords", parseStringToList(alert.getKeywords()));
        response.put("locations", parseStringToList(alert.getLocations()));
        response.put("categories", parseStringToList(alert.getCategories()));
        response.put("sectors", parseStringToList(alert.getSectors()));
        if (alert.getSalaryMin() != null || alert.getSalaryMax() != null) {
            Map<String, Integer> salaryRange = new HashMap<>();
            if (alert.getSalaryMin() != null) salaryRange.put("min", alert.getSalaryMin());
            if (alert.getSalaryMax() != null) salaryRange.put("max", alert.getSalaryMax());
            response.put("salaryRange", salaryRange);
        }
        response.put("experience", alert.getExperience());
        response.put("frequency", alert.getFrequency().name().toLowerCase());
        response.put("active", alert.getActive());
        if (alert.getLastSent() != null) {
            response.put("lastSent", alert.getLastSent().toString());
        }
        response.put("matches", alert.getMatchCount());
        response.put("createdAt", alert.getCreatedAt().toString());
        if (alert.getUpdatedAt() != null) {
            response.put("updatedAt", alert.getUpdatedAt().toString());
        }
        return response;
    }

    private Map<String, Object> jobToResponse(Job job) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", job.getId().toString());
        response.put("title", job.getTitle());
        response.put("organization", job.getEmployer() != null ? job.getEmployer().getCompanyName() : "");
        response.put("sector", job.getSector().name().toLowerCase());
        response.put("category", job.getCategory().name());
        response.put("location", job.getLocation());
        response.put("salary", job.getSalaryRange());
        response.put("experience", job.getExperience());
        response.put("lastDate", job.getLastDate().toString());
        response.put("status", job.getStatus().name().toLowerCase());
        return response;
    }
}

