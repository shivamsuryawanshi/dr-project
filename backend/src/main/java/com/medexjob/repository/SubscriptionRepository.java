// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    // Find active subscription for user (with plan eagerly loaded)
    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan WHERE s.userId = :userId AND s.status = :status")
    Optional<Subscription> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") Subscription.SubscriptionStatus status);

    // Find current active subscription for user (with plan eagerly loaded)
    @Query("SELECT s FROM Subscription s JOIN FETCH s.plan WHERE s.userId = :userId AND s.status = 'ACTIVE' AND s.endDate >= :today ORDER BY s.endDate DESC")
    Optional<Subscription> findActiveSubscriptionByUser(@Param("userId") UUID userId, @Param("today") LocalDate today);

    // Find all subscriptions for user
    Page<Subscription> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // Find subscriptions by status
    Page<Subscription> findByStatusOrderByCreatedAtDesc(Subscription.SubscriptionStatus status, Pageable pageable);

    // Find expiring subscriptions
    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.endDate BETWEEN :startDate AND :endDate")
    List<Subscription> findExpiringSubscriptions(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Count active subscriptions
    long countByStatus(Subscription.SubscriptionStatus status);
}

