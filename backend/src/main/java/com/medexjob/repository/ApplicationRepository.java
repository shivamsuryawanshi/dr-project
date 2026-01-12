package com.medexjob.repository;

import com.medexjob.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    // Find applications by job
    Page<Application> findByJobId(UUID jobId, Pageable pageable);

    // Find applications by candidate
    Page<Application> findByCandidateId(UUID candidateId, Pageable pageable);

    // Find applications by status
    Page<Application> findByStatus(Application.ApplicationStatus status, Pageable pageable);

    // Find applications by job and status
    Page<Application> findByJobIdAndStatus(UUID jobId, Application.ApplicationStatus status, Pageable pageable);

    // Find applications by candidate and status
    Page<Application> findByCandidateIdAndStatus(UUID candidateId, Application.ApplicationStatus status, Pageable pageable);

    // Count applications by job
    long countByJobId(UUID jobId);

    // Count applications by status
    long countByStatus(Application.ApplicationStatus status);

    // Count applications by job and status
    long countByJobIdAndStatus(UUID jobId, Application.ApplicationStatus status);

    // Find applications with job details for admin view
    @Query("SELECT a FROM Application a JOIN FETCH a.job WHERE a.job.id = :jobId")
    List<Application> findByJobIdWithJobDetails(@Param("jobId") UUID jobId);

    // Search applications by candidate name or email
    @Query("SELECT a FROM Application a WHERE " +
           "LOWER(a.candidateName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.candidateEmail) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Application> searchApplications(@Param("keyword") String keyword, Pageable pageable);
}
