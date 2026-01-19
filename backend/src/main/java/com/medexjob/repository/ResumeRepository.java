// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByJobId(UUID jobId);
    List<Resume> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);
    Optional<Resume> findFirstByJobIdAndCandidateIdOrderByUploadedAtDesc(UUID jobId, UUID candidateId);
    void deleteByJobId(UUID jobId);
}

