package com.medexjob.controller;

import com.medexjob.entity.Application;
import com.medexjob.entity.Job;
import com.medexjob.entity.User;
import com.medexjob.entity.Notification;
import com.medexjob.entity.Employer;
import org.springframework.data.domain.PageImpl;
import com.medexjob.repository.ApplicationRepository;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.UserRepository;
import com.medexjob.repository.NotificationRepository;
import com.medexjob.service.NotificationService;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationController.class);
    
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final Path uploadPath = Paths.get("uploads");

    public ApplicationController(ApplicationRepository applicationRepository, JobRepository jobRepository, UserRepository userRepository, NotificationRepository notificationRepository, NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> apply(
            @RequestParam("jobId") UUID jobId,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("candidateEmail") String candidateEmail,
            @RequestParam("candidatePhone") String candidatePhone,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "notes", required = false) String notes
    ) {
        return jobRepository.findById(jobId)
                .map(job -> {
                    try {
                        // Extract candidateId from authenticated user if available
                        UUID candidateIdSet = null;
                        try {
                            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                            if (authentication != null && authentication.isAuthenticated()) {
                                String email = authentication.getName();
                                logger.info("🔐 Authenticated user email: {}", email);
                                Optional<User> userOpt = userRepository.findByEmail(email);
                                if (userOpt.isPresent()) {
                                    User user = userOpt.get();
                                    logger.info("👤 User found: {} (Role: {})", user.getId(), user.getRole());
                                    // Set candidateId if user is a candidate
                                    if (user.getRole() == User.UserRole.CANDIDATE) {
                                        candidateIdSet = user.getId();
                                        logger.info("✅ CandidateId set: {}", candidateIdSet);
                                    } else {
                                        logger.warn("⚠️ User is not a candidate, role: {}", user.getRole());
                                    }
                                } else {
                                    logger.warn("⚠️ User not found for email: {}", email);
                                }
                            } else {
                                logger.warn("⚠️ No authentication found in SecurityContext");
                            }
                        } catch (Exception e) {
                            logger.error("❌ Error extracting candidateId: {}", e.getMessage(), e);
                            // If authentication fails, continue without candidateId
                            // This allows applications from non-authenticated users (if needed)
                        }

                        // Check for duplicate application
                        boolean alreadyApplied = false;
                        String duplicateMessage = null;
                        
                        if (candidateIdSet != null) {
                            // Check by candidateId (for authenticated users)
                            alreadyApplied = applicationRepository.existsByJobIdAndCandidateId(jobId, candidateIdSet);
                            if (alreadyApplied) {
                                duplicateMessage = "You have already applied for this job.";
                                logger.warn("🚫 Duplicate application attempt: Candidate {} already applied for job {}", candidateIdSet, jobId);
                            }
                        } else {
                            // Check by email (for non-authenticated users or as fallback)
                            alreadyApplied = applicationRepository.existsByJobIdAndCandidateEmail(jobId, candidateEmail);
                            if (alreadyApplied) {
                                duplicateMessage = "An application with this email already exists for this job.";
                                logger.warn("🚫 Duplicate application attempt: Email {} already applied for job {}", candidateEmail, jobId);
                            }
                        }

                        if (alreadyApplied) {
                            Map<String, Object> error = new HashMap<>();
                            error.put("message", duplicateMessage);
                            error.put("status", "error");
                            error.put("errorCode", "DUPLICATE_APPLICATION");
                            logger.info("❌ Application rejected: {}", duplicateMessage);
                            return ResponseEntity.status(400).body(error);
                        }

                        Application application = new Application();
                        application.setJob(job);
                        application.setCandidateName(candidateName);
                        application.setCandidateEmail(candidateEmail);
                        application.setCandidatePhone(candidatePhone);
                        application.setNotes(notes);
                        application.setStatus(Application.ApplicationStatus.APPLIED);
                        if (candidateIdSet != null) {
                            application.setCandidateId(candidateIdSet);
                        }

                        // Handle resume upload
                        if (resume != null && !resume.isEmpty()) {
                            String fileName = UUID.randomUUID() + "_" + resume.getOriginalFilename();
                            Path filePath = uploadPath.resolve(fileName);
                            Files.copy(resume.getInputStream(), filePath);
                            application.setResumeUrl("/uploads/" + fileName);
                        }

                        Application saved = applicationRepository.save(application);
                        logger.info("💾 Application saved with ID: {}, CandidateId: {}, JobId: {}", 
                            saved.getId(), saved.getCandidateId(), saved.getJob().getId());

                        // Update job applications count
                        job.setApplicationsCount(job.getApplicationsCount() + 1);
                        jobRepository.save(job);
                        logger.info("📊 Updated job applications count: {}", job.getApplicationsCount());

                        // Create notification for employer
                        try {
                            Employer employer = job.getEmployer();
                            if (employer != null && employer.getUser() != null) {
                                UUID employerUserId = employer.getUser().getId();
                                notificationService.notifyEmployerApplicationReceived(
                                    employerUserId,
                                    job.getTitle(),
                                    candidateName,
                                    candidateEmail,
                                    job.getId(),
                                    saved.getId()
                                );
                            } else {
                                logger.warn("⚠️ Could not create notification: Employer or User is null for job: {}", job.getId());
                            }
                        } catch (Exception e) {
                            logger.error("❌ Error creating notification for employer: {}", e.getMessage(), e);
                            // Don't fail the application submission if notification fails
                        }

                        // Create notification for candidate (application submission confirmation)
                        try {
                            if (candidateIdSet != null) {
                                notificationService.notifyCandidateApplicationSubmitted(
                                    candidateIdSet,
                                    job.getTitle(),
                                    job.getId(),
                                    saved.getId()
                                );
                            }
                        } catch (Exception e) {
                            logger.error("❌ Error creating notification for candidate: {}", e.getMessage(), e);
                            // Don't fail the application submission if notification fails
                        }

                        Map<String, Object> response = new HashMap<>();
                        response.put("id", saved.getId().toString());
                        response.put("candidateId", saved.getCandidateId() != null ? saved.getCandidateId().toString() : null);
                        response.put("message", "Application submitted successfully!");
                        response.put("status", "success");
                        logger.info("✅ Application response sent: {}", response);
                        return ResponseEntity.ok(response);

                    } catch (IOException e) {
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Failed to upload resume");
                        error.put("status", "error");
                        return ResponseEntity.internalServerError().body(error);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "jobId", required = false) UUID jobId,
            @RequestParam(value = "candidateId", required = false) UUID candidateId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sort", defaultValue = "appliedDate,desc") String sort
    ) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                currentUser = userOpt.get();
            }
        }

        // Security validation: Candidates can only see their own applications
        if (currentUser != null && currentUser.getRole() == User.UserRole.CANDIDATE) {
            logger.info("🔍 Candidate requesting applications. Current user: {}, Requested candidateId: {}", 
                currentUser.getId(), candidateId);
            // If candidateId is provided, ensure it matches the current user's ID
            if (candidateId != null && !candidateId.equals(currentUser.getId())) {
                logger.warn("🚫 Unauthorized access attempt: Candidate {} tried to access applications for {}", 
                    currentUser.getId(), candidateId);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "You can only view your own applications");
                error.put("status", "error");
                return ResponseEntity.status(403).body(error);
            }
            // If no candidateId provided, automatically use current user's ID
            if (candidateId == null && jobId == null) {
                candidateId = currentUser.getId();
                logger.info("✅ Auto-setting candidateId to current user: {}", candidateId);
            }
        }

        String[] sortParts = sort.split(",");
        Sort.Direction dir = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<Application> result;
        List<Application> applicationsList = null;

        if (jobId != null) {
            logger.info("🔍 Fetching applications for jobId: {}", jobId);
            try {
                if (status != null) {
                    Application.ApplicationStatus appStatus = parseStatus(status);
                    // Use eager loading query to avoid LazyInitializationException
                    applicationsList = applicationRepository.findByJobIdAndStatusWithDetails(jobId, appStatus);
                    logger.info("📋 Found {} applications for job {} with status {}", applicationsList.size(), jobId, status);
                } else {
                    // Use eager loading query to avoid LazyInitializationException
                    applicationsList = applicationRepository.findByJobIdWithDetails(jobId);
                    logger.info("📋 Found {} applications for job {}", applicationsList.size(), jobId);
                }
                
                // Manual pagination for eager-loaded results
                int totalElements = applicationsList.size();
                int totalPages = (int) Math.ceil((double) totalElements / size);
                int start = page * size;
                int end = Math.min(start + size, totalElements);
                List<Application> paginatedList = start < totalElements ? applicationsList.subList(start, end) : new ArrayList<>();
                
                // Create a Page-like structure
                result = new org.springframework.data.domain.PageImpl<>(paginatedList, pageable, totalElements);
            } catch (Exception e) {
                logger.error("❌ Error fetching applications for job {}: {}", jobId, e.getMessage(), e);
                // Fallback to regular query if eager loading fails
                if (status != null) {
                    Application.ApplicationStatus appStatus = parseStatus(status);
                    result = applicationRepository.findByJobIdAndStatus(jobId, appStatus, pageable);
                } else {
                    result = applicationRepository.findByJobId(jobId, pageable);
                }
            }
        } else if (candidateId != null) {
            logger.info("🔍 Fetching applications for candidateId: {}", candidateId);
            if (status != null) {
                Application.ApplicationStatus appStatus = parseStatus(status);
                result = applicationRepository.findByCandidateIdAndStatus(candidateId, appStatus, pageable);
                logger.info("📋 Found {} applications for candidate {} with status {}", 
                    result.getTotalElements(), candidateId, status);
            } else {
                result = applicationRepository.findByCandidateId(candidateId, pageable);
                logger.info("📋 Found {} applications for candidate {}", 
                    result.getTotalElements(), candidateId);
            }
        } else if (status != null) {
            Application.ApplicationStatus appStatus = parseStatus(status);
            result = applicationRepository.findByStatus(appStatus, pageable);
        } else if (search != null && !search.isBlank()) {
            result = applicationRepository.searchApplications(search.trim(), pageable);
        } else {
            result = applicationRepository.findAll(pageable);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("content", result.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        body.put("page", result.getNumber());
        body.put("size", result.getSize());
        body.put("totalElements", result.getTotalElements());
        body.put("totalPages", result.getTotalPages());
        return ResponseEntity.ok(body);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request
    ) {
        return applicationRepository.findById(id)
                .map(application -> {
                    String statusStr = (String) request.get("status");
                    String notes = (String) request.get("notes");
                    String oldStatus = application.getStatus() != null ? application.getStatus().name() : null;

                    if (statusStr != null) {
                        Application.ApplicationStatus newStatus = parseStatus(statusStr);
                        application.setStatus(newStatus);
                    }

                    if (notes != null) {
                        application.setNotes(notes);
                    }

                    // Handle interview date for interview status
                    String interviewDateStr = null;
                    if ("interview".equals(statusStr) && request.containsKey("interviewDate")) {
                        interviewDateStr = (String) request.get("interviewDate");
                        try {
                            LocalDateTime interviewDate = LocalDateTime.parse(interviewDateStr);
                            application.setInterviewDate(interviewDate);
                        } catch (Exception e) {
                            // Handle parsing error
                        }
                    }

                    Application saved = applicationRepository.save(application);

                    // Create notifications for candidate when status changes
                    try {
                        if (statusStr != null && saved.getCandidateId() != null) {
                            String jobTitle = saved.getJob() != null ? saved.getJob().getTitle() : "Job";
                            UUID jobId = saved.getJob() != null ? saved.getJob().getId() : null;

                            // If status is INTERVIEW, send interview notification
                            if ("interview".equalsIgnoreCase(statusStr)) {
                                notificationService.notifyCandidateInterviewScheduled(
                                    saved.getCandidateId(),
                                    jobTitle,
                                    interviewDateStr != null ? interviewDateStr : 
                                        (saved.getInterviewDate() != null ? saved.getInterviewDate().toString() : "TBD"),
                                    jobId,
                                    saved.getId()
                                );
                            } else {
                                // Send status update notification
                                notificationService.notifyCandidateApplicationStatus(
                                    saved.getCandidateId(),
                                    jobTitle,
                                    statusStr,
                                    jobId,
                                    saved.getId()
                                );
                            }
                        }
                    } catch (Exception e) {
                        logger.error("❌ Error creating notification for candidate on status update: {}", e.getMessage(), e);
                        // Don't fail the status update if notification fails
                    }

                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        if (!applicationRepository.existsById(id)) return ResponseEntity.notFound().build();
        applicationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Application.ApplicationStatus parseStatus(String status) {
        if (status == null) return null;
        try {
            return Application.ApplicationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Application.ApplicationStatus.APPLIED;
        }
    }

    private Map<String, Object> toResponse(Application app) {
        Map<String, Object> m = new LinkedHashMap<>();
        try {
            m.put("id", app.getId().toString());
            
            // Safely access job with null checks
            Job job = app.getJob();
            if (job != null) {
                m.put("jobId", job.getId().toString());
                m.put("jobTitle", job.getTitle() != null ? job.getTitle() : "N/A");
                
                // Safely access employer with null checks
                try {
                    Employer employer = job.getEmployer();
                    m.put("jobOrganization", employer != null && employer.getCompanyName() != null 
                        ? employer.getCompanyName() : "N/A");
                } catch (Exception e) {
                    logger.warn("⚠️ Error accessing employer for job {}: {}", job.getId(), e.getMessage());
                    m.put("jobOrganization", "N/A");
                }
            } else {
                logger.warn("⚠️ Job is null for application {}", app.getId());
                m.put("jobId", "N/A");
                m.put("jobTitle", "N/A");
                m.put("jobOrganization", "N/A");
            }
            
            m.put("candidateId", app.getCandidateId() != null ? app.getCandidateId().toString() : null);
            m.put("candidateName", app.getCandidateName() != null ? app.getCandidateName() : "N/A");
            m.put("candidateEmail", app.getCandidateEmail() != null ? app.getCandidateEmail() : "N/A");
            m.put("candidatePhone", app.getCandidatePhone() != null ? app.getCandidatePhone() : "N/A");
            m.put("resumeUrl", app.getResumeUrl());
            m.put("status", app.getStatus() != null ? app.getStatus().name().toLowerCase() : "applied");
            m.put("notes", app.getNotes());
            m.put("interviewDate", app.getInterviewDate() != null ? app.getInterviewDate().toString() : null);
            m.put("appliedDate", app.getAppliedDate() != null ? app.getAppliedDate().toString() : null);
        } catch (Exception e) {
            logger.error("❌ Error creating application response for application {}: {}", app.getId(), e.getMessage(), e);
            // Return minimal response on error
            m.put("id", app.getId().toString());
            m.put("error", "Failed to load application details");
        }
        return m;
    }
}
