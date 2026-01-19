// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.JobDoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobDocRepository extends JpaRepository<JobDoc, UUID> {
    List<JobDoc> findByJobId(UUID jobId);
    List<JobDoc> findByJobIdAndEmployeeId(UUID jobId, UUID employeeId);
    void deleteByJobId(UUID jobId);
}

