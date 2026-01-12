package com.medexjob.controller;

import com.medexjob.entity.Application;
import com.medexjob.entity.Job;
import com.medexjob.repository.ApplicationRepository;
import com.medexjob.repository.JobRepository;
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
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final Path uploadPath = Paths.get("uploads");

    public ApplicationController(ApplicationRepository applicationRepository, JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
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
                        Application application = new Application();
                        application.setJob(job);
                        application.setCandidateName(candidateName);
                        application.setCandidateEmail(candidateEmail);
                        application.setCandidatePhone(candidatePhone);
                        application.setNotes(notes);
                        application.setStatus(Application.ApplicationStatus.APPLIED);

                        // Handle resume upload
                        if (resume != null && !resume.isEmpty()) {
                            String fileName = UUID.randomUUID() + "_" + resume.getOriginalFilename();
                            Path filePath = uploadPath.resolve(fileName);
                            Files.copy(resume.getInputStream(), filePath);
                            application.setResumeUrl("/uploads/" + fileName);
                        }

                        Application saved = applicationRepository.save(application);

                        // Update job applications count
                        job.setApplicationsCount(job.getApplicationsCount() + 1);
                        jobRepository.save(job);

                        Map<String, Object> response = new HashMap<>();
                        response.put("id", saved.getId().toString());
                        response.put("message", "Application submitted successfully!");
                        response.put("status", "success");
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
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(value = "jobId", required = false) UUID jobId,
            @RequestParam(value = "candidateId", required = false) UUID candidateId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sort", defaultValue = "appliedDate,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction dir = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<Application> result;

        if (jobId != null) {
            if (status != null) {
                Application.ApplicationStatus appStatus = parseStatus(status);
                result = applicationRepository.findByJobIdAndStatus(jobId, appStatus, pageable);
            } else {
                result = applicationRepository.findByJobId(jobId, pageable);
            }
        } else if (candidateId != null) {
            if (status != null) {
                Application.ApplicationStatus appStatus = parseStatus(status);
                result = applicationRepository.findByCandidateIdAndStatus(candidateId, appStatus, pageable);
            } else {
                result = applicationRepository.findByCandidateId(candidateId, pageable);
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

                    if (statusStr != null) {
                        Application.ApplicationStatus newStatus = parseStatus(statusStr);
                        application.setStatus(newStatus);
                    }

                    if (notes != null) {
                        application.setNotes(notes);
                    }

                    // Handle interview date for interview status
                    if ("interview".equals(statusStr) && request.containsKey("interviewDate")) {
                        String interviewDateStr = (String) request.get("interviewDate");
                        try {
                            LocalDateTime interviewDate = LocalDateTime.parse(interviewDateStr);
                            application.setInterviewDate(interviewDate);
                        } catch (Exception e) {
                            // Handle parsing error
                        }
                    }

                    Application saved = applicationRepository.save(application);
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
        m.put("id", app.getId().toString());
        m.put("jobId", app.getJob().getId().toString());
        m.put("jobTitle", app.getJob().getTitle());
        m.put("jobOrganization", app.getJob().getEmployer() != null ? app.getJob().getEmployer().getCompanyName() : "");
        m.put("candidateId", app.getCandidateId() != null ? app.getCandidateId().toString() : null);
        m.put("candidateName", app.getCandidateName());
        m.put("candidateEmail", app.getCandidateEmail());
        m.put("candidatePhone", app.getCandidatePhone());
        m.put("resumeUrl", app.getResumeUrl());
        m.put("status", app.getStatus().name().toLowerCase());
        m.put("notes", app.getNotes());
        m.put("interviewDate", app.getInterviewDate() != null ? app.getInterviewDate().toString() : null);
        m.put("appliedDate", app.getAppliedDate() != null ? app.getAppliedDate().toString() : null);
        return m;
    }
}
