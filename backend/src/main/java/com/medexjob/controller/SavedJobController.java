// AI assisted development
package com.medexjob.controller;

import com.medexjob.entity.SavedJob;
import com.medexjob.entity.Job;
import com.medexjob.repository.SavedJobRepository;
import com.medexjob.repository.JobRepository;
import com.medexjob.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AuthService authService;

    // Save a job
    @PostMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Transactional
    public ResponseEntity<?> saveJob(@PathVariable UUID jobId) {
        try {
            UUID candidateId = authService.getCurrentUser().getId();
            
            // Check if job exists
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Check if already saved
            if (savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Job is already saved");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            // Save the job
            SavedJob savedJob = new SavedJob(candidateId, job);
            savedJob = savedJobRepository.save(savedJob);
            savedJobRepository.flush(); // Ensure save is committed
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Job saved successfully");
            response.put("savedJobId", savedJob.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Unsave a job
    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Transactional
    public ResponseEntity<?> unsaveJob(@PathVariable UUID jobId) {
        try {
            UUID candidateId = authService.getCurrentUser().getId();
            
            // Find the saved job first
            Optional<SavedJob> savedJobOpt = savedJobRepository.findByCandidateIdAndJobId(candidateId, jobId);
            
            if (!savedJobOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Job is not saved");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            // Delete the saved job using the entity
            SavedJob savedJob = savedJobOpt.get();
            savedJobRepository.delete(savedJob);
            savedJobRepository.flush(); // Ensure deletion is committed
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Job unsaved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get all saved jobs for current user
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            UUID candidateId = authService.getCurrentUser().getId();
            Pageable pageable = PageRequest.of(page, size);
            
            // This will use @EntityGraph to eagerly load job
            Page<SavedJob> savedJobsPage = savedJobRepository.findByCandidateId(candidateId, pageable);
            
            List<Map<String, Object>> savedJobs = savedJobsPage.getContent().stream()
                    .map(savedJob -> {
                        // Job is already loaded due to @EntityGraph
                        Job job = savedJob.getJob();
                        Map<String, Object> jobMap = new HashMap<>();
                        jobMap.put("id", job.getId().toString()); // Convert UUID to String
                        jobMap.put("title", job.getTitle());
                        jobMap.put("description", job.getDescription());
                        jobMap.put("sector", job.getSector().name().toLowerCase());
                        jobMap.put("category", job.getCategory().name());
                        jobMap.put("location", job.getLocation());
                        jobMap.put("qualification", job.getQualification());
                        jobMap.put("experience", job.getExperience());
                        jobMap.put("salaryRange", job.getSalaryRange());
                        jobMap.put("salary", job.getSalaryRange()); // Also add as 'salary' for compatibility
                        jobMap.put("numberOfPosts", job.getNumberOfPosts());
                        jobMap.put("lastDate", job.getLastDate() != null ? job.getLastDate().toString() : null);
                        jobMap.put("postedDate", job.getCreatedAt() != null ? job.getCreatedAt().toString() : null);
                        jobMap.put("status", job.getStatus().name().toLowerCase());
                        jobMap.put("isFeatured", job.getIsFeatured());
                        jobMap.put("featured", job.getIsFeatured()); // Also add as 'featured' for compatibility
                        jobMap.put("views", job.getViews());
                        jobMap.put("applications", job.getApplicationsCount());
                        jobMap.put("applicationsCount", job.getApplicationsCount()); // Also add as 'applicationsCount'
                        
                        // Get organization name
                        String organization = "";
                        try {
                            if (job.getEmployer() != null) {
                                organization = job.getEmployer().getCompanyName();
                            }
                        } catch (Exception e) {
                            System.err.println("Error getting employer for job: " + job.getId() + ", Error: " + e.getMessage());
                        }
                        jobMap.put("organization", organization != null ? organization : "");
                        
                        jobMap.put("savedAt", savedJob.getCreatedAt() != null ? savedJob.getCreatedAt().toString() : null);
                        return jobMap;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", savedJobs);
            response.put("totalElements", savedJobsPage.getTotalElements());
            response.put("totalPages", savedJobsPage.getTotalPages());
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Check if job is saved
    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> checkIfSaved(@PathVariable UUID jobId) {
        try {
            UUID candidateId = authService.getCurrentUser().getId();
            boolean isSaved = savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isSaved", isSaved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

