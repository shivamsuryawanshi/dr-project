// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.FraudReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FraudReportRepository extends JpaRepository<FraudReport, UUID> {

    // Find reports by reporter
    Page<FraudReport> findByReporterIdOrderByCreatedAtDesc(UUID reporterId, Pageable pageable);

    // Find reports by status
    Page<FraudReport> findByStatusOrderByCreatedAtDesc(FraudReport.ReportStatus status, Pageable pageable);

    // Find reports by priority
    Page<FraudReport> findByPriorityOrderByCreatedAtDesc(FraudReport.ReportPriority priority, Pageable pageable);

    // Find reports by type
    Page<FraudReport> findByTypeOrderByCreatedAtDesc(FraudReport.ReportType type, Pageable pageable);

    // Find reports by job
    List<FraudReport> findByJobId(UUID jobId);

    // Find reports by employer
    List<FraudReport> findByEmployerId(UUID employerId);

    // Count reports by status
    long countByStatus(FraudReport.ReportStatus status);

    // Count reports by priority
    long countByPriority(FraudReport.ReportPriority priority);
}

