package com.medexjob.repository;

import com.medexjob.entity.Employer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, UUID> {
    Optional<Employer> findByCompanyName(String companyName);
    
    // Find employer by user ID with eager loading
    @Query("SELECT e FROM Employer e JOIN FETCH e.user WHERE e.user.id = :userId")
    Optional<Employer> findByUserId(@Param("userId") UUID userId);
    
    // Note: JOIN FETCH with Pageable can cause issues, so we'll fetch all and paginate in memory
    // For better performance with large datasets, consider using EntityGraph or separate queries
    @Query("SELECT DISTINCT e FROM Employer e JOIN FETCH e.user")
    List<Employer> findAllEmployers();
    
    @Query("SELECT DISTINCT e FROM Employer e JOIN FETCH e.user WHERE e.verificationStatus = :status")
    List<Employer> findByVerificationStatusList(@Param("status") Employer.VerificationStatus status);
    
    // Find employer by ID with eager loading of user
    @Query("SELECT DISTINCT e FROM Employer e JOIN FETCH e.user WHERE e.id = :id")
    Optional<Employer> findByIdWithUser(@Param("id") UUID id);
}
