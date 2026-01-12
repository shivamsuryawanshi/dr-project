package com.medexjob.repository;

import com.medexjob.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    
    // Find jobs by status
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    
    // Find jobs by sector
    Page<Job> findBySector(Job.JobSector sector, Pageable pageable);
    
    // Find jobs by category
    Page<Job> findByCategory(Job.JobCategory category, Pageable pageable);
    
    // Find jobs by location
    Page<Job> findByLocationContainingIgnoreCase(String location, Pageable pageable);
    
    // Find featured jobs
    Page<Job> findByIsFeaturedTrueAndStatus(Job.JobStatus status, Pageable pageable);
    
    // Find jobs by employer
    List<Job> findByEmployerId(UUID employerId);
    
    // Find active jobs
    Page<Job> findByStatusAndLastDateAfter(Job.JobStatus status, LocalDate date, Pageable pageable);
    
    // Search jobs by title or description
    @Query("SELECT j FROM Job j WHERE (LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR j.status = :status)")
    Page<Job> searchJobs(@Param("keyword") String keyword, @Param("status") Job.JobStatus status, Pageable pageable);
    
    // Find jobs by multiple criteria
    @Query("SELECT j FROM Job j WHERE " +
           "(:sector IS NULL OR j.sector = :sector) AND " +
           "(:category IS NULL OR j.category = :category) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) AND " +
           "(:speciality IS NULL OR LOWER(j.speciality) LIKE LOWER(CONCAT('%', :speciality, '%'))) AND " +
           "(:dutyType IS NULL OR j.dutyType = :dutyType) AND " +
           "(:status IS NULL OR j.status = :status)")
    Page<Job> findJobsByCriteria(@Param("sector") Job.JobSector sector,
                                 @Param("category") Job.JobCategory category,
                                 @Param("location") String location,
                                 @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
                                 @Param("speciality") String speciality,
                                 @Param("dutyType") Job.DutyType dutyType,
                                 @Param("status") Job.JobStatus status,
                                 Pageable pageable);
    
    // Count jobs by status
    long countByStatus(Job.JobStatus status);
    
    // Count jobs by employer
    long countByEmployerId(UUID employerId);
    
    // Find jobs expiring soon
    @Query("SELECT j FROM Job j WHERE j.lastDate BETWEEN :startDate AND :endDate AND j.status = :status")
    List<Job> findJobsExpiringSoon(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   @Param("status") Job.JobStatus status);
    
    // Find top viewed jobs
    @Query("SELECT j FROM Job j WHERE j.status = :status ORDER BY j.views DESC")
    Page<Job> findTopViewedJobs(@Param("status") Job.JobStatus status, Pageable pageable);
    
    // Find jobs with most applications
    @Query("SELECT j FROM Job j WHERE j.status = :status ORDER BY j.applicationsCount DESC")
    Page<Job> findJobsWithMostApplications(@Param("status") Job.JobStatus status, Pageable pageable);

    // Distinct categories (for meta)
    @Query("SELECT DISTINCT j.category FROM Job j WHERE j.category IS NOT NULL")
    List<Job.JobCategory> findDistinctCategories();

    // Distinct locations (for meta)
    @Query("SELECT DISTINCT j.location FROM Job j WHERE j.location IS NOT NULL AND j.location <> ''")
    List<String> findDistinctLocations();
}










