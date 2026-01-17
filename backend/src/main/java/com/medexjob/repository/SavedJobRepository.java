// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    
    // Find saved jobs by candidate ID with job and employer entity graph
    @EntityGraph(attributePaths = {"job", "job.employer"})
    @Query("SELECT sj FROM SavedJob sj WHERE sj.candidateId = :candidateId")
    Page<SavedJob> findByCandidateId(@Param("candidateId") UUID candidateId, Pageable pageable);
    
    // Find all saved jobs by candidate ID (without pagination)
    List<SavedJob> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);
    
    // Check if job is saved by candidate
    boolean existsByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    
    // Find specific saved job
    Optional<SavedJob> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    
    // Count saved jobs by candidate
    long countByCandidateId(UUID candidateId);
    
    // Delete saved job by candidate and job
    void deleteByCandidateIdAndJobId(UUID candidateId, UUID jobId);
}

