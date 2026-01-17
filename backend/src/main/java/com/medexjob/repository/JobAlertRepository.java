// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.JobAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobAlertRepository extends JpaRepository<JobAlert, UUID> {

    // Find alerts by user
    Page<JobAlert> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // Find active alerts by user
    List<JobAlert> findByUserIdAndActiveTrue(UUID userId);

    // Find all active alerts (for job matching)
    List<JobAlert> findByActiveTrue();

    // Count alerts by user
    long countByUserId(UUID userId);

    // Count active alerts by user
    long countByUserIdAndActiveTrue(UUID userId);
}

