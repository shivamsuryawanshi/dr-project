package com.medexjob.controller;

import com.medexjob.entity.Employer;
import com.medexjob.entity.User;
import com.medexjob.repository.UserRepository;
import com.medexjob.entity.Job;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.EmployerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Contains @CrossOrigin

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}) // Allow both ports
public class JobController {

    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository; // Inject UserRepository

    public JobController(JobRepository jobRepository, EmployerRepository employerRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.employerRepository = employerRepository;
        this.userRepository = userRepository;
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
        String[] sortParts = sort.split(",");
        Sort.Direction dir = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<Job> result;

        // Parse status filter: if status is 'all' or null, don't filter by status
        Job.JobStatus statusFilter = (status != null && !status.equalsIgnoreCase("all")) ? parseStatus(status) : null;

        Job.ExperienceLevel expLevel = (experienceLevel != null && !experienceLevel.isBlank()) ? parseExperienceLevel(experienceLevel) : null;
        Job.DutyType duty = (dutyType != null && !dutyType.isBlank()) ? parseDutyType(dutyType) : null;

        if (Boolean.TRUE.equals(featured)) {
            result = jobRepository.findByIsFeaturedTrueAndStatus(statusFilter != null ? statusFilter : Job.JobStatus.ACTIVE, pageable);
        } else if (search != null && !search.isBlank()) {
            result = jobRepository.searchJobs(search.trim(), statusFilter, pageable);
        } else if (sector != null || category != null || location != null || expLevel != null || speciality != null || duty != null) {
            Job.JobSector s = (sector != null && !sector.isBlank()) ? parseSector(sector) : null;
            Job.JobCategory c = (category != null && !category.isBlank()) ? mapCategoryFromLabel(category) : null;
            result = jobRepository.findJobsByCriteria(s, c, location, expLevel, speciality, duty, statusFilter, pageable);
        } else {
            result = statusFilter != null ? jobRepository.findByStatus(statusFilter, pageable) : jobRepository.findByStatus(Job.JobStatus.ACTIVE, pageable);
        }

        Map<String, Object> body = new HashMap<>();
        body.put("content", result.getContent().stream().map(this::toResponse).collect(Collectors.toList()));
        body.put("page", result.getNumber());
        body.put("size", result.getSize());
        body.put("totalElements", result.getTotalElements());
        body.put("totalPages", result.getTotalPages());
        return ResponseEntity.ok(body);
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

    // Admin: Create Job
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody JobRequest req) {
        Job job = new Job();
        applyRequestToJob(req, job);
        job.setStatus(parseStatus(req.status()));
        job.setIsFeatured(Boolean.TRUE.equals(req.featured()));
        job.setViews(Optional.ofNullable(req.views()).orElse(0));
        job.setApplicationsCount(Optional.ofNullable(req.applications()).orElse(0));
        Job saved = jobRepository.save(job);
        return ResponseEntity.ok(toResponse(saved));
    }

    // Admin: Update Job
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable("id") UUID id, @RequestBody JobRequest req) {
        return jobRepository.findById(id)
                .map(existing -> {
                    applyRequestToJob(req, existing);
                    if (req.status() != null) existing.setStatus(parseStatus(req.status()));
                    if (req.featured() != null) existing.setIsFeatured(req.featured());
                    if (req.views() != null) existing.setViews(req.views());
                    if (req.applications() != null) existing.setApplicationsCount(req.applications());
                    Job saved = jobRepository.save(existing);
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
    private void applyRequestToJob(JobRequest req, Job job) {
        // Employer from organization + type
        Employer employer = resolveOrCreateEmployer(req.organization(), req.type());
        job.setEmployer(employer);

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
        try {
            Employer emp = j.getEmployer();
            if (emp != null) organization = Optional.ofNullable(emp.getCompanyName()).orElse("");
        } catch (Exception ignored) {}
        m.put("organization", organization);
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