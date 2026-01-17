// AI assisted development
package com.medexjob.repository;

import com.medexjob.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {

    // Find active plans
    List<SubscriptionPlan> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Find plan by name
    java.util.Optional<SubscriptionPlan> findByName(String name);
}

