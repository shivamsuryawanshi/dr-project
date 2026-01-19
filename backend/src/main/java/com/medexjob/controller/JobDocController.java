// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.Job;
import com.medexjob.entity.JobDoc;
import com.medexjob.entity.User;
import com.medexjob.repository.JobDocRepository;
import com.medexjob.repository.JobRepository;
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
public class JobDocController {

    private static final Logger logger = LoggerFactory.getLogger(JobDocController.class);

    private final JobDocRepository jobDocRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    public JobDocController(
            JobDocRepository jobDocRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            FileUploadService fileUploadService) {
        this.jobDocRepository = jobDocRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.fileUploadService = fileUploadService;
    }

    /**
     * Employee uploads job-related documents
     * POST /api/jobs/{jobId}/docs
     */
    @PostMapping("/{jobId}/docs")
    public ResponseEntity<Map<String, Object>> uploadJobDoc(
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

            // Check if user is EMPLOYER or ADMIN
            if (user.getRole() != User.UserRole.EMPLOYER && user.getRole() != User.UserRole.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Only employers and admins can upload job documents"));
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
                    return ResponseEntity.status(403).body(Map.of("error", "You can only upload documents for your own jobs"));
                }
            }

            // Upload file
            String fileUrl = fileUploadService.uploadFile(file);
            String originalFilename = file.getOriginalFilename();
            String fileType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            // Create JobDoc entity
            JobDoc jobDoc = new JobDoc(job, user, fileUrl, originalFilename, fileType);
            jobDoc = jobDocRepository.save(jobDoc);

            logger.info("Job document uploaded: {} for job: {} by user: {}", jobDoc.getId(), jobId, user.getEmail());

            return ResponseEntity.ok(toResponse(jobDoc));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid file upload: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error uploading job document", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    /**
     * Candidate/Employee/Admin views job documents
     * GET /api/jobs/{jobId}/docs
     */
    @GetMapping("/{jobId}/docs")
    public ResponseEntity<Map<String, Object>> getJobDocs(@PathVariable UUID jobId) {
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

            // Check if job exists
            Optional<Job> jobOpt = jobRepository.findById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
            }

            Job job = jobOpt.get();

            // Access control: Candidates can only see docs for jobs they're viewing/applying to
            // Employees can see docs for their own jobs
            // Admins can see all docs
            if (user.getRole() == User.UserRole.CANDIDATE) {
                // Candidates can view docs for any active job (they're viewing/applying)
                if (job.getStatus() != Job.JobStatus.ACTIVE) {
                    return ResponseEntity.status(403).body(Map.of("error", "Job is not active"));
                }
            } else if (user.getRole() == User.UserRole.EMPLOYER) {
                // Employees can only see docs for their own jobs
                if (!job.getEmployer().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
            }
            // Admin can see all docs

            // Get job documents
            List<JobDoc> jobDocs = jobDocRepository.findByJobId(jobId);
            List<Map<String, Object>> docsResponse = jobDocs.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "jobId", jobId.toString(),
                    "documents", docsResponse,
                    "count", docsResponse.size()
            ));
        } catch (Exception e) {
            logger.error("Error fetching job documents", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch documents: " + e.getMessage()));
        }
    }

    /**
     * Delete job document (Employee/Admin only)
     * DELETE /api/jobs/{jobId}/docs/{docId}
     */
    @DeleteMapping("/{jobId}/docs/{docId}")
    public ResponseEntity<Map<String, Object>> deleteJobDoc(
            @PathVariable UUID jobId,
            @PathVariable UUID docId) {
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
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Get job document
            Optional<JobDoc> docOpt = jobDocRepository.findById(docId);
            if (docOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Document not found"));
            }

            JobDoc jobDoc = docOpt.get();

            // Verify job ownership (unless admin)
            if (user.getRole() != User.UserRole.ADMIN) {
                if (!jobDoc.getJob().getEmployer().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
            }

            // Delete file from storage
            try {
                fileUploadService.deleteFile(jobDoc.getFileUrl());
            } catch (Exception e) {
                logger.warn("Failed to delete file from storage: {}", e.getMessage());
            }

            // Delete from database
            jobDocRepository.delete(jobDoc);

            logger.info("Job document deleted: {} for job: {}", docId, jobId);

            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting job document", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    private Map<String, Object> toResponse(JobDoc jobDoc) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", jobDoc.getId().toString());
        response.put("jobId", jobDoc.getJob().getId().toString());
        response.put("employeeId", jobDoc.getEmployee().getId().toString());
        response.put("employeeName", jobDoc.getEmployee().getName());
        response.put("fileUrl", jobDoc.getFileUrl());
        response.put("fileName", jobDoc.getFileName());
        response.put("fileType", jobDoc.getFileType());
        response.put("uploadedAt", jobDoc.getUploadedAt().toString());
        return response;
    }
}

