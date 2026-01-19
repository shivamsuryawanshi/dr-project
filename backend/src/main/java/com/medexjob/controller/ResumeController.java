// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.Application;
import com.medexjob.entity.Job;
import com.medexjob.entity.Resume;
import com.medexjob.entity.User;
import com.medexjob.repository.ApplicationRepository;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.ResumeRepository;
import com.medexjob.repository.UserRepository;
import com.medexjob.service.FileUploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final FileUploadService fileUploadService;

    public ResumeController(
            ResumeRepository resumeRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ApplicationRepository applicationRepository,
            FileUploadService fileUploadService) {
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.fileUploadService = fileUploadService;
    }

    /**
     * Candidate uploads resume for a specific job
     * POST /api/jobs/{jobId}/resume
     */
    @PostMapping("/{jobId}/resume")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @PathVariable UUID jobId,
            @RequestParam("file") MultipartFile file) {
        try {
            // Get authenticated user
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

            // Check if user is CANDIDATE
            if (user.getRole() != User.UserRole.CANDIDATE) {
                return ResponseEntity.status(403).body(Map.of("error", "Only candidates can upload resumes"));
            }

            // Get job
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Job job = jobOpt.get();

            // Check if job is active
            if (job.getStatus() != Job.JobStatus.ACTIVE) {
                return ResponseEntity.status(400).body(Map.of("error", "Cannot upload resume for inactive job"));
            }

            // Upload file
            String fileUrl = fileUploadService.uploadFile(file);
            String originalFilename = file.getOriginalFilename();
            String fileType = file.getContentType() != null ? file.getContentType() : "application/pdf";

            // Check if candidate already has a resume for this job
            // If yes, replace it (delete old one)
            Optional<Resume> existingResumeOpt = resumeRepository.findFirstByJobIdAndCandidateIdOrderByUploadedAtDesc(jobId, user.getId());
            if (existingResumeOpt.isPresent()) {
                Resume existingResume = existingResumeOpt.get();
                // Delete old file
                try {
                    fileUploadService.deleteFile(existingResume.getFileUrl());
                } catch (Exception e) {
                    logger.warn("Failed to delete old resume file: {}", e.getMessage());
                }
                // Delete old record
                resumeRepository.delete(existingResume);
                logger.info("Replaced existing resume for candidate: {} and job: {}", user.getId(), jobId);
            }

            // Create Resume entity
            Resume resume = new Resume(job, user, fileUrl, originalFilename, fileType);
            resume = resumeRepository.save(resume);

            logger.info("Resume uploaded: {} for job: {} by candidate: {}", resume.getId(), jobId, user.getEmail());

            return ResponseEntity.ok(toResponse(resume));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid file upload: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error uploading resume", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload resume: " + e.getMessage()));
        }
    }

    /**
     * Employee/Admin views resumes for their job
     * GET /api/jobs/{jobId}/resumes
     */
    @GetMapping("/{jobId}/resumes")
    public ResponseEntity<Map<String, Object>> getResumes(@PathVariable UUID jobId) {
        try {
            // Get authenticated user
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

            // Check if user is EMPLOYER or ADMIN
            if (user.getRole() != User.UserRole.EMPLOYER && user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only employers and admins can view resumes"));
            }

            // Get job
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Job job = jobOpt.get();

            // Verify job ownership (unless admin)
            if (user.getRole() != User.UserRole.ADMIN) {
                if (!job.getEmployer().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "You can only view resumes for your own jobs"));
                }
            }

            // Get resumes for this job
            List<Resume> resumes = resumeRepository.findByJobId(jobId);
            
            // Get applications to match with resumes
            List<Application> applications = applicationRepository.findByJobIdWithDetails(jobId);
            Map<UUID, Application> applicationMap = applications.stream()
                    .collect(Collectors.toMap(Application::getCandidateId, app -> app, (first, second) -> first));

            // Build response with resume and application info
            List<Map<String, Object>> resumesResponse = resumes.stream()
                    .map(resume -> {
                        Map<String, Object> resumeData = toResponse(resume);
                        // Add application info if exists
                        Application application = applicationMap.get(resume.getCandidate().getId());
                        if (application != null) {
                            resumeData.put("applicationId", application.getId().toString());
                            resumeData.put("applicationStatus", application.getStatus().name().toLowerCase());
                            resumeData.put("appliedDate", application.getAppliedDate().toString());
                        }
                        return resumeData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "jobId", jobId.toString(),
                    "resumes", resumesResponse,
                    "count", resumesResponse.size()
            ));
        } catch (Exception e) {
            logger.error("Error fetching resumes", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch resumes: " + e.getMessage()));
        }
    }

    /**
     * Candidate views their own resume for a job
     * GET /api/jobs/{jobId}/resume/my
     */
    @GetMapping("/{jobId}/resume/my")
    public ResponseEntity<Map<String, Object>> getMyResume(@PathVariable UUID jobId) {
        try {
            // Get authenticated user
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

            // Check if user is CANDIDATE
            if (user.getRole() != User.UserRole.CANDIDATE) {
                return ResponseEntity.status(403).body(Map.of("error", "Only candidates can view their resumes"));
            }

            // Get resume
            Optional<Resume> resumeOpt = resumeRepository.findFirstByJobIdAndCandidateIdOrderByUploadedAtDesc(jobId, user.getId());
            
            if (resumeOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "jobId", jobId.toString(),
                        "resume", null,
                        "hasResume", false
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "jobId", jobId.toString(),
                    "resume", toResponse(resumeOpt.get()),
                    "hasResume", true
            ));
        } catch (Exception e) {
            logger.error("Error fetching resume", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch resume: " + e.getMessage()));
        }
    }

    /**
     * Delete resume (Candidate/Admin only)
     * DELETE /api/jobs/{jobId}/resume/{resumeId}
     */
    @DeleteMapping("/{jobId}/resume/{resumeId}")
    public ResponseEntity<Map<String, Object>> deleteResume(
            @PathVariable UUID jobId,
            @PathVariable UUID resumeId) {
        try {
            // Get authenticated user
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

            // Get resume
            Optional<Resume> resumeOpt = resumeRepository.findById(resumeId);
            if (resumeOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Resume not found"));
            }

            Resume resume = resumeOpt.get();

            // Verify ownership (candidate can delete their own, admin can delete any)
            if (user.getRole() != User.UserRole.ADMIN) {
                if (user.getRole() != User.UserRole.CANDIDATE || !resume.getCandidate().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
            }

            // Delete file from storage
            try {
                fileUploadService.deleteFile(resume.getFileUrl());
            } catch (Exception e) {
                logger.warn("Failed to delete file from storage: {}", e.getMessage());
            }

            // Delete from database
            resumeRepository.delete(resume);

            logger.info("Resume deleted: {} for job: {}", resumeId, jobId);

            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting resume", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete resume: " + e.getMessage()));
        }
    }

    private Map<String, Object> toResponse(Resume resume) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", resume.getId().toString());
        response.put("jobId", resume.getJob().getId().toString());
        response.put("candidateId", resume.getCandidate().getId().toString());
        response.put("candidateName", resume.getCandidate().getName());
        response.put("candidateEmail", resume.getCandidate().getEmail());
        response.put("fileUrl", resume.getFileUrl());
        response.put("fileName", resume.getFileName());
        response.put("fileType", resume.getFileType());
        response.put("uploadedAt", resume.getUploadedAt().toString());
        return response;
    }
}

