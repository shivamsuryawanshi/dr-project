package com.medexjob.service;

import com.medexjob.entity.Job;
import com.medexjob.repository.JobRepository;
import com.medexjob.repository.JobSpecifications;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

/**
 * Service for advanced job search using JPA Specifications.
 * Provides dynamic filtering that only applies criteria when values are present.
 */
@Service
public class JobSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(JobSearchService.class);
    
    private final JobRepository jobRepository;
    
    public JobSearchService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }
    
    /**
     * Advanced search using JPA Specifications for dynamic filtering.
     * 
     * Key features:
     * - Only applies filters when values are present (not null/empty)
     * - Case-insensitive partial matching for text fields
     * - Searches across: title, company name, description, speciality, qualification
     * - Properly handles status enum comparison
     * 
     * @param searchQuery The search term (can be job title or company name)
     * @param location The location filter
     * @param status The job status filter
     * @param pageable Pagination parameters
     * @return Page of matching jobs
     */
    @Transactional(readOnly = true)
    public Page<Job> searchJobsAdvanced(String searchQuery, String location, Job.JobStatus status, Pageable pageable) {
        // Comprehensive logging for debugging
        logger.info("╔══════════════════════════════════════════════════════════════╗");
        logger.info("║              JOB SEARCH SERVICE - DEBUG                      ║");
        logger.info("╠══════════════════════════════════════════════════════════════╣");
        logger.info("║ Input Parameters:                                            ║");
        logger.info("║   searchQuery: '{}' (length: {}, isBlank: {})", 
            searchQuery, 
            searchQuery != null ? searchQuery.length() : 0,
            searchQuery == null || searchQuery.isBlank());
        logger.info("║   location: '{}' (length: {}, isBlank: {})", 
            location,
            location != null ? location.length() : 0,
            location == null || location.isBlank());
        logger.info("║   status: {} (enum value)", status);
        logger.info("║   pageable: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        
        // Log byte representation to detect encoding issues
        if (searchQuery != null && !searchQuery.isEmpty()) {
            logger.info("║   searchQuery bytes: {}", Arrays.toString(searchQuery.getBytes()));
        }
        
        // Sanitize inputs
        String sanitizedSearch = sanitizeInput(searchQuery);
        String sanitizedLocation = sanitizeInput(location);
        
        logger.info("║ Sanitized Parameters:                                        ║");
        logger.info("║   sanitizedSearch: '{}' (length: {})", 
            sanitizedSearch, 
            sanitizedSearch != null ? sanitizedSearch.length() : 0);
        logger.info("║   sanitizedLocation: '{}' (length: {})", 
            sanitizedLocation,
            sanitizedLocation != null ? sanitizedLocation.length() : 0);
        
        // Build specification
        Specification<Job> spec = JobSpecifications.buildSearchSpec(sanitizedSearch, sanitizedLocation, status);
        
        logger.info("║ Executing query with Specification...                        ║");
        
        // Execute query
        Page<Job> result = jobRepository.findAll(spec, pageable);
        
        logger.info("╠══════════════════════════════════════════════════════════════╣");
        logger.info("║ Query Results:                                               ║");
        logger.info("║   Total elements: {}", result.getTotalElements());
        logger.info("║   Total pages: {}", result.getTotalPages());
        logger.info("║   Current page content size: {}", result.getContent().size());
        
        // Log first few results for verification
        if (!result.getContent().isEmpty()) {
            logger.info("║ Sample Results (first 3):                                    ║");
            result.getContent().stream().limit(3).forEach(job -> {
                String companyName = job.getEmployer() != null ? job.getEmployer().getCompanyName() : "N/A";
                logger.info("║   - Title: '{}', Company: '{}', Status: {}", 
                    job.getTitle(), companyName, job.getStatus());
            });
        } else {
            logger.info("║   No jobs found matching criteria                            ║");
            
            // Additional debugging when no results
            logger.info("║ Debugging - checking database state:                         ║");
            long totalJobs = jobRepository.count();
            long activeJobs = jobRepository.countByStatus(Job.JobStatus.ACTIVE);
            logger.info("║   Total jobs in DB: {}", totalJobs);
            logger.info("║   Active jobs in DB: {}", activeJobs);
            
            // If we have active jobs but no results, the filter might be too restrictive
            if (activeJobs > 0 && sanitizedSearch != null) {
                logger.info("║   Possible issue: Search term '{}' may not match any titles", sanitizedSearch);
                // Try to find similar titles
                var titles = jobRepository.findDistinctTitlesByStatus(Job.JobStatus.ACTIVE);
                logger.info("║   Available titles in DB: {}", titles.size() > 5 ? titles.subList(0, 5) + "..." : titles);
            }
        }
        
        logger.info("╚══════════════════════════════════════════════════════════════╝");
        
        return result;
    }
    
    /**
     * Sanitize input by trimming whitespace and handling null values.
     * Returns null if input is null or blank after trimming.
     */
    private String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
    
    /**
     * Search jobs by title only (for exact dropdown selection).
     */
    @Transactional(readOnly = true)
    public Page<Job> searchByTitle(String title, Job.JobStatus status, Pageable pageable) {
        logger.info("Searching by title: '{}', status: {}", title, status);
        
        Specification<Job> spec = Specification
            .where(JobSpecifications.titleContains(title))
            .and(JobSpecifications.hasStatus(status));
        
        return jobRepository.findAll(spec, pageable);
    }
    
    /**
     * Search jobs by company name only.
     */
    @Transactional(readOnly = true)
    public Page<Job> searchByCompany(String companyName, Job.JobStatus status, Pageable pageable) {
        logger.info("Searching by company: '{}', status: {}", companyName, status);
        
        Specification<Job> spec = Specification
            .where(JobSpecifications.companyNameContains(companyName))
            .and(JobSpecifications.hasStatus(status));
        
        return jobRepository.findAll(spec, pageable);
    }
    
    /**
     * Search jobs by location only.
     */
    @Transactional(readOnly = true)
    public Page<Job> searchByLocation(String location, Job.JobStatus status, Pageable pageable) {
        logger.info("Searching by location: '{}', status: {}", location, status);
        
        Specification<Job> spec = Specification
            .where(JobSpecifications.locationContains(location))
            .and(JobSpecifications.hasStatus(status));
        
        return jobRepository.findAll(spec, pageable);
    }
}
