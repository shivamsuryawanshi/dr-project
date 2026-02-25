package com.medexjob.controller;

import com.medexjob.entity.Employer;
import com.medexjob.entity.User;
import com.medexjob.entity.Subscription;
import com.medexjob.repository.UserRepository;
import com.medexjob.entity.Job;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.EmployerRepository;
import com.medexjob.repository.SubscriptionRepository;
import com.medexjob.service.NotificationService;
import com.medexjob.service.JobSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*; // Contains @CrossOrigin

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private static final Logger logger = LoggerFactory.getLogger(JobController.class);
    
    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository; // Inject UserRepository
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationService notificationService;
    private final JobSearchService jobSearchService;

    public JobController(JobRepository jobRepository, EmployerRepository employerRepository, UserRepository userRepository, SubscriptionRepository subscriptionRepository, NotificationService notificationService, JobSearchService jobSearchService) {
        this.jobRepository = jobRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.notificationService = notificationService;
        this.jobSearchService = jobSearchService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sector", required = false) String sector,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "experienceLevel", required = false) String experienceLevel,
            @RequestParam(value = "speciality", required = false) String speciality,
            @RequestParam(value = "dutyType", required = false) String dutyType,
            @RequestParam(value = "status", required = false) String status, // Added status parameter
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sort", defaultValue = "createdAt,desc") String sort
    ) {
        // DEBUG: Log all incoming parameters
        logger.info("=== JOB LIST REQUEST ===");
        logger.info("search: '{}' (length: {})", search, search != null ? search.length() : 0);
        logger.info("location: '{}' (length: {})", location, location != null ? location.length() : 0);
        logger.info("sector: '{}', category: '{}', status: '{}'", sector, category, status);
        logger.info("featured: {}, page: {}, size: {}", featured, page, size);
        
        String[] sortParts = sort.split(",");
        Sort.Direction dir = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<Job> result;

        // Parse status filter: 
        // - If status is 'all', set statusFilter to null to return all jobs
        // - If status is null (not provided), default to ACTIVE for public listing
        // - Otherwise, use the provided status
        Job.JobStatus statusFilter = null;
        if (status != null && !status.equalsIgnoreCase("all")) {
            statusFilter = parseStatus(status);
        } else if (status == null) {
            // Default to ACTIVE when status is not provided (for public job listing)
            statusFilter = Job.JobStatus.ACTIVE;
        }
        logger.info("Parsed status filter: {}", statusFilter);

        Job.ExperienceLevel expLevel = (experienceLevel != null && !experienceLevel.isBlank()) ? parseExperienceLevel(experienceLevel) : null;
        Job.DutyType duty = (dutyType != null && !dutyType.isBlank()) ? parseDutyType(dutyType) : null;

        if (Boolean.TRUE.equals(featured)) {
            logger.info("Fetching featured jobs");
            result = jobRepository.findByIsFeaturedTrueAndStatus(statusFilter != null ? statusFilter : Job.JobStatus.ACTIVE, pageable);
        } else if (search != null && !search.isBlank()) {
            // Use enhanced search service for powerful Google/YouTube-like search
            logger.info("Using search service with query: '{}', location: '{}'", search.trim(), location);
            result = jobSearchService.searchJobsAdvanced(search.trim(), location != null ? location.trim() : null, statusFilter, pageable);
        } else if (sector != null || category != null || location != null || expLevel != null || speciality != null || duty != null) {
            Job.JobSector s = (sector != null && !sector.isBlank()) ? parseSector(sector) : null;
            Job.JobCategory c = (category != null && !category.isBlank()) ? mapCategoryFromLabel(category) : null;
            logger.info("Fetching by criteria - sector: {}, category: {}, location: {}", s, c, location);
            result = jobRepository.findJobsByCriteria(s, c, location, expLevel, speciality, duty, statusFilter, pageable);
        } else {
            logger.info("Fetching all jobs with status filter: {}", statusFilter);
            result = statusFilter != null ? jobRepository.findByStatus(statusFilter, pageable) : jobRepository.findAll(pageable);
        }

        logger.info("=== RESULT: {} jobs found ===", result.getTotalElements());
        
        Map<String, Object> body = new HashMap<>();
        body.put("content", result.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        body.put("page", result.getNumber());
        body.put("size", result.getSize());
        body.put("totalElements", result.getTotalElements());
        body.put("totalPages", result.getTotalPages());
        return ResponseEntity.ok(body);
    }

    // Get jobs by employer ID
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<Map<String, Object>> getJobsByEmployer(
            @PathVariable UUID employerId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "1000") int size
    ) {
        try {
            // Parse status filter if provided - make it final for lambda
            final Job.JobStatus statusFilter = (status != null && !status.equalsIgnoreCase("all")) 
                ? parseStatus(status) : null;
            
            List<Job> allJobs = jobRepository.findByEmployerId(employerId);
            
            // Filter by status if provided
            List<Job> filteredJobs = statusFilter != null 
                ? allJobs.stream()
                    .filter(job -> job.getStatus() == statusFilter)
                    .collect(Collectors.toList())
                : allJobs;
            
            // Manual pagination
            int totalElements = filteredJobs.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int start = page * size;
            int end = Math.min(start + size, totalElements);
            List<Job> paginatedJobs = start < totalElements ? filteredJobs.subList(start, end) : new ArrayList<>();
            
            Map<String, Object> body = new HashMap<>();
            body.put("content", paginatedJobs.stream().map(this::toResponse).collect(Collectors.toList()));
            body.put("page", page);
            body.put("size", size);
            body.put("totalElements", totalElements);
            body.put("totalPages", totalPages);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            logger.error("Error fetching jobs for employer: {}", employerId, e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch jobs: " + e.getMessage()));
        }
    }

    // Diagnostics: quick check for DB connectivity and basic listing
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> body = new HashMap<>();
        try {
            long total = jobRepository.count();
            body.put("ok", true);
            body.put("totalJobs", total);
            // Try fetching a small page to validate basic query and mapping
            Page<Job> page = jobRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt")));
            body.put("sample", page.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            body.put("ok", false);
            body.put("error", ex.getClass().getName());
            body.put("message", ex.getMessage());
            return ResponseEntity.internalServerError().body(body);
        }
    }

    // Get all job search options (titles + company names) for dropdown
    @GetMapping("/options")
    public ResponseEntity<Map<String, Object>> getJobOptions() {
        logger.info("=== FETCHING JOB OPTIONS ===");
        
        try {
            // Get all distinct job titles from active jobs
            List<String> titles = jobRepository.findAllDistinctTitles();
            logger.info("Found {} distinct job titles: {}", titles.size(), titles);
            
            // Get all distinct company names from active jobs
            List<String> companies = jobRepository.findAllDistinctCompanyNames();
            logger.info("Found {} distinct company names: {}", companies.size(), companies);
            
            // Sort alphabetically
            titles.sort(String.CASE_INSENSITIVE_ORDER);
            companies.sort(String.CASE_INSENSITIVE_ORDER);
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("titles", titles);
            response.put("companies", companies);
            
            // Also include total active jobs count for debugging
            long activeJobsCount = jobRepository.countByStatus(Job.JobStatus.ACTIVE);
            response.put("_debug_activeJobsCount", activeJobsCount);
            
            logger.info("Returning {} titles and {} companies for job options (active jobs: {})", 
                titles.size(), companies.size(), activeJobsCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching job options: {}", e.getMessage(), e);
            Map<String, Object> emptyResponse = new LinkedHashMap<>();
            emptyResponse.put("titles", Collections.emptyList());
            emptyResponse.put("companies", Collections.emptyList());
            emptyResponse.put("_debug_error", e.getMessage());
            return ResponseEntity.ok(emptyResponse);
        }
    }
    
    // Debug endpoint to test search directly
    @GetMapping("/debug-search")
    public ResponseEntity<Map<String, Object>> debugSearch(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "location", required = false) String location
    ) {
        logger.info("=== DEBUG SEARCH ===");
        logger.info("Query: '{}', Location: '{}'", query, location);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("receivedQuery", query);
        response.put("receivedLocation", location);
        response.put("queryLength", query != null ? query.length() : 0);
        response.put("queryBytes", query != null ? Arrays.toString(query.getBytes()) : null);
        
        try {
            // Test 1: Count all jobs by status
            long activeCount = jobRepository.countByStatus(Job.JobStatus.ACTIVE);
            long pendingCount = jobRepository.countByStatus(Job.JobStatus.PENDING);
            long draftCount = jobRepository.countByStatus(Job.JobStatus.DRAFT);
            long closedCount = jobRepository.countByStatus(Job.JobStatus.CLOSED);
            response.put("jobCounts", Map.of(
                "ACTIVE", activeCount,
                "PENDING", pendingCount,
                "DRAFT", draftCount,
                "CLOSED", closedCount,
                "TOTAL", jobRepository.count()
            ));
            
            // Test 2: Get ALL job titles (not just distinct) to see what's in DB
            List<String> allTitles = jobRepository.findAllDistinctTitles();
            response.put("allDistinctTitles", allTitles);
            response.put("titleCount", allTitles.size());
            
            // Test 3: Get sample of ALL jobs (regardless of status)
            Pageable samplePageable = PageRequest.of(0, 5);
            Page<Job> allJobsSample = jobRepository.findAll(samplePageable);
            List<Map<String, Object>> allJobsInfo = allJobsSample.getContent().stream()
                .map(j -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", j.getId().toString());
                    m.put("title", j.getTitle());
                    m.put("titleLength", j.getTitle() != null ? j.getTitle().length() : 0);
                    m.put("titleBytes", j.getTitle() != null ? Arrays.toString(j.getTitle().getBytes()) : null);
                    m.put("status", j.getStatus().name());
                    m.put("company", j.getEmployer() != null ? j.getEmployer().getCompanyName() : "N/A");
                    return m;
                })
                .collect(Collectors.toList());
            response.put("sampleJobs", allJobsInfo);
            
            // Test 4: If query provided, test search
            if (query != null && !query.isBlank()) {
                String trimmedQuery = query.trim();
                Pageable pageable = PageRequest.of(0, 10);
                
                // Test with ACTIVE status
                Page<Job> searchResultActive = jobRepository.searchJobs(trimmedQuery, Job.JobStatus.ACTIVE, pageable);
                response.put("searchResultActiveCount", searchResultActive.getTotalElements());
                
                // Test with NULL status (all jobs)
                Page<Job> searchResultAll = jobRepository.searchJobs(trimmedQuery, null, pageable);
                response.put("searchResultAllCount", searchResultAll.getTotalElements());
                
                List<Map<String, String>> foundJobs = searchResultActive.getContent().stream()
                    .map(j -> {
                        Map<String, String> m = new LinkedHashMap<>();
                        m.put("title", j.getTitle());
                        m.put("company", j.getEmployer() != null ? j.getEmployer().getCompanyName() : "N/A");
                        m.put("status", j.getStatus().name());
                        return m;
                    })
                    .collect(Collectors.toList());
                response.put("foundJobsActive", foundJobs);
                
                // Test 5: Check if exact title exists (case-insensitive)
                boolean exactTitleExists = allTitles.stream()
                    .anyMatch(t -> t.equalsIgnoreCase(trimmedQuery));
                response.put("exactTitleExistsInActive", exactTitleExists);
                
                // Test 6: Check character-by-character comparison
                if (!allTitles.isEmpty()) {
                    String firstTitle = allTitles.get(0);
                    response.put("firstTitleFromDB", firstTitle);
                    response.put("firstTitleLength", firstTitle.length());
                    response.put("queryEqualsFirstTitle", trimmedQuery.equalsIgnoreCase(firstTitle));
                    response.put("queryContainsInFirstTitle", firstTitle.toLowerCase().contains(trimmedQuery.toLowerCase()));
                }
            }
            
            logger.info("Debug search response: {}", response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Debug search error: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getName());
            response.put("stackTrace", Arrays.toString(e.getStackTrace()).substring(0, Math.min(500, Arrays.toString(e.getStackTrace()).length())));
            return ResponseEntity.ok(response);
        }
    }

    // Jobs Meta: categories and locations
    @GetMapping("/meta")
    public ResponseEntity<Map<String, Object>> meta() {
        List<String> categories = jobRepository.findDistinctCategories().stream()
                .map(this::mapCategoryToLabel)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        List<String> locations = jobRepository.findDistinctLocations().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        Map<String, Object> body = new HashMap<>();
        body.put("categories", categories);
        body.put("locations", locations);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> detail(@PathVariable("id") UUID id) {
        return jobRepository.findById(id)
                .filter(j -> j.getStatus() == Job.JobStatus.ACTIVE || j.getStatus() == Job.JobStatus.DRAFT)
                .map(j -> ResponseEntity.ok(toResponse(j)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Increment view count when a candidate views a job
    @PostMapping("/{id}/view")
    public ResponseEntity<Map<String, Object>> incrementView(@PathVariable("id") UUID id) {
        try {
            Optional<Job> jobOpt = jobRepository.findById(id);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Job job = jobOpt.get();
            
            // Only increment views for ACTIVE jobs
            if (job.getStatus() != Job.JobStatus.ACTIVE) {
                return ResponseEntity.ok(Map.of("message", "View not incremented for non-active job", "views", job.getViews()));
            }
            
            // Increment view count
            job.setViews(job.getViews() + 1);
            Job saved = jobRepository.save(job);
            
            logger.info("View count incremented for job: {} (new count: {})", id, saved.getViews());
            
            return ResponseEntity.ok(Map.of("message", "View count incremented", "views", saved.getViews()));
        } catch (Exception e) {
            logger.error("Error incrementing view count for job: {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to increment view count: " + e.getMessage()));
        }
    }

    // Employer: Create Job (with subscription validation)
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody JobRequest req) {
        try {
            logger.info("Job creation request received. Title: {}", req.title());
            
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated job creation attempt");
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized. Please login to post jobs."));
            }

            String email = authentication.getName();
            logger.info("Authenticated user email: {}", email);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                logger.warn("User not found for email: {}", email);
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            logger.info("User found: {} with role: {}", user.getEmail(), user.getRole());

            // Admin can bypass subscription check
            if (user.getRole() != User.UserRole.ADMIN) {
                // Check if user is EMPLOYER
                if (user.getRole() != User.UserRole.EMPLOYER) {
                    logger.warn("Non-employer user {} attempted to post job", user.getEmail());
                    return ResponseEntity.status(403).body(Map.of("error", "Only employers can post jobs. Please register as an employer."));
                }

                // Find employer for this user
                Optional<Employer> employerOpt = employerRepository.findByUserId(user.getId());
                Employer employer;
                
                if (employerOpt.isEmpty()) {
                    // Check if user has active subscription - if yes, auto-create and verify employer
                    Optional<Subscription> subscriptionCheck = subscriptionRepository.findActiveSubscriptionByUser(user.getId(), LocalDate.now());
                    if (subscriptionCheck.isPresent() && subscriptionCheck.get().getStatus() == Subscription.SubscriptionStatus.ACTIVE) {
                        // Auto-create and verify employer since they have active subscription
                        logger.info("Auto-creating employer for user {} with active subscription", user.getEmail());
                        employer = new Employer();
                        employer.setUser(user);
                        employer.setCompanyName(user.getName() + " Company");
                        employer.setCompanyType(Employer.CompanyType.HOSPITAL);
                        employer.setIsVerified(true);
                        employer.setVerificationStatus(Employer.VerificationStatus.APPROVED);
                        employer.setVerifiedAt(LocalDateTime.now());
                        employer.setVerificationNotes("Auto-created and verified - has active subscription");
                        employer = employerRepository.save(employer);
                        logger.info("Auto-created and verified employer {} for user {}", employer.getId(), user.getEmail());
                    } else {
                        logger.warn("Employer profile not found for user: {} and no active subscription", user.getEmail());
                        return ResponseEntity.status(404).body(Map.of("error", "Employer profile not found. Please complete employer verification first."));
                    }
                } else {
                    employer = employerOpt.get();
                    logger.info("Employer found: {} - Verified: {}, Status: {}", 
                        employer.getCompanyName(), employer.getIsVerified(), employer.getVerificationStatus());

                    // Check if employer is verified - if not, check if they have active subscription
                    if (!employer.getIsVerified() || employer.getVerificationStatus() != Employer.VerificationStatus.APPROVED) {
                        // Check if user has active subscription - if yes, auto-verify
                        Optional<Subscription> subscriptionCheck = subscriptionRepository.findActiveSubscriptionByUser(user.getId(), LocalDate.now());
                        if (subscriptionCheck.isPresent() && subscriptionCheck.get().getStatus() == Subscription.SubscriptionStatus.ACTIVE) {
                            logger.info("Auto-verifying employer {} for user {} with active subscription", employer.getId(), user.getEmail());
                            employer.setIsVerified(true);
                            employer.setVerificationStatus(Employer.VerificationStatus.APPROVED);
                            employer.setVerifiedAt(LocalDateTime.now());
                            employer.setVerificationNotes("Auto-verified - has active subscription");
                            employer = employerRepository.save(employer);
                            logger.info("Auto-verified employer {} for user {}", employer.getId(), user.getEmail());
                        } else {
                            logger.warn("Employer {} is not verified and no active subscription. isVerified: {}, status: {}", 
                                employer.getId(), employer.getIsVerified(), employer.getVerificationStatus());
                            return ResponseEntity.status(403).body(Map.of("error", "Your employer account is not verified. Please complete verification first."));
                        }
                    }
                }

                // Check for active subscription
                Optional<Subscription> subscriptionOpt = subscriptionRepository.findActiveSubscriptionByUser(user.getId(), LocalDate.now());
                if (subscriptionOpt.isEmpty()) {
                    logger.warn("No active subscription found for user: {}", user.getEmail());
                    return ResponseEntity.status(403).body(Map.of(
                        "error", "No active subscription found. Please purchase a subscription plan to post jobs.",
                        "redirectTo", "/subscription"
                    ));
                }

                Subscription subscription = subscriptionOpt.get();
                logger.info("Subscription found: {} - Status: {}, Used: {}/{}, Plan: {}", 
                    subscription.getId(), subscription.getStatus(), 
                    subscription.getJobPostsUsed(), subscription.getPlan().getJobPostsAllowed(),
                    subscription.getPlan().getName());

                // Check if subscription is active
                if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
                    logger.warn("Subscription {} is not active. Status: {}", subscription.getId(), subscription.getStatus());
                    return ResponseEntity.status(403).body(Map.of(
                        "error", "Your subscription is not active. Please renew your subscription.",
                        "redirectTo", "/subscription"
                    ));
                }

                // Check job posting limit
                Integer jobPostsUsed = subscription.getJobPostsUsed();
                Integer jobPostsAllowed = subscription.getPlan().getJobPostsAllowed();
                logger.info("Job posting check: Used={}, Allowed={}", jobPostsUsed, jobPostsAllowed);

                if (jobPostsUsed >= jobPostsAllowed) {
                    logger.warn("Job posting limit reached for user: {}. Used: {}/{}", 
                        user.getEmail(), jobPostsUsed, jobPostsAllowed);
                    return ResponseEntity.status(403).body(Map.of(
                        "error", String.format("You have reached your job posting limit (%d/%d). Please upgrade your plan to post more jobs.", jobPostsUsed, jobPostsAllowed),
                        "redirectTo", "/subscription",
                        "used", jobPostsUsed,
                        "allowed", jobPostsAllowed
                    ));
                }

                // Create job and associate with employer
                logger.info("All checks passed. Creating job for employer: {}", employer.getCompanyName());
                Job job = new Job();
                job.setEmployer(employer);
                applyRequestToJob(req, job, employer);
                
                // If employer is verified, automatically approve the job (set status to ACTIVE)
                // Otherwise, set to PENDING for admin approval
                Job.JobStatus initialStatus;
                if (employer.getIsVerified() && employer.getVerificationStatus() == Employer.VerificationStatus.APPROVED) {
                    job.setStatus(Job.JobStatus.ACTIVE);
                    job.setApprovedAt(LocalDateTime.now());
                    // Set approved by as the employer user (self-approved for verified employers)
                    job.setApprovedBy(user);
                    initialStatus = Job.JobStatus.ACTIVE;
                    logger.info("Job automatically approved (ACTIVE) for verified employer: {}", employer.getCompanyName());
                } else {
                    // This should not happen as we check verification above, but keeping as fallback
                    initialStatus = parseStatus(req.status() != null ? req.status() : "pending");
                    job.setStatus(initialStatus);
                    logger.warn("Job set to PENDING for unverified employer: {}", employer.getCompanyName());
                }
                
                job.setIsFeatured(Boolean.TRUE.equals(req.featured()));
                job.setViews(Optional.ofNullable(req.views()).orElse(0));
                job.setApplicationsCount(Optional.ofNullable(req.applications()).orElse(0));
                Job saved = jobRepository.save(job);
                logger.info("Job created successfully: {} for employer: {} with status: {}", 
                    saved.getId(), employer.getCompanyName(), saved.getStatus());

                // Notify employer about job status
                try {
                    if (employer.getUser() != null) {
                        notificationService.notifyEmployerJobStatus(
                            employer.getUser().getId(),
                            saved.getTitle(),
                            saved.getStatus().name(),
                            saved.getId()
                        );
                    }
                } catch (Exception e) {
                    logger.error("❌ Error creating job status notification: {}", e.getMessage(), e);
                }

                // Notify admin if job is pending approval
                if (initialStatus == Job.JobStatus.PENDING) {
                    try {
                        notificationService.notifyAdminPendingApproval(
                            "job_pending",
                            String.format("New job '%s' from %s is pending approval", saved.getTitle(), employer.getCompanyName()),
                            saved.getId()
                        );
                    } catch (Exception e) {
                        logger.error("❌ Error creating admin notification: {}", e.getMessage(), e);
                    }
                }

                // Increment job posts used
                subscription.setJobPostsUsed(jobPostsUsed + 1);
                subscriptionRepository.save(subscription);
                logger.info("Updated job posts used: {}/{}", jobPostsUsed + 1, jobPostsAllowed);

                return ResponseEntity.ok(toResponse(saved));
            } else {
                // Admin can post jobs without subscription (for admin-posted jobs)
                Job job = new Job();
                applyRequestToJob(req, job, null);
                job.setStatus(parseStatus(req.status()));
                job.setIsFeatured(Boolean.TRUE.equals(req.featured()));
                job.setViews(Optional.ofNullable(req.views()).orElse(0));
                job.setApplicationsCount(Optional.ofNullable(req.applications()).orElse(0));
                Job saved = jobRepository.save(job);
                return ResponseEntity.ok(toResponse(saved));
            }
        } catch (Exception e) {
            logger.error("Error creating job", e);
            logger.error("Exception type: {}, Message: {}", e.getClass().getName(), e.getMessage());
            if (e.getCause() != null) {
                logger.error("Cause: {}", e.getCause().getMessage());
            }
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create job: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Admin: Update Job
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") UUID id, @RequestBody JobRequest req) {
        return jobRepository.findById(id)
                .map(existing -> {
                    Job.JobStatus oldStatus = existing.getStatus();
                    
                    // Get existing employer or resolve/create new one
                    Employer employer = existing.getEmployer();
                    if (employer == null) {
                        employer = resolveOrCreateEmployer(req.organization(), req.type());
                    }
                    applyRequestToJob(req, existing, employer);
                    if (req.status() != null) existing.setStatus(parseStatus(req.status()));
                    if (req.featured() != null) existing.setIsFeatured(req.featured());
                    if (req.views() != null) existing.setViews(req.views());
                    if (req.applications() != null) existing.setApplicationsCount(req.applications());
                    
                    // If status changed to ACTIVE, set approval info
                    if (req.status() != null && parseStatus(req.status()) == Job.JobStatus.ACTIVE && oldStatus != Job.JobStatus.ACTIVE) {
                        existing.setApprovedAt(LocalDateTime.now());
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        if (auth != null) {
                            Optional<User> adminUser = userRepository.findByEmail(auth.getName());
                            adminUser.ifPresent(existing::setApprovedBy);
                        }
                    }
                    
                    Job saved = jobRepository.save(existing);
                    
                    // Notify employer if status changed
                    if (req.status() != null && saved.getStatus() != oldStatus && employer.getUser() != null) {
                        try {
                            notificationService.notifyEmployerJobStatus(
                                employer.getUser().getId(),
                                saved.getTitle(),
                                saved.getStatus().name(),
                                saved.getId()
                            );
                        } catch (Exception e) {
                            logger.error("❌ Error creating job status notification: {}", e.getMessage(), e);
                        }
                    }
                    
                    return ResponseEntity.ok(toResponse(saved));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: Delete Job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        if (!jobRepository.existsById(id)) return ResponseEntity.notFound().build();
        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper: map request onto entity
    private void applyRequestToJob(JobRequest req, Job job, Employer employer) {
        // If employer is provided (from authenticated user), use it; otherwise resolve/create
        if (employer != null) {
            job.setEmployer(employer);
        } else {
            // For admin-posted jobs, resolve or create employer
            Employer resolvedEmployer = resolveOrCreateEmployer(req.organization(), req.type());
            job.setEmployer(resolvedEmployer);
        }

        job.setTitle(req.title());
        job.setDescription(Optional.ofNullable(req.description()).orElse(""));
        job.setSector(parseSector(req.sector()));
        job.setCategory(mapCategoryFromLabel(Optional.ofNullable(req.category()).orElse("")));
        job.setLocation(Optional.ofNullable(req.location()).orElse(""));
        job.setQualification(Optional.ofNullable(req.qualification()).orElse(""));
        job.setExperience(Optional.ofNullable(req.experience()).orElse(""));
        job.setExperienceLevel(req.experienceLevel() != null ? parseExperienceLevel(req.experienceLevel()) : null);
        job.setSpeciality(Optional.ofNullable(req.speciality()).orElse(""));
        job.setDutyType(req.dutyType() != null ? parseDutyType(req.dutyType()) : null);
        job.setNumberOfPosts(Optional.ofNullable(req.numberOfPosts()).orElse(1));
        job.setSalaryRange(req.salary());
        job.setPdfUrl(req.pdfUrl());
        job.setApplyLink(req.applyLink());
        job.setRequirements(req.requirements()); // Set requirements
        job.setBenefits(req.benefits()); // Set benefits
        if (req.lastDate() != null && !req.lastDate().isBlank()) {
            try { job.setLastDate(java.time.LocalDate.parse(req.lastDate())); } catch (Exception ignored) {}
        }
        // Contact details
        job.setContactEmail(Optional.ofNullable(req.contactEmail()).orElse("noreply@medexjob.com"));
        job.setContactPhone(Optional.ofNullable(req.contactPhone()).orElse(""));
    }

    private Employer resolveOrCreateEmployer(String organization, String type) {
        String companyName = Optional.ofNullable(organization).orElse("MedExJob Admin Posted");

        // 1. Try to find an existing employer by company name
        Optional<Employer> existingEmployer = employerRepository.findByCompanyName(companyName);
        if (existingEmployer.isPresent()) {
            return existingEmployer.get();
        }

        // 2. If not found, create a new Employer
        Employer newEmployer = new Employer();
        newEmployer.setCompanyName(companyName);
        newEmployer.setCompanyType(parseCompanyType(type));
        newEmployer.setIsVerified(true); // Admin-posted jobs are considered verified
        newEmployer.setVerificationStatus(Employer.VerificationStatus.APPROVED);

        // Associate with a User. This is a simplification for admin-posted jobs.
        // In a real system, an admin might select an existing employer user,
        // or there might be a dedicated 'system' user for admin postings.
        // For now, create a unique dummy user per company to avoid unique constraint violations.
        String dummyEmail = "admin+" + companyName.replaceAll("[^a-zA-Z0-9]", "_") + "@medexjob.com";
        User employerUser = userRepository.findByEmail(dummyEmail).orElseGet(() -> {
            User dummyUser = new User();
            dummyUser.setName("MedExJob Admin - " + companyName);
            dummyUser.setEmail(dummyEmail);
            dummyUser.setPhone("0000000000");
            dummyUser.setRole(User.UserRole.EMPLOYER); // Must be an EMPLOYER role
            dummyUser.setPasswordHash("dummy_password_hash"); // Placeholder, should be properly hashed
            return userRepository.save(dummyUser);
        });
        newEmployer.setUser(employerUser);

        return employerRepository.save(newEmployer);
    }

    // === START OF REQUIRED HELPER METHOD PLACEHOLDERS ===

    // Placeholder: Assumes JobStatus enum exists and has a valueOf method
    private Job.JobStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Job.JobStatus.PENDING; // keep admin submissions hidden by default
        }
        try {
            return Job.JobStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Job.JobStatus.PENDING; // fall back to pending on invalid input
        }
    }

    // Placeholder: Assumes JobSector enum exists and has a valueOf method
    private Job.JobSector parseSector(String sector) {
        if (sector == null) return null;
        try {
            return Job.JobSector.valueOf(sector.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Job.JobSector.PRIVATE; // Default or throw
        }
    }

    // Placeholder: Assumes Employer.CompanyType enum exists and has a valueOf method
    private Employer.CompanyType parseCompanyType(String type) {
        if (type == null) return null;
        try {
            return Employer.CompanyType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Employer.CompanyType.HOSPITAL; // Default or throw
        }
    }

    // Placeholder: Assumes Job.ExperienceLevel enum exists and has a valueOf method
    private Job.ExperienceLevel parseExperienceLevel(String experienceLevel) {
        if (experienceLevel == null) return null;
        try {
            return Job.ExperienceLevel.valueOf(experienceLevel.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Job.ExperienceLevel.ENTRY; // Default
        }
    }

    // Placeholder: Assumes Job.DutyType enum exists and has a valueOf method
    private Job.DutyType parseDutyType(String dutyType) {
        if (dutyType == null) return null;
        try {
            return Job.DutyType.valueOf(dutyType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Job.DutyType.FULL_TIME; // Default
        }
    }

    // Placeholder: Assumes JobCategory enum exists
    private Job.JobCategory mapCategoryFromLabel(String label) {
        if (label == null) return null;
        return switch (label.toLowerCase().trim()) {
            case "junior resident" -> Job.JobCategory.JUNIOR_RESIDENT;
            case "senior resident" -> Job.JobCategory.SENIOR_RESIDENT;
            case "medical officer" -> Job.JobCategory.MEDICAL_OFFICER;
            case "faculty" -> Job.JobCategory.FACULTY;
            case "specialist" -> Job.JobCategory.SPECIALIST;
            case "ayush" -> Job.JobCategory.AYUSH;
            case "paramedical / nursing" -> Job.JobCategory.PARAMEDICAL_NURSING;
            default -> null; // Or throw exception / handle error
        };
    }

    // === END OF REQUIRED HELPER METHOD PLACEHOLDERS ===

    private record JobRequest(
        String title,
        String organization,
        String sector,
        String category,
        String location,
        String qualification,
        String experience,
        String experienceLevel,
        String speciality,
        String dutyType,
        Integer numberOfPosts,
        String salary,
        String description,
        String lastDate,
        String requirements,
        String benefits,
        String pdfUrl,
        String applyLink,
        String status,
        Boolean featured,
        Integer views,
        Integer applications,
        String contactEmail,
        String contactPhone,
        String type
    ) {}

    private Map<String, Object> toResponse(Job j) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", j.getId().toString());
        m.put("title", j.getTitle());
        String organization = "";
        UUID employerId = null;
        try {
            Employer emp = j.getEmployer();
            if (emp != null) {
                organization = Optional.ofNullable(emp.getCompanyName()).orElse("");
                employerId = emp.getId();
            }
        } catch (Exception ignored) {}
        m.put("organization", organization);
        m.put("employerId", employerId != null ? employerId.toString() : null);
        m.put("sector", j.getSector() == Job.JobSector.GOVERNMENT ? "government" : "private");
        m.put("category", mapCategoryToLabel(j.getCategory()));
        m.put("location", j.getLocation());
        m.put("qualification", j.getQualification());
        m.put("experience", j.getExperience());
        m.put("experienceLevel", j.getExperienceLevel() != null ? j.getExperienceLevel().name().toLowerCase() : null);
        m.put("speciality", j.getSpeciality());
        m.put("dutyType", j.getDutyType() != null ? j.getDutyType().name().toLowerCase() : null);
        m.put("numberOfPosts", j.getNumberOfPosts());
        m.put("salary", j.getSalaryRange());
        m.put("description", j.getDescription());
        m.put("lastDate", j.getLastDate() != null ? j.getLastDate().toString() : null);
        m.put("postedDate", j.getCreatedAt() != null ? j.getCreatedAt().toString() : null);
        m.put("pdfUrl", j.getPdfUrl());
        m.put("applyLink", j.getApplyLink());
        m.put("status", j.getStatus().name().toLowerCase());
        m.put("featured", Boolean.TRUE.equals(j.getIsFeatured()));
        m.put("views", j.getViews());
        m.put("applications", j.getApplicationsCount());
        return m;
    }

    private String mapCategoryToLabel(Job.JobCategory c) {
        if (c == null) return "";
        return switch (c) {
            case JUNIOR_RESIDENT -> "Junior Resident";
            case SENIOR_RESIDENT -> "Senior Resident";
            case MEDICAL_OFFICER -> "Medical Officer";
            case FACULTY -> "Faculty";
            case SPECIALIST -> "Specialist";
            case AYUSH -> "AYUSH";
            case PARAMEDICAL_NURSING -> "Paramedical / Nursing";
        };
    }
}