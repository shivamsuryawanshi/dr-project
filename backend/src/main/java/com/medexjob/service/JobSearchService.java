package com.medexjob.service;

import com.medexjob.entity.Job;
import com.medexjob.repository.JobRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobSearchService {
    
    private final JobRepository jobRepository;
    
    public JobSearchService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }
    
    /**
     * Enhanced search that splits query into words and matches ALL words (AND logic)
     * Like Google/YouTube search - all words must be present somewhere in the job fields
     */
    @Transactional(readOnly = true)
    public Page<Job> searchJobsAdvanced(String searchQuery, String location, Job.JobStatus status, Pageable pageable) {
        if (searchQuery == null || searchQuery.isBlank()) {
            if (location != null && !location.isBlank()) {
                return jobRepository.findByLocationContainingIgnoreCase(location, pageable);
            }
            return jobRepository.findAll(pageable);
        }
        
        // Split search query into individual words (remove empty strings)
        List<String> words = Arrays.stream(searchQuery.trim().split("\\s+"))
                .filter(word -> !word.isBlank())
                .map(String::trim)
                .collect(Collectors.toList());
        
        if (words.isEmpty()) {
            return jobRepository.findAll(pageable);
        }
        
        // For single word, use the existing optimized query
        if (words.size() == 1) {
            String keyword = words.get(0);
            if (location != null && !location.isBlank()) {
                return jobRepository.searchJobsWithLocation(keyword, location.trim(), status, pageable);
            } else {
                return jobRepository.searchJobs(keyword, status, pageable);
            }
        }
        
        // For multiple words, we need to match ALL words (AND logic)
        // Use native query approach - search for jobs that contain all words
        // This is more complex, so we'll use a different strategy:
        // 1. Search with the full phrase first (exact match gets priority)
        // 2. Then search with individual words and filter results
        
        String fullPhrase = searchQuery.trim();
        Page<Job> result;
        
        if (location != null && !location.isBlank()) {
            // Try full phrase search first
            result = jobRepository.searchJobsWithLocation(fullPhrase, location.trim(), status, pageable);
            
            // If no results or need more, search with individual words
            if (result.getContent().isEmpty() || result.getTotalElements() < pageable.getPageSize()) {
                // Search with first word and filter by location
                Page<Job> firstWordResults = jobRepository.searchJobsWithLocation(words.get(0), location.trim(), status, pageable);
                
                // Filter to only include jobs that contain ALL words
                List<Job> filteredJobs = firstWordResults.getContent().stream()
                        .filter(job -> containsAllWords(job, words))
                        .collect(Collectors.toList());
                
                // Note: This approach has limitations with pagination
                // For production, consider using full-text search or Elasticsearch
                return createFilteredPage(filteredJobs, pageable, firstWordResults.getTotalElements());
            }
        } else {
            // Try full phrase search first
            result = jobRepository.searchJobs(fullPhrase, status, pageable);
            
            // If no results or need more, search with individual words
            if (result.getContent().isEmpty() || result.getTotalElements() < pageable.getPageSize()) {
                // Search with first word
                Page<Job> firstWordResults = jobRepository.searchJobs(words.get(0), status, pageable);
                
                // Filter to only include jobs that contain ALL words
                List<Job> filteredJobs = firstWordResults.getContent().stream()
                        .filter(job -> containsAllWords(job, words))
                        .collect(Collectors.toList());
                
                return createFilteredPage(filteredJobs, pageable, firstWordResults.getTotalElements());
            }
        }
        
        return result;
    }
    
    /**
     * Check if a job contains all search words in any of its searchable fields
     */
    private boolean containsAllWords(Job job, List<String> words) {
        String searchableText = buildSearchableText(job);
        String lowerSearchableText = searchableText.toLowerCase();
        
        return words.stream()
                .allMatch(word -> lowerSearchableText.contains(word.toLowerCase()));
    }
    
    /**
     * Build a searchable text string from all relevant job fields
     */
    private String buildSearchableText(Job job) {
        StringBuilder sb = new StringBuilder();
        
        if (job.getTitle() != null) sb.append(job.getTitle()).append(" ");
        if (job.getDescription() != null) sb.append(job.getDescription()).append(" ");
        if (job.getQualification() != null) sb.append(job.getQualification()).append(" ");
        if (job.getSpeciality() != null) sb.append(job.getSpeciality()).append(" ");
        if (job.getRequirements() != null) sb.append(job.getRequirements()).append(" ");
        if (job.getBenefits() != null) sb.append(job.getBenefits()).append(" ");
        if (job.getLocation() != null) sb.append(job.getLocation()).append(" ");
        if (job.getEmployer() != null && job.getEmployer().getCompanyName() != null) {
            sb.append(job.getEmployer().getCompanyName()).append(" ");
        }
        
        return sb.toString();
    }
    
    /**
     * Create a filtered page from a list of jobs
     * Note: This is a simplified pagination - for production, use proper pagination
     */
    private Page<Job> createFilteredPage(List<Job> jobs, Pageable pageable, long totalElements) {
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int start = page * size;
        int end = Math.min(start + size, jobs.size());
        
        List<Job> pagedJobs = start < jobs.size() ? jobs.subList(start, end) : List.of();
        
        return new org.springframework.data.domain.PageImpl<>(
                pagedJobs,
                pageable,
                Math.min(jobs.size(), totalElements)
        );
    }
}

